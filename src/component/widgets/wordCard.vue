<template>
    <div class="h-5.7rem w-full p-3 bg-#fff card-border
    flex flex-col justify-center 
    overflow-hidden whitespace-nowrap">
        <component :is="wordNeedMarquee ? NMarquee : 'div'" class="w-full">
            <div class="text-1.5rem line-height-120% font-bold max-w-full text-right"
                :class="{ 'm-r-3rem': wordNeedMarquee }" ref="word">
                {{ data.word }}
            </div>
        </component>
        <component :is="meaningNeedMarquee ? NMarquee : 'div'" class="w-full">
            <div class="text-1.1rem max-w-full text-right c8" :class="{ 'm-r-3rem': meaningNeedMarquee }" ref="meaning">
                {{ data.meaning }}
            </div>
        </component>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, onMounted, useTemplateRef, nextTick } from 'vue';
import { OpenAI } from 'openai';
import { NMarquee } from 'naive-ui';
import { useScheduleStore } from '../../stores/scheduleStore';
const scheduleStore = useScheduleStore()
const wordRef = useTemplateRef<HTMLDivElement>('word')
const meaningRef = useTemplateRef<HTMLDivElement>('meaning')
const props = defineProps<{
    param: {
        prompt: {
            label: string,
            type: string,
            value: string
        },
    }
}>()

let wordNeedMarquee = ref(false)
let meaningNeedMarquee = ref(false)


let data = ref({ "word": "generating", "meaning": "AI生成中..." })

onMounted(async () => {
    try {
        if (!scheduleStore.setting.AIapiBaseUrl) {
            throw new Error('您没有配置AI API地址，请先前往设置再使用！')
        }
        if (!scheduleStore.setting.AIapiKey) {
            throw new Error('您没有配置AI API密钥，请先前往设置再使用！')
        }
        const openai = new OpenAI(
            {
                apiKey: scheduleStore.setting.AIapiKey,
                baseURL: scheduleStore.setting.AIapiBaseUrl,
                dangerouslyAllowBrowser: true
            }
        );
        const completion = await (openai as any).chat.completions.create({
            model: scheduleStore.setting.AItextFlashModel,
            // temperature: 1.3,
            ...(scheduleStore.setting.AIapiBaseUrl.includes('aliyuncs.com') ? { thinking_budget: 250 } : {}),
            messages: [
                {
                    role: "system", content: `
    你是一个专业的英语教师，正在为同学准备一个单词卡片
    现在是${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}，你需要根据每天的日期输出不同的单词
    今天的随机码是：${Math.floor(Math.random() * 1000000)}${Math.floor(Math.random() * 1000000)}${Math.floor(Math.random() * 1000000)}
    根据以上信息返回词汇表中的单词，不要和其他随机码和时间生成的单词重复

    ${scheduleStore.setting.widgetWordCardHistory.length > 0 ? `下列单词已经生成过，你这次**坚决不能**返回它们：` : ``}
    ${scheduleStore.setting.widgetWordCardHistory.join(',')}
    本次回复时严格避免生成以上的单词！

    ！！！重要！！！
    你需要返回以下格式的JSON文本，包含：
    word字段：单词的原文
    meaning字段：单词的中文释义，不能包含英文。
    
    meaning字段应为词性缩写（如n. v. adj. adv. prep.等）+汉语释义。多个含义用分号隔开，如果有不同词性的释义用空格隔开
    例如：
    有多种词性时：
    {"word": "record", "meaning": "n.记录;唱片 v.录制"}
    或者：
    只有一种词性时：
    {"word": "smelly", "meaning": "adj.有臭味的;有难闻气味的"}
    务必按照以上格式返回，只能返回纯文本的json文本，请勿返回其他内容，否则会导致程序崩溃。
                ` },
                { role: "user", content: props.param.prompt.value }
            ],
        });
        data.value = JSON.parse(completion.choices[0].message.content ?? '{"word": "失败", "meaning": "AI返回错误"}')
        if (data.value.word != "失败") {
            if (!scheduleStore.setting.widgetWordCardHistory.includes(data.value.word)) {
                scheduleStore.setting.widgetWordCardHistory.push(data.value.word)
                if (scheduleStore.setting.widgetWordCardHistory.length > 100) { // 防止数据过长
                    scheduleStore.setting.widgetWordCardHistory.splice(0, scheduleStore.setting.widgetWordCardHistory.length - 100)
                }
                scheduleStore.save(true)
            } else {
                console.error('生成了重复的单词', data.value.word)
            }
        }
    } catch (error) {
        data.value = { word: "失败", meaning: String(error) }
    }
    await nextTick()
    if (wordRef.value && wordRef.value.scrollWidth > wordRef.value.clientWidth) {
        wordNeedMarquee.value = true
    }
    if (meaningRef.value && meaningRef.value.scrollWidth > meaningRef.value.clientWidth) {
        meaningNeedMarquee.value = true
    }
})

</script>

<style scoped></style>