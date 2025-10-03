<script setup lang="ts">
import { useScheduleStore } from "../stores/scheduleStore";
import classCard from "../component/classCard.vue"
import { useMessage, NScrollbar, NEllipsis } from "naive-ui";
import { ref, onMounted, useTemplateRef, watch, computed } from "vue";
import * as tool from '../tools/tool'
import emitter from "../tools/mitt";

// tauri api
import { currentMonitor, LogicalPosition } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { TrayIcon, type TrayIconOptions } from '@tauri-apps/api/tray';
import * as app from '@tauri-apps/api/app';
import { Menu, MenuItem } from '@tauri-apps/api/menu';
import { exit } from '@tauri-apps/plugin-process';
import { openUrl } from "@tauri-apps/plugin-opener";

// 小组件
import daysLeft from "../component/widgets/daysLeft.vue";
import clock from "../component/widgets/clock.vue";

let updateInfo = ref<UpdateInfo>();
let outerEle = useTemplateRef('outerEle')
window.$outerScrollbar = useTemplateRef('outerScrollbar')

const NMessage = useMessage();
const scheduleStore = useScheduleStore();
const thisWindow = getCurrentWebviewWindow();

function getWidgetComponent(id: string) {
    switch (id) {
        case 'daysLeft':
            return daysLeft
        case 'clock':
            return clock
        default:
            return 'div'
    }
}
const widgets = computed(() => {
    return scheduleStore.widgets.map(i => {
        return {
            ...i,
            id: getWidgetComponent(i.id)
        }
    })
})
// 根据缩放设置窗口大小
async function initWindowSize() {
    let monitor = await currentMonitor()
    if (!monitor) {
        return
    }

    // 转换为逻辑坐标
    let monitorSize = monitor.size.toLogical(monitor.scaleFactor)
    let innerSize = (await thisWindow.innerSize()).toLogical(monitor.scaleFactor)

    // 计算窗口大小
    innerSize.height = Math.floor(monitorSize.height * 2.8 / 4)
    innerSize.width = Math.floor(170 * (scheduleStore?.zoom ?? 1))

    await thisWindow.setZoom(scheduleStore?.zoom ?? 1)
    await thisWindow.setSize(innerSize)

    // 设置窗口位置
    let outerSize = (await thisWindow.outerSize()).toLogical(monitor.scaleFactor)
    await thisWindow.setPosition(new LogicalPosition(monitorSize.width - outerSize.width, 0))
}
async function initWindow() {
    // 立即初始化窗口大小，并监听缩放比例变化，实时更新窗口大小
    watch(() => scheduleStore.zoom, initWindowSize, { immediate: true })
    // 禁用 Ctrl+P
    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "p") {
            e.preventDefault();
            e.stopPropagation();
        }
    });
    const menu = await Menu.new({
        items: [
            {
                id: 'copyright',
                text: '© 2025-至今 丸子',
                enabled: false,
            },
            {
                id: 'version',
                text: '版本：v' + await app.getVersion(),
                enabled: false,
            },
            {
                id: 'github',
                text: '前往GitHub项目页',
                action: async () => {
                    await openUrl("https://github.com/xwzkj/CheeseSchedule")
                },
            },
            {
                item: 'Separator'// 分割线
            },
            {
                id: 'quit',
                text: '退出',
                action: async () => {
                    await exit(0);
                },

            },
        ],
    });

    const options: TrayIconOptions = {
        icon: await app.defaultWindowIcon() as any,
        menu,
        menuOnLeftClick: false,
        action: async (event) => {
            if (event.type == 'Click' && event.button == 'Left' && event.buttonState == 'Up') {
                let formerWindow = await WebviewWindow.getByLabel('editor')
                if (formerWindow) {
                    await formerWindow.unminimize();
                    await formerWindow.setFocus();
                    console.log("焦点了一个已存在的编辑窗口");
                } else {
                    let editWindow = new WebviewWindow('editor', {
                        url: "/#/editor",
                        title: "奶酪课程表编辑器",
                        center: true,
                        width: 900,
                        height: 800,
                        focus: true,
                        dragDropEnabled: false, // 启用html5拖拽
                    })
                    editWindow.once("tauri://webview-created", async () => {
                        await editWindow.setFocus();
                        console.log("新建并焦点了一个编辑窗口");
                    })
                }
            }
        }
    };

    const tray = await TrayIcon.new(options);
    window.addEventListener("beforeunload", () => {
        tray.close()// 防止生成多个托盘图标
    })
    // 检查更新=====================================================================================
    updateInfo.value = await tool.checkUpdate()
    // updateInfo.value.hasUpdate = true // 调试用
    if (updateInfo.value && updateInfo.value.hasUpdate) {
        console.log("有新版本", updateInfo.value);
        NMessage.success("有新版本，请前往托盘菜单更新", { duration: 60000, closable: true })
        let insertPosition = 4
        menu.insert(await MenuItem.new({
            text: `检测到新版本${updateInfo.value.latestVersion}，点击打开更新页面`,
            action: async () => {
                await openUrl((updateInfo.value as UpdateInfo).html_url)
            },
        }), insertPosition)
        menu.insert(await MenuItem.new({
            text: `${updateInfo.value.changeLog.simple ? `更新日志：${updateInfo.value.changeLog.simple?.slice(0, 25)}...` : '无更新日志'}`,
            enabled: false,
        }), ++insertPosition)
        menu.insert({ item: 'Separator' }, ++insertPosition)
        menu.insert(await MenuItem.new({ text: '点击下载新版本：', enabled: false }), ++insertPosition)
        menu.insert({ item: 'Separator' }, ++insertPosition)

        // 添加下载链接
        for (let i = 0; i < updateInfo.value.assets?.length; i++) {
            menu.insert(await MenuItem.new({
                id: 'download' + i,
                text: "原始链接:" + updateInfo.value.assets[i].name,
                action: async () => {
                    await openUrl((updateInfo.value as UpdateInfo).assets[i].browser_download_url)
                },
            }), insertPosition)
            menu.insert(await MenuItem.new({
                id: 'downloadWithProxy' + i,
                text: "用代理下载:" + updateInfo.value.assets[i].name,
                action: async () => {
                    await openUrl(tool.proxyURI((updateInfo.value as UpdateInfo).assets[i].browser_download_url))
                },
            }), insertPosition)
        }
        tray.setMenu(menu)
    } else {
        menu.insert(await MenuItem.new({ text: '未检测到新版本', enabled: false }), 4)
        menu.insert({ item: 'Separator' }, 5)
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onScroll(e: Event) {
    emitter.emit('outerScrollbarScrolled', e)
}

async function setTop(isTop: boolean) {
    if (isTop) {
        await thisWindow.setAlwaysOnBottom(false)
        // await sleep(150)
        // await thisWindow.setAlwaysOnTop(false)
        await thisWindow.setFocus()
        await thisWindow.setAlwaysOnTop(true)
    } else {
        await thisWindow.setAlwaysOnTop(false)
        // await sleep(150)
        await thisWindow.setAlwaysOnBottom(true)
    }
}

onMounted(() => {
    initWindow();
    // 上下课自动切换窗口置顶
    watch(() => scheduleStore.lessonStatus, tool.debounce(async () => {
        if (!scheduleStore.lessonStatus) {// 下课状态
            NMessage.success("下课了!")
            await setTop(true)
            console.log("下课了，自动窗口置顶");
        } else {
            NMessage.success("上课了!", { duration: 5000 })
            await sleep(5000)
            await setTop(false)
            console.log("上课了，取消窗口置顶");
        }
    }, 500), { immediate: true })
    // 点击切换窗口置顶
    outerEle.value?.addEventListener("click", async () => {
        if (!scheduleStore.lessonStatus) {// 下课状态
            let isTop = await thisWindow.isAlwaysOnTop()
            await setTop(!isTop)
            NMessage.success(`窗口置顶：${!isTop}`)
            console.log(`点击切换了窗口置顶为：${!isTop}`);
        } else {
            await setTop(false)
            NMessage.success(`上课中，取消置顶`)
        }
    })
})



</script>

<template>
    <div ref="outerEle" class="select-none h-100vh flex flex-col p-r-0.3rem">
        <!-- 套一层div是为了不用flex，让margin合并 -->
        <div class="shrink-0 w-100%">
            <!-- 更新提示 -->
            <div v-if="updateInfo?.hasUpdate" class="w-full h-4rem 
                flex flex-col items-center justify-center 
                m-y-0.3rem p-0.25rem 
                border-1px border-solid border-#ccc
                bg-white rounded-1rem overflow-hidden">

                <div class="text-1.3rem font-bold 
                line-height-120% whitespace-nowrap text-#ff5252">
                    有新版本:{{ updateInfo?.latestVersion }}
                </div>
                <n-ellipsis class="text-#ff6b6b">
                    {{ updateInfo?.changeLog?.simple || '无更新日志' }}
                </n-ellipsis>

            </div>
            <!-- 小组件 -->
            <component v-for="item in widgets" :is="item.id" :param="item.param" :key="item.key" class="m-y-0.3rem">
            </component>
        </div>
        <!-- 课程表区域 -->
        <n-scrollbar class="grow-1" ref="outerScrollbar" @scroll="onScroll">
            <!-- 课程表卡片 -->
            <div v-if="scheduleStore.scheduleToday.length" v-for="(item, index) in scheduleStore.scheduleToday"
                :key="index" class="flex flex-col items-end">
                <class-card v-if="!item?.isDivider" :name="item.name" :time="item.time"
                    :active="item?.active"></class-card>
                <div v-else class="m-b-0.7rem"></div>
            </div>
            <!-- 无课程时的提示 -->
            <div v-else class="flex items-center justify-center h-100% bg-#ffffff55 rounded-1rem h-100vh">
                <div class="text-center bg-white p-0.25rem rounded-1rem">
                    <p class="text-1.2rem">奶酪课程表已启动</p>
                    <br />
                    <div class="text-1.1rem text-#888">
                        今日没有课程数据
                        <br /><br />
                        可前往托盘
                        <br />
                        唤出编辑页
                    </div>
                </div>
            </div>
        </n-scrollbar>
    </div>
</template>

<style scoped></style>