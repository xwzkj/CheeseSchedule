import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'
import { listen } from '@tauri-apps/api/event'
import { enable, disable } from '@tauri-apps/plugin-autostart';

export const useScheduleStore = defineStore('schedule', () => {
    let startup = true
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

    // 给n-dropdown使用的模式数据
    const patternsOption = computed(() => {
        let t = []
        for (let i = 0; i < patterns.value.length; i++) {
            t.push({ key: i, label: patterns.value[i].name })
        }
        return t
    })

    async function init() {
        let data: any = await invoke("read_config")
        console.log("config-data:", data)
        if (data) {
            data = JSON.parse(data)
            if (data?.patterns) {
                patterns.value = data?.patterns
            }
            if (data?.schedule) {
                schedule.value = data?.schedule
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
    }
    init()
    listen("updated", init)

    async function save() {
        try {
            await invoke("write_config", { data: JSON.stringify({ startup, patterns: patterns?.value, schedule: schedule?.value }) });
            emit("updated");
            (window as any).$NMessageApi.success("已保存");
        } catch (e) {
            (window as any).$NMessageApi.error(`保存失败：${JSON.stringify(e)}`);
        }
    }

    function setPatternToDay(patternId: number, day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') {
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
                setPatternToDay(patternId, key as any)
            }
        }
    }

    return { init, save, setPatternToDay, refreshPatternToDay, patterns, schedule, patternsOption }
})