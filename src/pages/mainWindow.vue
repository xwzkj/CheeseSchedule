<script setup lang="ts">
import { useScheduleStore } from "../stores/scheduleStore";
import classCard from "../component/classCard.vue"
import { useMessage, NScrollbar, NEllipsis } from "naive-ui";
import { ref, onMounted, useTemplateRef, watch, computed } from "vue";
import * as tool from '../tools/tool'
import { Howl } from "howler";

// tauri api
import { primaryMonitor, PhysicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { TrayIcon, type TrayIconOptions } from '@tauri-apps/api/tray';
import * as app from '@tauri-apps/api/app';
import { Menu } from '@tauri-apps/api/menu';
import { exit } from '@tauri-apps/plugin-process';
import { openUrl } from "@tauri-apps/plugin-opener";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

// 小组件
import daysLeft from "../component/widgets/daysLeft.vue";
import clock from "../component/widgets/clock.vue";
import dateProgress from "../component/widgets/dateProgress.vue";
import wordCard from "../component/widgets/wordCard.vue";
import attendanceCount from "../component/widgets/attendanceCount.vue";

let updateInfo = ref<UpdateInfo>();
let outerEle = useTemplateRef('outerEle')
window.$outerScrollbar = useTemplateRef('outerScrollbar')

const NMessage = useMessage();
const scheduleStore = useScheduleStore();
let thisWindow: WebviewWindow;
try {
    thisWindow = getCurrentWebviewWindow()
} catch (error) {
    console.error("获取当前窗口失败:", error);
}

function getWidgetComponent(id: string) {
    switch (id) {
        case 'daysLeft':
            return daysLeft
        case 'dateProgress':
            return dateProgress
        case 'clock':
            return clock
        case 'wordCard':
            return wordCard
        case 'attendanceCount':
            return attendanceCount
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
    try {

        const monitor = await primaryMonitor()
        if (!monitor) {
            return
        }

        const innerSize = await thisWindow.innerSize()
        const workAreaSize = monitor.workArea.size
        const workAreaPosition = monitor.workArea.position
        console.log('默认显示器:', monitor)

        // 计算窗口大小
        innerSize.height = Math.floor(workAreaSize.height * scheduleStore.setting?.heightFactor)
        innerSize.width = Math.floor(170 * monitor.scaleFactor * scheduleStore.setting?.zoom)

        await thisWindow.setZoom(scheduleStore.setting?.zoom)
        await thisWindow.setMaxSize(innerSize) // 偏方实现禁止调节大小，规避resizable导致的ubuntu中窗口最小200px尺寸
        await thisWindow.setMinSize(innerSize)
        await thisWindow.setSize(innerSize)
        
        // 设置窗口位置
        const outerSize = await thisWindow.outerSize()
        await thisWindow.setPosition(new PhysicalPosition(workAreaPosition.x + workAreaSize.width - outerSize.width, workAreaPosition.y))
    } catch (error) {
        console.error("设置窗口位置失败:", error);
    }
}
async function openEditorWindow() {
    let formerWindow = await WebviewWindow.getByLabel('editor')
    if (formerWindow) {
        await formerWindow.unminimize();
        await formerWindow.setFocus();
        console.log("焦点了一个已存在的编辑窗口");
    } else {
        let screenSize: LogicalSize = new LogicalSize(99999, 99999)
        const monitor = await primaryMonitor()
        if (monitor) {
            screenSize = monitor.workArea.size.toLogical(monitor.scaleFactor);
            console.log("屏幕工作区逻辑分辨率为：", screenSize);

        }
        let editWindow = new WebviewWindow('editor', {
            url: "/#/editor",
            title: "奶酪课程表编辑器",
            center: true,
            width: Math.min(900, screenSize.width - 40),
            height: Math.min(800, screenSize.height - 40),
            focus: true,
            dragDropEnabled: false, // 启用html5拖拽
        })
        editWindow.once("tauri://webview-created", async () => {
            await editWindow.setFocus();
            console.log("新建并焦点了一个编辑窗口");
        })
    }
}
async function initWindow() {
    // 立即初始化窗口大小，并监听缩放比例变化，实时更新窗口大小
    watch(() => scheduleStore.setting.zoom, initWindowSize, { immediate: true })
    watch(() => scheduleStore.setting.heightFactor, initWindowSize)

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
                id: 'openEditor',
                text: '打开编辑器',
                action: openEditorWindow,
            },
            {
                item: 'Separator'
            },
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
                id: 'official',
                text: '前往官网',
                action: async () => {
                    await openUrl("https://schedule.wanzii.cn")
                },
            },
            {
                id: 'github',
                text: '前往GitHub项目页',
                action: async () => {
                    await openUrl("https://github.com/xwzkj/CheeseSchedule")
                },
            },
            {
                item: 'Separator'
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
                openEditorWindow()
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
}

async function setTop(isTop: boolean) {
    if (isTop) {
        await thisWindow.setAlwaysOnBottom(false)
        await thisWindow.setFocus()
        await thisWindow.setAlwaysOnTop(true)
    } else {
        await thisWindow.setAlwaysOnTop(false)
        await thisWindow.setAlwaysOnBottom(true)
    }
}

// 使用AI将文本转为语音并播放
async function playVoice(text: string) {
    // 判断该功能是否开启
    if (!scheduleStore.setting.AIplayVoiceWhenLessonSwitch) {
        return
    }
    const res = await tauriFetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation", {
        method: "POST",
        headers: {
            "Authorization": scheduleStore.setting.AIapiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "qwen3-tts-flash",
            "input": {
                "text": text,
                "voice": "Cherry",
                "language_type": "Chinese"
            }
        })
    })
    const resJson = await res.json()
    console.log(resJson);
    const url = resJson.output.audio.url
    // new Audio(url).play()
    const howl = new Howl({
        src: url,
        autoplay: true,
        loop: false,
        onplay: () => {
            howl.fade(0, 1, 700)// 淡入
        },
        onend: () => {
            howl.unload()
        },
    });

}


onMounted(() => {
    initWindow();
    // 上下课自动切换窗口置顶
    watch(() => scheduleStore.lessonStatus, tool.debounce(async () => {
        if (Date.now() - scheduleStore.initedTime > 1000) {
            if (!scheduleStore.lessonStatus) {// 下课状态
                NMessage.success("下课了!")
                await setTop(true)
                console.log("下课了，自动窗口置顶");
                await playVoice("同学们，下课了！")
            } else {
                NMessage.success("上课了!", { duration: 5000 })
                // 查找当前课程 
                let lessonName = ""
                for (let i = 0; i < scheduleStore.scheduleToday.length; i++) {
                    if (scheduleStore.scheduleToday[i].active == 2) {
                        lessonName = scheduleStore.scheduleToday[i].name
                        break
                    }
                }
                playVoice("同学们，上课时间到了！" + (lessonName ? "这节课是：" + lessonName + "！" : ""))
                await tool.sleep(5000)
                await setTop(false)
                console.log("上课了，取消窗口置顶");
            }
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
    <div ref="outerEle" class="select-none h-100vh flex flex-col">
        <!-- 套一层div是为了不用flex，让margin合并 -->
        <div class="shrink-0 w-100% p-x-0.3rem">
            <!-- 更新提示 -->
            <div v-if="updateInfo?.hasUpdate" class="w-full h-4rem 
                flex flex-col items-center justify-center 
                m-y-0.3rem p-0.25rem 
                card-border bg-white overflow-hidden">

                <div class="text-1.3rem font-bold 
                line-height-120% whitespace-nowrap c6 cursor-pointer underline" @click.stop="openEditorWindow()">
                    有新版本:{{ updateInfo?.latestVersion }}
                </div>
                <n-ellipsis class="c4">
                    {{ updateInfo?.changeLog?.simple || '无更新日志' }}
                    <template #tooltip>
                        <div class="whitespace-pre-line max-w-80vw max-h-50vh overflow-y-scroll">
                            {{ updateInfo?.changeLog?.full || '无更新日志' }}
                        </div>
                    </template>
                </n-ellipsis>

            </div>
            <!-- 小组件 -->
            <component v-for="item in widgets" :is="item.id" :param="item.param" :key="item.key" class="m-y-0.3rem">
            </component>
        </div>
        <!-- 课程表区域 -->
        <n-scrollbar class="grow-1 overflow-x-visible" v-if="scheduleStore.scheduleToday.length" ref="outerScrollbar"
            content-style="overflow: hidden;">
            <!-- overflow: hidden;是用于解决鼠标无法拖拽滚挡条到底部的问题 -->
            <!-- 课程表卡片 -->
            <div v-for="(item, index) in scheduleStore.scheduleToday" :key="index"
                class="flex flex-col items-end m-0.3rem">
                <class-card v-if="!item?.isDivider" :name="item.name" :time="item.time"
                    :active="item?.active"></class-card>
                <div v-else class="m-b-0.4rem"></div>
            </div>
        </n-scrollbar>
        <!-- 无课程时的提示 -->
        <div v-else class="flex items-center justify-center h-100% bg-#aaaaaa55 rounded-1rem">
            <div class="text-center bg-white p-0.25rem rounded-1rem">
                <p class="text-1.2rem ">奶酪课程表已启动</p>
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

<style>
.card-border {
    border-radius: 1rem;
    /* border: 1px solid #ddd; */
    box-shadow: 0 2.5px 5px 0 rgba(0, 0, 0, 0.35);
}
</style>