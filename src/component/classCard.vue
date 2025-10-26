<template>
    <div ref="outer" class="outer card-border" :class="{
        'w-full h-5.7rem p-r-3 items-end': props.active,
        'w-5.5rem h-3.2rem center': !props.active,
        'gradient-to-bottom': needGradient == 1,
        'gradient-to-top': needGradient == 2
    }">
        <div ref="nameDiv"
            :class="{ 'text-2.5rem font-bold': props.active, 'text-1.8rem': !props.active, 'px-0.5rem': needMarquee }"
            class="line-height-120% whitespace-nowrap z-2">
            {{ props.name }}
        </div>
        <div v-if="props.active" class="text-1.3rem font-bold whitespace-nowrap z-2">{{ props.time }}</div>
        <div v-if="props.active" class="bg">
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, useTemplateRef, onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
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
let needGradient = ref(0)// 0=不需要渐变 1=从上到下 2=从下到上
onMounted(() => {
    emitter.on('outerScrollbarScrolled', tool.debounce((e: any) => {
        if (outerEle.value) {
            let offsetTop = outerEle.value.offsetTop // 元素距离滚动容器顶部的距离
            let h = outerEle.value.clientHeight // 元素高度
            let clientHeight = e.target.clientHeight // 滚动可视区域高度
            let scrollTop = e.target.scrollTop // 滚动容器滚动距离

            // 顶端超出滚动可视区域 且 底端未超出滚动可视区域
            if (offsetTop < scrollTop && offsetTop + h > scrollTop) {
                needGradient.value = 1
                return
            }
            // 底端超出滚动可视区域 且 顶端未超出滚动可视区域
            if (offsetTop + h > scrollTop + clientHeight && offsetTop < scrollTop + clientHeight) {
                needGradient.value = 2
                return
            }
            needGradient.value = 0
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
                    window?.$outerScrollbar?.value?.scrollTo({ top: outerEle.value.offsetTop - 57, behavior: 'smooth' })
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
    background-color: white;
    position: relative;
    overflow: hidden;
    transition:
        height 0.7s ease-in-out,
        width 0.7s ease-in-out;
    /* 居中 */
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.center {
    align-items: center;
}

.gradient-to-bottom {
    mask-image: linear-gradient(rgba(255, 255, 255, 0.5), 70%, white);
}

.gradient-to-top {
    mask-image: linear-gradient(white, 30%, rgba(255, 255, 255, 0.5));
}

.bg {
    z-index: 1;
    height: 65%;
    aspect-ratio: 1 / 1;
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translate(-50%, -50%);
    background-color: var(--bg-color, white);
    box-shadow: 0 0 4rem 1rem var(--bg-color, white);
    border-radius: 0.5rem;
    filter: blur(0.7rem);
    /* animation: bg-animation 30s linear infinite; */
}

/* @keyframes bg-animation {
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
} */
</style>