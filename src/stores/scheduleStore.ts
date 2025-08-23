import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export const useScheduleStore = defineStore('schedule', () => {
    const patterns = ref<Pattern[]>([])
    const schedule = ref<Schedule>()

    async function init() {
        let data: any = await invoke("read_config")
        console.log("config-data:", data)
        if (data) {
            data = JSON.parse(data)
            patterns.value = data?.patterns
            schedule.value = data?.schedule
        } else {
            for (let i = 0; i < 7; i++) {
                patterns.value.push({ name: `模式${i + 1}`, data: [] })
            }
        }
    }
    init()

    async function save() {
        await invoke("write_config", { data: JSON.stringify({ patterns: patterns?.value, schedule: schedule?.value }) })
    }

    return { init, save, patterns, schedule }
})