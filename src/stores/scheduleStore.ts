import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from "dayjs";
import { invoke } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'
import { listen } from '@tauri-apps/api/event'
import { enable, disable } from '@tauri-apps/plugin-autostart';

export const useScheduleStore = defineStore('schedule', () => {
    let startup = true
    const today = dayjs().format("ddd").toLowerCase() as Week
    const patterns = ref<Pattern[]>([])
    const schedule = ref<Schedule>({
        mon: {
            pattern: -1,
            lessons: []
        },
        tue: {
            pattern: -1,
            lessons: []
        },
        wed: {
            pattern: -1,
            lessons: []
        },
        thu: {
            pattern: -1,
            lessons: []
        },
        fri: {
            pattern: -1,
            lessons: []
        },
        sat: {
            pattern: -1,
            lessons: []
        },
        sun: {
            pattern: -1,
            lessons: []
        }
    })
    // 某日的临时改动
    const scheduleOverride = ref<{
        date: string,
        override: string[]
    }>({ date: '1970-01-01', override: [] })
    let scheduleToday = computed(() => {
        if (scheduleOverride.value.date == dayjs().format('YYYY-MM-DD')) {
            let temp = []
            // 遍历寻找这节课有没有被覆盖
            for (let i = 0; i < schedule.value[today].lessons.length; i++) {
                temp.push({ ...schedule.value[today].lessons[i] }) // 浅拷贝,防止改变原数据
                if (scheduleOverride.value.override?.[i]) { // 存在覆盖
                    temp[i].name = scheduleOverride.value.override[i] // 覆盖新的课程名
                }
            }
            return temp
        }
        return schedule.value[today].lessons
    })
    let lessonStatus = computed(() => {// true -> 正在上课 false -> 课间
        for (let i = 0; i < scheduleToday.value.length; i++) {
            if ((scheduleToday.value[i].active ?? 0) === 2) {
                return true
            }
        }
        return false
    })
    // 给n-dropdown使用的模式数据
    const patternsOption = computed(() => {
        let t = []
        for (let i = 0; i < patterns.value.length; i++) {
            t.push({ key: i, label: patterns.value[i].name })
        }
        return t
    })
    // 时间判断,输入格式为 "hh:mm-hh:mm"
    function __isActive(time: string, lastTime: string): 0 | 1 | 2 {
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
            if (flag == 0 && resLast) { // 如果不在该节课课上，判断是否是这节课前的课间
                if (time == lastTime) {// 第一节课
                    if (nowTime < end) {
                        flag = 1; // 这节课的课间
                    }
                } else {
                    let lastEnd = parseInt(resLast[3]) * 60 + parseInt(resLast[4]);
                    if (nowTime >= lastEnd && nowTime < start) {
                        flag = 1; // 这节课的课间
                    }
                }
            }
            return flag;
        } else {
            return 0;
        }
    }

    function __refreshActive() {
        for (let i = 0; i < scheduleToday.value.length; i++) {
            if (scheduleToday.value[i].isDivider) {
                continue
            }
            let lastTimeIndex = 0;
            for (let j = i - 1; j >= 0; j--) {
                if (!scheduleToday.value[j].isDivider) {
                    lastTimeIndex = j;
                    break;
                }
            }
            // console.log(i, lastTimeIndex);
            schedule.value[today].lessons[i].active = __isActive(scheduleToday.value[i]?.time, scheduleToday.value[lastTimeIndex]?.time)
        }
    }

    setInterval(__refreshActive, 5000);

    async function init() {
        let data: any
        try {
            data = await invoke("read_config")
        } catch (e) {
            console.log('读取配置失败：', e)
        }
        console.log("config-data:", data)
        if (data) {
            data = JSON.parse(data)
            if (data?.patterns) {
                patterns.value = data?.patterns
            }
            if (data?.schedule) {
                schedule.value = data?.schedule
            }
            if (data?.scheduleOverride) {
                if (dayjs().format("YYYY-MM-DD") == data.scheduleOverride.date) {
                    scheduleOverride.value = data.scheduleOverride
                }
            }
            if (typeof data?.startup == "boolean") {
                startup = data?.startup
                try {
                    if (data.startup) {
                        await enable()
                    } else {
                        await disable()
                    }
                } catch (e) {
                    console.log('自启动设置：', e)
                }
            }
        } else {
            for (let i = 0; i < 7; i++) {
                patterns.value.push({ name: `模式${i + 1}`, data: [] })
            }
        }
        __refreshActive()
    }
    init()
    listen("updated", init)

    async function save() {
        try {
            await invoke("write_config", {
                data: JSON.stringify({
                    startup,
                    patterns: patterns?.value,
                    schedule: schedule?.value,
                    scheduleOverride: scheduleOverride?.value
                })
            });
            emit("updated");
            window.$NMessageApi.success("已保存");
        } catch (e) {
            window.$NMessageApi.error(`保存失败：${JSON.stringify(e)}`);
        }
    }

    function __setPatternToDay(patternId: number, day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') {
        schedule.value[day].pattern = patternId
        let p = patterns.value[patternId].data
        let lessons = schedule.value[day].lessons

        if (lessons.length > p.length) {
            lessons.splice(p.length)
        }
        for (let i = 0; i < p.length; i++) {
            let lesson: Lesson = {
                name: lessons?.[i]?.name ?? '空',
                time: p[i]?.time ?? '',
                isDivider: p[i].isDivider,
            }
            if (lessons.length < i + 1) {
                lessons.push(lesson)
            } else {
                lessons[i] = lesson
            }
        }
        schedule.value[day].lessons = lessons
    }

    function refreshPatternToDay(patternId: number) {
        for (let key in schedule.value) {
            if (schedule.value[key as keyof Schedule].pattern == patternId) {
                __setPatternToDay(patternId, key as any)
            }
        }
    }

    return {
        init,
        save, refreshPatternToDay,
        __setPatternToDay,
        __isActive,
        __refreshActive,
        patterns,
        schedule,
        patternsOption,
        scheduleToday,
        lessonStatus,
        scheduleOverride,
    }
})