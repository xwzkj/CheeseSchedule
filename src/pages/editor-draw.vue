<template>
    <div class="flex flex-col h-100vh">
        <n-scrollbar>
            <!-- 表头 -->
            <div class="flex text-center gap-1 m-0.5rem bg-#f7f8f9 rounded-0.5rem p-y-0.5rem">
                <div class="flex-1">姓名</div>
                <div class="flex-1">抽中次数</div>
                <div class="flex-1">本轮已抽中</div>
                <div class="flex-1"></div>
                <div class="flex-1"></div>
                <div class="flex-1">是否启用</div>
                <div class="flex-1">操作</div>
            </div>
            <!-- 数据 -->
            <div class="flex text-center items-center gap-1 m-0.5rem border border-#eff1f3 rounded-0.5rem p-y-1rem"
                v-for="(item, index) in scheduleStore.drawCandidates">
                <div class="flex-1">{{ item.name }}</div>
                <div class="flex-1">{{ item.historyCount }}</div>
                <div class="flex-1">
                    <n-checkbox v-model:checked="item.isDrawnThisRound" :disabled="true" />
                </div>
                <div class="flex-1"></div>
                <div class="flex-1"></div>
                <div class="flex-1">
                    <n-switch v-model:value="item.isEnabled" />
                </div>
                <div class="flex-1">
                    <n-button type="error" secondary @click="removeCandidate(index)">删除</n-button>
                </div>
            </div>
            <div v-if="scheduleStore.drawCandidates.length == 0" class="w-full text-center text-#999 text-1.2rem">
                无候选人，请在下方添加</div>
        </n-scrollbar>
        <div class="h-4rem w-full bg-#f7f8f9">
            <n-flex class="w-full h-full p-r-2rem" :justify="'end'" :align="'center'">
                <n-popconfirm @positive-click="resetHistory()">
                    <template #trigger>
                        <n-button secondary>重置抽签历史</n-button>
                    </template>
                    该操作会将所有候选人的历史抽中次数设为0，将重置动态概率，无法恢复，是否继续？
                </n-popconfirm>
                <n-button secondary @click="newRound()">开启新一轮次</n-button>
                <n-button secondary type="primary" @click="() => showModalAddCandidate = true">添加候选人</n-button>
            </n-flex>
        </div>
        <n-modal v-model:show="showModalAddCandidate">
            <n-card style="width: 600px" title="添加候选人" :bordered="false" size="huge" role="dialog" aria-modal="true">
                <div class="m-b-0.5rem">请在下方输入候选人姓名 每行一个<br />可直接从成绩单等包含姓名列的excel表格中复制粘贴<br />不支持重名，若出现重名将只会添加一个</div>
                <n-input v-model:value="newCandidates" type="textarea" :placeholder="`请输入候选人姓名,如：\n刘华强\n李田所\n侯国玉`"
                    rows="10" />
                <template #footer>
                    <n-flex>
                        <n-button secondary type="primary" @click="addCandidates">添加</n-button>
                        <n-button secondary @click="showModalAddCandidate = false">关闭</n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NScrollbar, NButton, NSwitch, NCheckbox, NFlex, NModal, NCard, NInput, NPopconfirm } from 'naive-ui'
import { useDrawStore } from '../stores/drawStore'
import { useScheduleStore } from '../stores/scheduleStore'
const drawStore = useDrawStore()
const scheduleStore = useScheduleStore()

let showModalAddCandidate = ref(false)
let newCandidates = ref('')

function removeCandidate(index: number) {
    scheduleStore.drawCandidates.splice(index, 1)
    window.$NMessageApi.success('已删除')
}
function newRound() {
    drawStore.newRound()
    window.$NMessageApi.success('已开启新一轮抽签')
}
function resetHistory() {
    drawStore.resetHistory()
    window.$NMessageApi.success('已重置抽签历史')
}

function addCandidates() {
    if (newCandidates.value.trim() == '') {
        window.$NMessageApi.error('请输入文本')
        return
    }
    let candidates = newCandidates.value.split('\n')
    let trueCount = 0, falseCount = 0
    for (let i = 0; i < candidates.length; i++) {
        if (candidates[i].trim() == '') {
            continue
        }
        if (drawStore.addCandidate({
            name: candidates[i].trim(),
            isEnabled: true,
            historyCount: 0,
            isDrawnThisRound: false,
        }) == true) {
            trueCount++
        } else {
            falseCount++
        }
    }
    if (falseCount == 0) {
        window.$NMessageApi.success(`成功添加${trueCount}人`)
    } else {
        window.$NMessageApi.warning(`成功添加${trueCount}人，${falseCount}人已存在`)
    }
    showModalAddCandidate.value = false
    newCandidates.value = ''
}

</script>

<style scoped></style>