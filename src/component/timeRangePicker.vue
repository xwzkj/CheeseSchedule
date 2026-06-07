<template>
    <div class="flex gap-1">
        <n-time-picker v-model:formatted-value="time1" size="small" format="HH:mm" />
        <div>-</div>
        <n-time-picker v-model:formatted-value="time2" size="small" format="HH:mm" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NTimePicker } from 'naive-ui'
const model = defineModel<string>()
let time1 = computed({
    get() {
        return timeFormat(model.value?.split('-')?.[0] || '08:00')
    },
    set(val) {
        model.value = `${val}-${time2.value}`
    }
})
let time2 = computed({
    get() {
        return timeFormat(model.value?.split('-')?.[1] || '08:40')
    },
    set(val) {
        model.value = `${time1.value}-${val}`
    }
})
function timeFormat(t: string) {
    let reg = /^(\d{1,2})[：:](\d{1,2})$/
    let res = reg.exec(t)
    if (!res || res?.length !== 3) {
        return '08:00'
    }
    return res?.[1].padStart(2, '0') + ':' + res?.[2].padStart(2, '0')
}
onMounted(() => {
    model.value = time1.value + '-' + time2.value
})
</script>

<style scoped></style>