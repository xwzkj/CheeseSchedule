<script setup lang="ts">
import { useScheduleStore } from "../stores/scheduleStore";
import classCard from "../component/classCard.vue"
import { useMessage } from "naive-ui";
import { onMounted, watch } from "vue";
import * as tool from '../tools/tool'

import { currentMonitor, PhysicalPosition } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { TrayIcon, type TrayIconOptions } from '@tauri-apps/api/tray';
import * as app from '@tauri-apps/api/app';
import { Menu, MenuItem } from '@tauri-apps/api/menu';
import { exit } from '@tauri-apps/plugin-process';
import { openUrl } from "@tauri-apps/plugin-opener";

const NMessage = useMessage();
const scheduleStore = useScheduleStore();
const thisWindow = getCurrentWebviewWindow();
async function initWindow() {
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
    let monitor = await currentMonitor()
    if (!monitor) {
        return
    }
    let innerSize = await thisWindow.innerSize()
    let outerSize = await thisWindow.outerSize()
    innerSize.height = Math.floor(monitor.size.height * 2.8 / 4)
    thisWindow.setSize(innerSize)
    thisWindow.setPosition(new PhysicalPosition(monitor.size.width - outerSize.width, 0))
    // 禁用 Ctrl+P
    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "p") {
            e.preventDefault();
            e.stopPropagation();
        }
    });
    const updateInfo = await tool.checkUpdate()
    if (updateInfo.hasUpdate) {
        console.log("有新版本", updateInfo);
        NMessage.success("有新版本，请前往托盘菜单更新", { duration: 60000, closable: true })

        menu.insert({ text: '点击下载新版本：', enabled: false }, 4)
        menu.insert({ item: 'Separator' }, 5)

        // 添加下载链接
        for (let i = 0; i < updateInfo.assets?.length; i++) {
            menu.insert(await MenuItem.new({
                id: 'download' + i,
                text: "原始链接:" + updateInfo.assets[i].name,
                action: async () => {
                    await openUrl(updateInfo.assets[i].browser_download_url)
                },
            }), 5)
            menu.insert(await MenuItem.new({
                id: 'downloadWithProxy' + i,
                text: "用代理下载:" + updateInfo.assets[i].name,
                action: async () => {
                    await openUrl(tool.proxyURI(updateInfo.assets[i].browser_download_url))
                },
            }), 5)
        }
        tray.setMenu(menu)
    } else {
        menu.insert({ text: '未检测到新版本', enabled: false }, 4)
        menu.insert({ item: 'Separator' }, 5)
    }
}
initWindow();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    watch(() => scheduleStore.lessonStatus, async () => {
        if (!scheduleStore.lessonStatus) {// 下课状态
            NMessage.success("下课了!")
            await setTop(true)
            console.log("下课了，自动窗口置顶");
        } else {
            NMessage.success("上课了!")
            await sleep(1500)
            await setTop(false)
            console.log("上课了，取消窗口置顶");
        }
    }, { immediate: true })
})

window.addEventListener("click", async () => {
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


</script>

<template>
    <div>
        <div v-if="scheduleStore.scheduleToday.length" v-for="(item, index) in scheduleStore.scheduleToday" :key="index"
            class="flex flex-col items-end m-r-2">
            <class-card v-if="!item?.isDivider" :name="item.name" :time="item.time" :active="item?.active"></class-card>
            <div v-else class="m-b-0.7rem"></div>
        </div>
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
    </div>
</template>

<style scoped></style>