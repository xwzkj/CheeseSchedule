import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { sleep } from '../tools/tool'
import { useScheduleStore } from './scheduleStore'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'


export const useDrawStore = defineStore('draw', () => {
    const scheduleStore = useScheduleStore()
    // 可供抽选的候选人
    const availableCandidates = computed(() => scheduleStore.drawCandidates.filter(i => (i.isEnabled && !(i.isDrawnThisRound && scheduleStore.setting.drawPreventDuplicate))))
    // 已启用的候选人
    const enabledCandidates = computed(() => scheduleStore.drawCandidates.filter(i => i.isEnabled))

    // 处理课前自动开启新轮次的逻辑
    if (getCurrentWebviewWindow().label == 'draw') {
        watch(() => scheduleStore.lessonStatus, async () => {
            if (scheduleStore.lessonStatus && scheduleStore.setting.drawAutoNewRound) { // 当前是上课状态，且已开启自动新轮次
                // 确保store处于稳定状态而不是刚读取配置时的不稳定状态
                if (Date.now() - scheduleStore.initedTime > 1000) {
                    newRound()
                    await sleep(1000) // 防止导致其他读取lessonStatus的地方永远判定为不稳定状态
                    scheduleStore.save(true)
                }
            }
        })
    }
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
     * 重置抽签历史，将所有候选人的historyCount设为0，并开启新一轮
     */
    function resetHistory() {
        scheduleStore.drawCandidates.forEach(i => i.historyCount = 0)
        newRound()
    }

    /**
     * 抽签
     * @param dynamicProbability 启用动态概率
     * @param justTry 是否仅尝试，不计入抽选历史，默认false
     * @returns 抽中的候选人 如果可用候选人为空则返回undefined
     */
    function draw(dynamicProbability: boolean = false, justTry: boolean = false): candidate | undefined {
        if (availableCandidates.value.length === 0) {
            return
        }
        if (dynamicProbability == false) { // 每个人概率相同
            let index = Math.floor(Math.random() * availableCandidates.value.length)
            let drown = availableCandidates.value[index]
            if (justTry == false) {
                drown.isDrawnThisRound = true
                drown.historyCount++
            }
            return drown
        } else { // 根据历史抽签数据调整抽中概率
            let weights: number[] = [] // 每个人的权重
            let totalWeight = 0 // 总权重
            for (let i = 0; i < availableCandidates.value.length; i++) {
                weights.push(1 / (availableCandidates.value[i].historyCount + 1))
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
            // 处理可能存在的浮点数精度问题导致的无法抽中最后一人的问题
            if (!drown && availableCandidates.value.length > 0) {
                drown = availableCandidates.value[availableCandidates.value.length - 1];
            }

            if (drown && justTry == false) {
                drown.isDrawnThisRound = true
                drown.historyCount++
            }

            return drown
        }
    }

    return {
        availableCandidates,
        enabledCandidates,
        draw,
        addCandidate,
        newRound,
        resetHistory,
    }
})
