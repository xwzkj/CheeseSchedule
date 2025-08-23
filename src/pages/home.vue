<script setup lang="ts">
import { ref } from "vue";
import classCard from "../component/classCard.vue"
import { NScrollbar } from "naive-ui";
import { getCurrentWindow, currentMonitor, PhysicalPosition } from "@tauri-apps/api/window";

const thisWindow = getCurrentWindow();
async function initWindow() {
    thisWindow.setTitle("奶酪课程表");
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

const classData = ref<{ name: string, time: string, active?: boolean }[]>(
    [
        {
            name: "语文",
            time: "5:00-06:00"
        },
        {
            name: "数学",
            time: "06:00-07:00"
        },
        {
            name: "英语",
            time: "07:00-08:00"
        },
        {
            name: "物理",
            time: "08:00-09:00"
        },
        {
            name: "化学",
            time: "09:00-10:00"
        },
        {
            name: "生物",
            time: "10:00-11:00"
        },
        {
            name: "历史",
            time: "11:00-12:00"
        },
        {
            name: "地理",
            time: "12:00-13:00"
        },
        {
            name: "政治",
            time: "13:00-14:00"
        },
        {
            name: "音乐",
            time: "14:00-15:00"
        },
        {
            name: "英语",
            time: "15:00-16:00"
        },
        {
            name: "语文",
            time: "16:00-17:00"
        },
        {
            name: "美术",
            time: "17:00-18:00"
        },
    ]
);

function refreshActive() {
    classData.value.map(item => {
        item.active = isActive(item.time)
    })
}

refreshActive()
setInterval(refreshActive, 5000);

// 时间判断,输入格式为 "hh:mm-hh:mm"
function isActive(time: string): boolean {
    let now = new Date();
    let nowTime = now.getHours() * 60 + now.getMinutes();

    const rex = /^(\d{1,2}):(\d{1,2})-(\d{1,2}):(\d{1,2})$/;
    let res = rex.exec(time);
    if (res) {
        let start = parseInt(res[1]) * 60 + parseInt(res[2]);
        let end = parseInt(res[3]) * 60 + parseInt(res[4]);
        if (start < end) {// 同一天
            return nowTime >= start && nowTime < end;
        } else {
            return nowTime >= start || nowTime < end;
        }
    } else {
        return false;
    }
}

</script>

<template>
    <div class="h-100% bg-white">
        <n-scrollbar>
            <div v-for="(item, index) in classData" :key="index" class="flex flex-col items-center">
                <class-card :name="item.name" :time="item.time" :active="item?.active ? true : false"></class-card>
            </div>
        </n-scrollbar>
    </div>
</template>

<style scoped></style>