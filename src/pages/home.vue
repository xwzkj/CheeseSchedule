<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useScheduleStore } from "../stores/scheduleStore";
import classCard from "../component/classCard.vue"
import { NScrollbar } from "naive-ui";
import dayjs from "dayjs";
import { getCurrentWindow, Window, currentMonitor, PhysicalPosition } from "@tauri-apps/api/window";
import { TrayIcon, type TrayIconOptions } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { Menu } from '@tauri-apps/api/menu';
import { exit } from '@tauri-apps/plugin-process';


const scheduleStore = useScheduleStore();
const thisWindow = getCurrentWindow();
async function initWindow() {
    const menu = await Menu.new({
        items: [
            {
                id: 'quit',
                text: 'Quit',
                action: async() => {
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
                if(editWindow){
                    editWindow.show();
                }else{
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


type Week = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
let classData = computed({
    get() {
        return scheduleStore.schedule[dayjs().format("ddd").toLowerCase() as Week].lessons
    },
    set(newValue) {
        scheduleStore.schedule[dayjs().format("ddd").toLowerCase() as Week].lessons = newValue
    }
})

// 也能用...毕竟是引用传递
// let classData = computed(() => {
//     return scheduleStore.schedule[dayjs().format("ddd").toLowerCase() as Week].lessons
// })

function refreshActive() {
    for (let i = 0; i < classData.value.length; i++) {
        if (classData.value[i].isDivider) {
            continue
        }
        let lastTimeIndex = 0;
        for (let j = i - 1; j >= 0; j--) {
            if (!classData.value[j].isDivider) {
                lastTimeIndex = j;
                break;
            }
        }
        // console.log(i, lastTimeIndex);
        classData.value[i].active = isActive(classData.value[i]?.time, classData.value[lastTimeIndex]?.time)
    }
}

onMounted(() => {
    setTimeout(refreshActive, 500)
    setInterval(refreshActive, 5000);
})

// 时间判断,输入格式为 "hh:mm-hh:mm"
function isActive(time: string, lastTime: string): 0 | 1 | 2 {
    let now = new Date();
    let nowTime = now.getHours() * 60 + now.getMinutes();

    const rex = /^(\d{1,2})[：:](\d{1,2})[-~ ]+(\d{1,2})[：:](\d{1,2})$/;
    let res = rex.exec(time);
    let resLast = rex.exec(lastTime);
    if (res) {
        let start = parseInt(res[1]) * 60 + parseInt(res[2]);
        let end = parseInt(res[3]) * 60 + parseInt(res[4]);
        let flag: 0 | 1 | 2 = 0;
        if (start < end) {// 同一天
            flag = nowTime >= start && nowTime < end ? 2 : 0;
        } else {
            flag = nowTime >= start || nowTime < end ? 2 : 0;
        }
        if (flag == 0 && resLast) {
            let lastEnd = parseInt(resLast[3]) * 60 + parseInt(resLast[4]);
            if (nowTime >= lastEnd && nowTime < start) {
                flag = 1; // 这节课的课间
            }
        }
        return flag;
    } else {
        return 0;
    }
}

</script>

<template>
    <div class="h-100vh">
        <n-scrollbar>
            <div v-for="(item, index) in classData" :key="index" class="flex flex-col items-end m-r-2">
                <class-card v-if="!item?.isDivider" :name="item.name" :time="item.time"
                    :active="item?.active as any ?? 0"></class-card>
                <div v-else class="m-b-0.7rem"></div>
            </div>
        </n-scrollbar>
    </div>
</template>

<style scoped></style>