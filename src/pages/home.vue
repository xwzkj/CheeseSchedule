<script setup lang="ts">
import { useScheduleStore } from "../stores/scheduleStore";
import classCard from "../component/classCard.vue"
import { NScrollbar, useMessage } from "naive-ui";
import { getCurrentWindow, currentMonitor, PhysicalPosition } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { TrayIcon, type TrayIconOptions } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { Menu } from '@tauri-apps/api/menu';
import { exit } from '@tauri-apps/plugin-process';
import { onMounted, watch } from "vue";

const NMessage = useMessage();
const scheduleStore = useScheduleStore();
const thisWindow = getCurrentWindow();
async function initWindow() {
    const menu = await Menu.new({
        items: [
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
        icon: await defaultWindowIcon() as any,
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
    innerSize.height = monitor.size.height * 3 / 4
    thisWindow.setSize(innerSize)
    thisWindow.setPosition(new PhysicalPosition(monitor.size.width - outerSize.width, 0))
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
    <div class="h-100vh">
        <n-scrollbar>
            <div v-for="(item, index) in scheduleStore.scheduleToday" :key="index"
                class="flex flex-col items-end m-r-2">
                <class-card v-if="!item?.isDivider" :name="item.name" :time="item.time"
                    :active="item?.active"></class-card>
                <div v-else class="m-b-0.7rem"></div>
            </div>
        </n-scrollbar>
    </div>
</template>

<style scoped></style>