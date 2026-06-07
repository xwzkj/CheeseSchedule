import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from "dayjs";
import updateLocale from 'dayjs/plugin/updateLocale'
import YAML from 'yaml'
import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
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
        timeOffset: 0, // 时间偏移量 单位：秒
        drawDynamicProbability: true, // 是否启用动态概率
        drawPreventDuplicate: true, // 是否阻止在同一轮中重复抽中某人
        drawAutoNewRound: true, // 是否在每节课开始时自动开启新轮次
        drawPreventCheating: true, // 是否开启课间防作弊模式
        drawSmallWindowEnabled: true, // 是否启用悬浮按钮
        drawExcludeLeaveStudents: true, // 是否在抽签时排除请假者
        themeColor: '#ce9e04',// 主题色
        password: '', // 密码 以sha256存储
        passwordScope: ['editor-password'], // 密码作用域
        AIapiKey: '', // API密钥
        AIplayVoiceWhenLessonSwitch: true, // 是否在上下课时播放语音提醒
        widgetWordCardHistory: [] as string[],  // 单词卡片历史记录，防止重复
    })
    let drawCandidates = ref<candidate[]>([]) // 抽签候选人 在该此处由init统一从配置文件中读取，在drawStore中使用

    const inited = ref(false) // 是否初始化完成
    const initedTime = ref(Date.now()) // 初始化的时间，用于判断读取到的是否为稳定值
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
    async function init() {
        let data: any
        try {
            data = await readTextFile('config.json', { baseDir: BaseDirectory.AppData })
        } catch (e) {
            console.log('读取appdata的配置失败：', e)
            try {
                data = await invoke("read_config")
            } catch (e) {
                console.log('读取可执行文件目录的配置还是失败：', e)
            }
        }
        data = JSON.parse(data)
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
                if (d?.drawCandidates) {
                    drawCandidates.value = d?.drawCandidates
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
                patterns.value.push({ name: `时间表${i + 1}`, data: [] })
            }
        }
        currentScheduleId.value = getCurrentScheduleId()
        __refreshActive()
        inited.value = true
        initedTime.value = Date.now()
    }
    init()
    listen("updated", init)
    setInterval(() => {
        currentScheduleId.value = getCurrentScheduleId()
    }, 1000 * 60 * 5) // 每5分钟更新一次

    async function save(doNotShowSuccessMessage: boolean = false) {
        try {
            await writeTextFile('config.json', JSON.stringify({
                version: 1,
                setting: setting?.value,
                drawCandidates: drawCandidates?.value,
                patterns: patterns?.value,
                schedule: schedule?.value,
                scheduleOverride: scheduleOverride?.value,
                firstWeekMonday: firstWeekMonday?.value,
                widgets: widgets?.value,
            }, null, 2), { baseDir: BaseDirectory.AppData })

            emit("updated");
            if (!doNotShowSuccessMessage) {
                window.$NMessageApi.success("已保存");
            }
        } catch (e) {
            window.$NMessageApi.error(`保存失败：${JSON.stringify(e)}`);
        }
    }

    function __isActive(time: string, lastTime: string): 0 | 1 | 2 {
        let nowDayjs = dayjs().subtract(setting.value.timeOffset, 'second');
        let nowTime = nowDayjs.hour() * 60 + nowDayjs.minute();

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
        const diff = dayjs().startOf("week").diff(firstWeekMonday.value, "week")
        let len = schedule.value.length
        len = Math.max(len, 1) // 如果为0 会返回NaN

        // JS 的 % 对负数会返回负数，所以要手动修正
        let res = ((diff % len) + len) % len
        console.log('距离第一周：', diff, '当前使用课表：', res);
        return res
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
        // 提取已有课程中非分割线的课程名，按顺序保存
        let courseNames = lessons.filter(l => !l.isDivider).map(l => l.name)
        lessons = []
        let courseIdx = 0
        for (let i = 0; i < p.length; i++) {
            let name = '空'
            if (!p[i].isDivider) {
                // 非分割线槽位按顺序匹配已有的非分割线课程
                name = courseNames[courseIdx] ?? '空'
                courseIdx++
            }
            let lesson: Lesson = {
                name: name,
                time: p[i]?.time ?? '',
                isDivider: p[i].isDivider,
            }
            lessons.push(lesson)
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

    //把课程表信息导出为CSES格式（https://github.com/SmartTeachCN/CSES）
    function exportToCSES(): string {
        let cses: CSES = { version: 1, subjects: [], schedules: [] }
        for (let i = 0; i < Math.min(schedule.value.length, 2); i++) { //每张课表，最多遍历两张课表（CSES格式限制）
            for (let key in schedule.value[i]) { //周一到周日
                let daySchedule = schedule.value[i][key as keyof Schedule]
                let csesDaySchedule: CsesClass[] = []
                for (let lesson of daySchedule.lessons) { //每节课 
                    // 如果课程不再cses的课程列表中，就添加
                    if (!cses.subjects.find(item => item.name === lesson.name)) {
                        cses.subjects.push({
                            name: lesson.name,
                            simplified_name: lesson.name.substring(0, 1),
                            room: '',
                            teacher: '',
                        })
                    }
                    const reg = /^(\d{1,2})[：:](\d{1,2})[-~ ]+(\d{1,2})[：:](\d{1,2})$/;
                    let time = reg.exec(lesson.time)
                    if (time && !lesson.isDivider) {
                        // 添加课程
                        csesDaySchedule.push({
                            subject: lesson.name,
                            start_time: `${time?.[1].padStart(2, '0')}:${time?.[2].padStart(2, '0')}:00`,
                            end_time: `${time?.[3].padStart(2, '0')}:${time?.[4].padStart(2, '0')}:00`,
                        })
                    }
                }
                const weekday = {
                    mon: 1,
                    tue: 2,
                    wed: 3,
                    thu: 4,
                    fri: 5,
                    sat: 6,
                    sun: 7,
                }
                cses.schedules.push({
                    name: `第${i + 1}周 周${weekday?.[key as Week]}`,
                    enable_day: weekday[key as Week],
                    classes: csesDaySchedule,
                    // 如果有多张课表，则加入weeks字段
                    ...(schedule.value.length > 1 ? { weeks: i === 0 ? 'odd' : 'even' } : {})
                })
            }
        }
        return YAML.stringify(cses)
    }

    // 从CSES格式导入课程表。注意：该函数将覆盖课程表配置，注意备份
    function importFromCSES(csesStr: string): { success: boolean, message: string } {
        let cses: CSES
        try {
            cses = YAML.parse(csesStr)
        } catch (e) {
            return { success: false, message: `文件格式错误` }
        }
        if (!(cses && cses?.version === 1)) {
            return { success: false, message: `不支持的配置版本` }
        }
        try {
            setScheduleCount(0) // 清空课表
            patterns.value = [] // 清空时间表

            // 如果欲导入的内容包含大小周
            if (cses.schedules.some(item => item.weeks === 'even')) {
                setScheduleCount(2)
            } else {
                setScheduleCount(1)
            }
            // 导入时间表和课程表
            const weekday: Week[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            for (let i = 0; i < cses.schedules.length; i++) {
                let lessons = cses.schedules[i] // 当前正在处理的这天的课程表
                let res: Day = { pattern: -1, lessons: [] }
                if (lessons.enable_day < 1 || lessons.enable_day > 7) {
                    window.$NMessageApi.error(`发现错误数据，已跳过`)
                    continue
                }
                let reg = /(\d{1,2}:\d{1,2})/
                res.lessons = lessons.classes.map(item => ({
                    name: item.subject,
                    time: `${reg.exec(item.start_time)?.[1]}-${reg.exec(item.end_time)?.[1]}`,
                    isDivider: false,
                }))
                let newPattern = res.lessons.map(item => ({
                    isDivider: false,
                    time: item.time,
                }))
                // 看看能不能复用时间表
                let f = patterns.value.findIndex(item => JSON.stringify(item.data) === JSON.stringify(newPattern))
                if (f != -1) {
                    res.pattern = f // 复用
                } else {
                    // 新建
                    patterns.value.push({ name: `时间表${patterns.value.length + 1}`, data: newPattern })
                    res.pattern = patterns.value.length - 1
                }
                if (lessons.weeks === 'all') {
                    for (let j = 0; j < schedule.value.length; j++) {
                        schedule.value[j][weekday[lessons.enable_day - 1]] = res
                    }
                } else {
                    schedule.value[lessons.weeks === 'even' ? 1 : 0][weekday[lessons.enable_day - 1]] = res
                }
            }
            // 导入结束
            if (patterns.value.length < 7) { // 如果时间表不足七个，就补全
                for (let i = patterns.value.length; i < 7; i++) {
                    patterns.value.push({ name: `空时间表${i + 1}`, data: [] })
                }
            }

        } catch (e) {
            return { success: false, message: `导入失败：${JSON.stringify(e)}` }
        }
        return { success: true, message: `导入成功` }
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
        exportToCSES,
        importFromCSES,
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
        drawCandidates,
        inited,
        initedTime,
    }
})