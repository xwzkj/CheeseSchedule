<script setup lang="ts">
import { useScheduleStore } from "../stores/scheduleStore";
import classCard from "../component/classCard.vue"
import { NScrollbar, useMessage } from "naive-ui";
import { getCurrentWindow, Window, currentMonitor, PhysicalPosition } from "@tauri-apps/api/window";
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
                console.log(
                    `mouse ${event.button} button pressed, state: ${event.buttonState}`
                );
                let editWindow = await Window.getByLabel('editor');
                if (editWindow) {
                    editWindow.show();
                } else {
                    console.error('找不到编辑窗口')
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

onMounted(() => {
    watch(() => scheduleStore.lessonStatus, async () => {
        if (!scheduleStore.lessonStatus) {// 下课状态
            NMessage.success("下课了!")
            await thisWindow.setAlwaysOnBottom(false)
            await thisWindow.setAlwaysOnTop(true)
            console.log("下课了，自动窗口置顶");
        } else {
            NMessage.success("上课了!")
            setTimeout(async () => {
                await thisWindow.setAlwaysOnTop(false)
                await thisWindow.setAlwaysOnBottom(true)
                console.log("上课了，取消窗口置顶");
            }, 1500)
        }
    }, { immediate: true })
})

window.addEventListener("click", async () => {
    if (!scheduleStore.lessonStatus) {// 下课状态
        let isTop = await thisWindow.isAlwaysOnTop()

        if (isTop) {
            await thisWindow.setAlwaysOnTop(false)
            await thisWindow.setAlwaysOnBottom(true)
        } else {
            await thisWindow.setAlwaysOnBottom(false)
            await thisWindow.setAlwaysOnTop(true)
        }

        NMessage.success(`窗口置顶：${!isTop}`)
        console.log(`点击切换了窗口置顶为：${!isTop}`);
    } else {
        thisWindow.setAlwaysOnTop(false)
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