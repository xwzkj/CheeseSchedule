import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from "dayjs";
import updateLocale from 'dayjs/plugin/updateLocale'
import { invoke } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'
import { listen } from '@tauri-apps/api/event'
import { enable, disable } from '@tauri-apps/plugin-autostart';

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1,
})

export const useScheduleStore = defineStore('schedule', () => {
    let setting = ref({
        startup: true, // 是否开机自启
        zoom: 1, // 主窗口缩放比例
        heightFactor: 0.7, // 主窗口高度乘数
    })
    const today = ref(updateToday())
    const patterns = ref<Pattern[]>([]) // 时间模式
    const schedule = ref<Schedule[]>([]) // 所有的课程表
    const firstWeekMonday = ref(dayjs().startOf("week").format("YYYY-MM-DD")) // 第一周周一的日期
    const currentScheduleId = ref(getCurrentScheduleId()) // 现在是第几周
    setScheduleCount(1) // 初始化课程表数量为1
    // 某日的临时改动
    const scheduleOverride = ref<{
        date: string,
        override: string[]
    }>({ date: '1970-01-01', override: [] })
    // 小组件配置
    const widgets = ref<WidgetConfig[]>([])

    function updateToday() {
        return dayjs().format("ddd").toLowerCase() as Week
    }
    setInterval(() => {
        today.value = updateToday()
    }, 1000 * 60 * 5) // 每5分钟更新一次
    let scheduleThisWeek = computed(() => {
        return schedule.value[currentScheduleId.value]
    })
    let scheduleToday = computed(() => {
        if (scheduleOverride.value.date == dayjs().format('YYYY-MM-DD')) {
            let temp = []
            // 遍历寻找这节课有没有被覆盖
            for (let i = 0; i < scheduleThisWeek.value[today.value].lessons.length; i++) {
                temp.push({ ...scheduleThisWeek.value[today.value].lessons[i] }) // 浅拷贝,防止改变原数据
                if (scheduleOverride.value.override?.[i]) { // 存在覆盖
                    temp[i].name = scheduleOverride.value.override[i] // 覆盖新的课程名
                }
            }
            return temp
        }
        return scheduleThisWeek.value[today.value].lessons
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
    // 给n-dropdown使用的课程表数据
    let scheduleIdOption = computed(() => {
        let d = []
        for (let i = 0; i < schedule.value.length; i++) {
            d.push({
                label: `课表${i + 1}`,
                key: i
            })
        }
        return d
    })
    // 时间判断,输入格式为 "hh:mm-hh:mm"
    async function init() {
        let data: any
        try {
            data = await invoke("read_config")
            data = JSON.parse(data)
        } catch (e) {
            console.log('读取配置失败：', e)
        }
        console.log("config-data:", data)
        if (data) {
            async function loadV0(d: any) {
                if (d?.patterns) {
                    patterns.value = d?.patterns
                }
                if (d?.schedule) {
                    schedule.value[0] = d?.schedule
                }
                if (d?.scheduleOverride) {
                    if (dayjs().format("YYYY-MM-DD") == d.scheduleOverride.date) {
                        scheduleOverride.value = d.scheduleOverride
                    }
                }
                if (d?.widgets) {
                    widgets.value = d?.widgets
                }
                if (d?.zoom) {
                    setting.value.zoom = d?.zoom
                }
                if (d?.heightFactor) {
                    setting.value.heightFactor = d?.heightFactor
                }
                if (d?.startup) {
                    setting.value.startup = d?.startup
                }
            }

            async function loadV1(d: any) {
                if (d?.patterns) {
                    patterns.value = d?.patterns
                }
                if (d?.schedule) {
                    schedule.value = d?.schedule
                }
                if (d?.firstWeekMonday) {
                    firstWeekMonday.value = d?.firstWeekMonday
                }
                if (d?.scheduleOverride) {
                    if (dayjs().format("YYYY-MM-DD") == d.scheduleOverride.date) {
                        scheduleOverride.value = d.scheduleOverride
                    }
                }
                if (d?.widgets) {
                    widgets.value = d?.widgets
                }
                for (let i in d?.setting) {
                    if (i in setting.value) {
                        (setting.value as any)[i] = d?.setting[i]
                    }
                }
            }


            if (!data?.version) { // 版本0
                await loadV0(data) // 版本0配置文件兼容
            } else if (data?.version == 1) { // 版本1
                await loadV1(data)
            } else {
                window.$NMessageApi.error("配置文件版本错误")
                await loadV1(data)
            }

            // 设置自启动
            try {
                if (setting.value.startup) {
                    await enable()
                } else {
                    await disable()
                }
            } catch (e) {
                console.log('自启动设置：', e)
            }
        } else {
            for (let i = 0; i < 7; i++) {
                patterns.value.push({ name: `模式${i + 1}`, data: [] })
            }
        }
        currentScheduleId.value = getCurrentScheduleId()
        __refreshActive()
    }
    init()
    listen("updated", init)
    setInterval(() => {
        currentScheduleId.value = getCurrentScheduleId()
    }, 1000 * 60 * 5) // 每5分钟更新一次

    async function save() {
        try {
            await invoke("write_config", {
                data: JSON.stringify({
                    version: 1,
                    setting: setting?.value,
                    patterns: patterns?.value,
                    schedule: schedule?.value,
                    scheduleOverride: scheduleOverride?.value,
                    firstWeekMonday: firstWeekMonday?.value,
                    widgets: widgets?.value,
                })
            });
            emit("updated");
            window.$NMessageApi.success("已保存");
        } catch (e) {
            window.$NMessageApi.error(`保存失败：${JSON.stringify(e)}`);
        }
    }

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

    // 设置课程表数量
    function setScheduleCount(count: number) {
        if (schedule.value.length >= count) { // 大于等于 删除多的
            schedule.value.splice(count)
        } else {// 小于 添加新的
            for (let i = schedule.value.length; i < count; i++) {
                schedule.value.push({
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
            }
        }
    }

    // 输入本周是第几周，设置第一周周一的日期
    function setFirstWeek(currentWeekNumber: number) {
        const thisMonday = dayjs().startOf("week") // 获取到本周一 因为设置了weekStart: 1
        firstWeekMonday.value = thisMonday.subtract(currentWeekNumber, "week").format("YYYY-MM-DD") // 往前推到第一周
        currentScheduleId.value = getCurrentScheduleId() // 更新当前周id
    }

    // 获取本周是第几周 从0开始
    function getCurrentScheduleId(): number {
        const diff = dayjs().diff(firstWeekMonday.value, "week")
        let len = schedule.value.length
        len = Math.max(len, 1) // 如果为0 会返回NaN

        // JS 的 % 对负数会返回负数，所以要手动修正
        return ((diff % len) + len) % len
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
            scheduleThisWeek.value[today.value].lessons[i].active = __isActive(scheduleToday.value[i]?.time, scheduleToday.value[lastTimeIndex]?.time)
        }
    }
    __refreshActive()
    setInterval(__refreshActive, 500);

    function setPatternToDay(patternId: number, scheduleID: number, day: Week) {
        schedule.value[scheduleID][day].pattern = patternId
        let p = patterns.value[patternId].data
        let lessons = schedule.value[scheduleID][day].lessons

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
        schedule.value[scheduleID][day].lessons = lessons
    }

    function refreshPatternToDay() {
        for (let i = 0; i < patterns.value.length; i++) {
            for (let j = 0; j < schedule.value.length; j++) {
                for (let key in schedule.value[j]) {
                    if (schedule.value[j][key as keyof Schedule].pattern == i) {
                        setPatternToDay(i, j, key as any)
                    }
                }
            }
        }
    }

    return {
        init,
        save, refreshPatternToDay,
        setPatternToDay,
        setScheduleCount,
        setFirstWeek,
        getCurrentScheduleId,
        __isActive,
        __refreshActive,
        patterns,
        schedule,
        scheduleThisWeek,
        firstWeekMonday,
        today,
        currentScheduleId,
        widgets,
        patternsOption,
        scheduleIdOption,
        scheduleToday,
        lessonStatus,
        scheduleOverride,
        setting,
    }
})