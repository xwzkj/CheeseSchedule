<template>
    <div ref="outer" class="outer" :class="{ 'w-9rem h-5.7rem': props.active, 'w-5.5rem h-3.2rem': !props.active }">
        <div class="relative flex flex-col items-center z-2 max-w-100%">
            <component :is="needMarquee ? Vue3Marquee : 'div'" class="max-w-100% overflow-hidden justify-center"
                :duration="(nameDiv?.scrollWidth ?? 250) / 35" :clone="true">
                <div ref="nameDiv"
                    :class="{ 'text-2.5rem font-bold': props.active, 'text-1.8rem': !props.active, 'px-0.5rem': needMarquee }"
                    class="line-height-120% whitespace-nowrap">
                    {{ props.name }}
                </div>
            </component>
            <div v-if="props.active" class="text-1.3rem font-bold whitespace-nowrap">{{ props.time }}</div>

        </div>
        <div :class="{ 'mask mask-to-bottom': needMask == 1, 'mask mask-to-top': needMask == 2 }"></div>
        <div v-if="props.active" class="bg">
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, useTemplateRef, onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { Vue3Marquee } from 'vue3-marquee';
import emitter from '../tools/mitt';
import * as tool from '../tools/tool'
const props = defineProps<{
    name: string,
    time: string | null,
    active: 0 | 1 | 2 | undefined
}>()
const outerEle = useTemplateRef('outer')
const nameDiv = useTemplateRef('nameDiv')
let needMarquee = ref(false)
let needMask = ref(0)// 0=不需要遮罩 1=从上到下 2=从下到上
onMounted(() => {
    emitter.on('outerScrollbarScrolled', tool.debounce((e: any) => {
        if (outerEle.value) {
            let h = outerEle.value.clientHeight
            // 顶端三分之一超出滚动可视区域
            if (outerEle.value?.offsetTop + 7 < e.target.scrollTop) {
                needMask.value = 1
                return
            }
            // 底端三分之一
            if (outerEle.value?.offsetTop + h - 7 > e.target.clientHeight + e.target.scrollTop) {
                needMask.value = 2
                return
            }
            needMask.value = 0
        }
    }, 15))
    let freshIfNeedMarquee = async () => {
        needMarquee.value = false // 让滚动时的左右空白padding消失
        await nextTick()
        if (nameDiv.value && outerEle.value) {
            needMarquee.value = nameDiv.value.scrollWidth >= outerEle.value.clientWidth
        }
    }
    watch(() => props.active, () => {
        let setColorAndScroll = () => {
            let val = props.active
            if (outerEle.value) {
                outerEle.value.style.setProperty('--bg-color', val == 0 ? 'white' : val == 1 ? '#66ccff' : '#55efc4');
                if (val as any > 0) {// 切换到这节课
                    window?.$outerScrollbar?.value?.scrollTo({ top: outerEle.value.offsetTop - 65, behavior: 'smooth' })
                    console.log('课程切换，课程列表滚动到当前课程');
                }
            }
        }
        setColorAndScroll()

        // 在过渡动画后刷新
        setTimeout(() => {
            freshIfNeedMarquee()
            setColorAndScroll() // 可能因元素变大没滚到底部，所以再次滚动
        }, 1000)
    }, { immediate: true })
    watch(() => props.name, () => {
        freshIfNeedMarquee()
    }, { immediate: true })
})
onBeforeUnmount(() => {
    emitter.off('outerScrollbarScrolled')
})
</script>

<style scoped>
.outer {
    --bg-color: rgb(248, 127, 62);
    padding: 0.2rem;
    margin-bottom: 0.3rem;
    border-radius: 1rem;
    border: 1px solid #ccc;
    background-color: white;
    position: relative;
    overflow: hidden;
    transition: all 0.7s ease-in-out;
    /* 居中 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.mask {
    z-index: 3;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(255, 255, 255);
}

.mask-to-bottom {
    mask-image: linear-gradient(white, 70%, transparent);
}

.mask-to-top {
    mask-image: linear-gradient(transparent, 30%, white);
}

.bg {
    z-index: 1;
    height: 65%;
    aspect-ratio: 1 / 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--bg-color, white);
    box-shadow: 0 0 4rem 1rem var(--bg-color, white);
    border-radius: 0.5rem;
    filter: blur(0.7rem);
    animation: bg-animation 30s linear infinite;
}

@keyframes bg-animation {
    0% {
        transform: translate(-80%, -50%) rotate(0deg) scale(1);
    }

    25% {
        transform: translate(-50%, -50%) rotate(90deg) scale(1.5);
    }

    50% {
        transform: translate(20%, -50%) rotate(180deg) scale(1);
    }

    75% {
        transform: translate(-50%, -50%) rotate(270deg) scale(1.5);
    }

    100% {
        transform: translate(-80%, -50%) rotate(360deg) scale(1);
    }
}
</style>