<template>
    <div class="flex h-100vh">
        <div class="w-15rem h-100% flex flex-col">
            <div class="text-1.3rem m-l-1rem">可用组件</div>
            <div class="m-l-1rem">拖拽至右侧以添加</div>
            <VueDraggable v-model="availableList" :animation="150"
                :group="{ name: 'widget', pull: 'clone', put: false }" :clone="clone" :sort="false"
                class="flex flex-col gap-2 p-4 w-100% grow-1">

                <div v-for="item in availableList" :key="item.key" class="cursor-move bg-gray-500/5 rounded-0.5rem p-3">
                    {{ item.name }}
                </div>

            </VueDraggable>
        </div>
        <div class="w-15rem h-100% flex flex-col grow-1">
            <div class="text-1.3rem m-l-1rem">已添加组件</div>
            <div class="m-l-1rem">展开以编辑或删除</div>
            <VueDraggable v-model="scheduleStore.widgets" :animation="150" group="widget" filter=".do-not-drag"
                :prevent-on-filter="false" class="flex flex-col gap-2 p-4 h-100% grow-1 overflow-auto">

                <div v-for="(item, index) in scheduleStore.widgets" :key="item.key"
                    class="cursor-move bg-gray-500/5 rounded-0.5rem p-3">
                    <n-collapse>
                        <!-- 参数设置 -->
                        <n-collapse-item :title="item.name" name="1">
                            <!-- 每个参数 -->
                            <div v-for="(i, key) in item.param" class="m-t-0.5rem">
                                <div>{{ i.label }}：<span class="text-#999">({{ key }}:{{ i.value }})</span></div>
                                <div class="do-not-drag">
                                    <n-date-picker v-if="i.type == 'date'" v-model:value="i.value" type="date" />
                                    <n-input v-if="i.type == 'text'" v-model:value="i.value" type="text"
                                        placeholder="请输入" />
                                </div>
                            </div>
                            <div class="flex justify-end m-t-0.5rem">
                                <n-button @click="scheduleStore.widgets.splice(index, 1)" type="error"
                                    secondary>删除</n-button>
                            </div>
                        </n-collapse-item>
                    </n-collapse>
                </div>

            </VueDraggable>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { NCollapse, NCollapseItem, NDatePicker, NInput, NButton } from 'naive-ui'
import { useScheduleStore } from '../stores/scheduleStore'
const scheduleStore = useScheduleStore()

const availableList = ref<WidgetConfig[]>([
    {
        name: '倒计日',
        id: 'daysLeft',
        key: 1,
        param: {
            name: {
                label: '目标名称',
                type: 'text',
                value: '元旦'
            },
            date: {
                label: '目标日期',
                type: 'date',
                value: 1767196800000
            }
        }
    },
    {
        name: '时钟',
        id: 'clock',
        key: 2,
        param: {}
    }
])
function clone(item: any) {
    let n = JSON.parse(JSON.stringify(item));
    n.key = Date.now();
    return n
}
</script>
