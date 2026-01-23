import { defineStore } from 'pinia'
import { computed } from 'vue'

import { useScheduleStore } from './scheduleStore'

const scheduleStore = useScheduleStore()

export const useDrawStore = defineStore('draw', () => {
    // 可供抽选的候选人
    const availableCandidates = computed(() => scheduleStore.drawCandidates.filter(i => (i.isEnabled && !(i.isDrawnThisRound && scheduleStore.setting.drawPreventDuplicate))))

    function addCandidate(c: candidate): boolean {
        // 如果已存在同名 返回false
        if (scheduleStore.drawCandidates.find(i => i.name == c.name)) {
            return false
        }
        scheduleStore.drawCandidates.push(c)
        return true
    }
    /**
     * 开启新一轮，将所有候选人的isDrawnThisRound设为false
     */
    function newRound() {
        scheduleStore.drawCandidates.forEach(i => i.isDrawnThisRound = false)
    }
    /**
     * 抽签
     * @param dynamicProbability 启用动态概率
     * @returns 抽中的候选人 如果可用候选人为空则返回undefined
     */
    function draw(dynamicProbability: boolean = false): candidate | undefined {
        if (availableCandidates.value.length === 0) {
            return
        }
        if (dynamicProbability == false) { // 每个人概率相同
            let index = Math.floor(Math.random() * availableCandidates.value.length)
            let drown = availableCandidates.value[index]
            drown.isDrawnThisRound = true
            drown.historyCount++
            return drown
        } else { // 根据历史抽签数据调整抽中概率
            let weights: number[] = [] // 每个人的权重
            let totalWeight = 0 // 总权重
            for (let i = 0; i < availableCandidates.value.length; i++) {
                weights.push(1 / ((availableCandidates.value[i].historyCount + 1) ** 2))
                totalWeight += weights[i]
            }

            let random = Math.random() * totalWeight

            // 根据权重，确定最终抽中的候选人
            let drown: candidate | undefined = undefined
            for (let i = 0; i < weights.length; i++) {
                if (random <= weights[i]) {
                    drown = availableCandidates.value[i]
                    break
                }
                random -= weights[i]
            }

            if (drown) {
                drown.isDrawnThisRound = true
                drown.historyCount++
            }

            return drown
        }
    }

    return {
        availableCandidates,
        draw,
        addCandidate,
        newRound,
    }
})
