<template>
    <div class="w-full m-b-0.5rem">
            <div class="flex justify-between bg-gray-500/5 
            rounded-0.5rem p-1rem">
                <div class="flex flex-col justify-center">
                    <div class="text-1rem font-500">
                        {{ props.t1 }}
                    </div>
                    <div class="text-0.8rem text-#666">
                        {{ props.t2 }}
                    </div>
                </div>
                <div class="flex items-center">
                    <slot>
                        <n-input v-model:value="inputValue" v-if="props.needInput" placeholder="请输入" />
                        <n-button class="button" secondary circle type="primary">
                            <template #icon>
                                <n-icon>
                                    <HugeiconsLinkSquare01 @click="props.actionOnClick" v-if="!props.needInput" />
                                    <HugeiconsCheckmarkSquare01 @click="() => props.actionOnClick?.(inputValue)"
                                        v-else />
                                </n-icon>
                            </template>
                        </n-button>
                    </slot>
                </div>
            </div>
    </div>
</template>

<script setup name="settingItem" lang="ts">
import { ref } from 'vue';
import { NButton, NCard, NIcon, NInput } from 'naive-ui';
import HugeiconsLinkSquare01 from '~icons/hugeicons/link-square-01';
import HugeiconsCheckmarkSquare01 from '~icons/hugeicons/checkmark-square-01';

let props = defineProps<{
    t1: string,
    t2: string,
    actionOnClick?: any, // 仅在action非自定义时生效
    needInput?: boolean,
    defaultValue?: string,
}>()
let inputValue = ref(props.defaultValue)
</script>

<style scoped></style>