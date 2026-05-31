<template>
    <div class="h-6rem w-full p-x-3 bg-#fff card-border
    flex flex-col items-end justify-center 
    overflow-hidden whitespace-nowrap">
        <div class="flex items-center gap-1">
            <span class="text-1rem c8">应到</span>
            <span class="text-1.6rem line-height-120% font-bold">{{ total }}</span>
            <span class="text-1rem c8">实到</span>
            <span class="text-1.6rem line-height-120% font-bold">{{ actual }}</span>
        </div>
        <component :is="needMarquee ? NMarquee : 'div'" class="w-full">
            <div class="text-1.2rem max-w-full text-right" :class="{ 'm-r-3rem': needMarquee }" ref="namesDiv">
                {{ names }}
            </div>
        </component>
        <div class="underline decoration-solid cursor-pointer link" @click.stop="openWebPage">点击管理</div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue';
import { NMarquee } from 'naive-ui';
import { openUrl } from '@tauri-apps/plugin-opener';
import { emit } from '@tauri-apps/api/event'
const props = defineProps<{
    param: {
        apiUrl: {
            label: string,
            type: string,
            value: string
        },
        apiKey: {
            label: string,
            type: string,
            value: string
        }
    }
}>()

let namesDiv = useTemplateRef('namesDiv')
let needMarquee = ref(false)
let total = ref<number | string>(0)
let actual = ref<number | string>(0)
let names = ref('暂无请假')


async function api(path: string, config?: RequestInit | undefined) {
    let url = new URL(path, props.param.apiUrl.value)
    return fetch(url, {
        ...config,
        headers: {
            'Authorization': `Bearer ${props.param.apiKey.value}`,
            ...(config?.headers || {})
        },
    });
}
async function updateNum() {
    try {
        let res = await api('/studentCount')
        let resJson = await res.json()
        if (!res.ok) {
            throw new Error(resJson.msg)
        }
        total.value = resJson.total
        actual.value = resJson.actual
    } catch (e) {
        console.error('更新出席人数失败:', e)
        total.value = 'E'
        actual.value = 'E'
    }
}
async function updateNames() {
    let newNames = ''
    try {
        let res = await api('/getToday')
        let resJson = await res.json()
        if (!res.ok) {
            throw new Error(resJson.msg)
        }
        emit('leaveStudentsList', resJson as Leave[]) // 广播请假列表
        newNames = (resJson as Leave[]).map((item) => item.name).join('、')
        if (newNames) {
            newNames = '请假：' + newNames
        } else {
            newNames = '暂无请假'
        }
    } catch (e: any) {
        console.error('更新请假列表失败:', e)
        newNames = '错误：' + e.message
    }
    if (newNames !== names.value) {
        names.value = newNames
        needMarquee.value = false // 防止滚动时会判断为false
        await nextTick()
        if (namesDiv.value && namesDiv.value.scrollWidth > namesDiv.value.clientWidth) {
            needMarquee.value = true
        }
    }
}
async function openWebPage() {
    try {
        let url = new URL('/', props.param.apiUrl.value)
        url.searchParams.set('key', props.param.apiKey.value)
        await openUrl(url.toString())
    } catch (e) {
        window.$NMessageApi.error('参数无效，请按文档搭建后端并填写正确参数')
        await openUrl('https://github.com/xwzkj/CheeseSchedule#readme')
    }
}

let timer = setInterval(() => {
    updateNum()
    updateNames()
}, 60 * 1000)
watch([() => props.param.apiUrl.value, () => props.param.apiKey.value], () => {
    updateNum()
    updateNames()
}, { immediate: true })
onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>

<style scoped>
.link {
    color: var(--color-5);
}
</style>