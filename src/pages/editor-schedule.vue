<template>
    <div class="p-1rem w-100%">
        <div class="flex justify-between items-center">
            <div class="flex gap-2 items-center">
                <n-dropdown :options="scheduleStore.scheduleIdOption" @select="handleSelect" trigger="click">
                    <n-button type="primary" dashed>
                        选择课程表
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="1.5" d="M18 9s-4.419 6-6 6s-6-6-6-6" />
                            </svg>
                        </template>
                    </n-button>
                </n-dropdown>
                当前编辑：{{ scheduleStore.scheduleIdOption[scheduleId]?.label }}
            </div>
            <n-button type="primary" @click="showModalImportFromImage = true">从课程表图片导入</n-button>
        </div>
        <div class="w-100% flex gap-1 justify-center">
            <div v-for="i in 7" class="flex flex-col items-center">
                <div class="text-1rem">{{ CNdays[i - 1] }}</div>
                <day-schedule :scheduleId="scheduleId" :day="days[i - 1]"></day-schedule>
            </div>
        </div>
        <n-modal :show="showModalImportFromImage">
            <n-card style="width: 600px" title="从课程表图片导入" :bordered="false" size="huge" role="dialog" aria-modal="true">
                <div v-if="!processing" class="flex flex-col gap-2">
                    <div class="text-#888">课程表图片：</div>
                    <n-upload list-type="image-card" :default-upload="false" :max="1" accept=".jpg,.jpeg,.png,.bmp"
                        @update:file-list="handleFileListChange">
                    </n-upload>
                    <div class="text-#888">AI模型：</div>
                    <n-input v-model:value="modelStorage" :placeholder="DEFAULT_MODEL" clearable />
                    <div class="text-#888">补充要求（可选）：</div>
                    <n-input v-model:value="userPrompt" placeholder="请添加您的额外要求" />
                    <div class="text-#888">限制思维链长度：</div>
                    <div>
                        <n-switch v-model:value="saveToken" />
                    </div>
                </div>
                <div v-else>
                    <div class="flex gap-1 items-center m-b-1rem">
                        <n-spin></n-spin>
                        <div class="text-1rem">
                            AI生成中...
                            <div class="color-#888">时间可能较长 您可以去喝杯咖啡</div>
                        </div>
                    </div>
                    <n-scrollbar class="max-h-10rem h-10rem" ref="modalImportFromImageScrollbar">
                        <div class="color-#888">
                            {{ reasoningRes }}
                        </div>
                        <div>
                            {{ res }}
                        </div>
                    </n-scrollbar>


                </div>
                <template #footer>
                    <n-flex>
                        <n-button secondary type="primary" @click="importFromImage" v-if="!processing">导入</n-button>
                        <n-button secondary @click="showModalImportFromImage = false">关闭</n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-modal>
    </div>

</template>

<script setup lang="ts">
import { NDropdown, NButton, NModal, NCard, NFlex, NUpload, NScrollbar, NSpin, NInput, NSwitch } from 'naive-ui'
import { onBeforeUnmount, ref, useTemplateRef } from 'vue';
import { OpenAI } from 'openai';
import { useStorage } from '@vueuse/core'
import Compressor from 'compressorjs';
import { useScheduleStore } from '../stores/scheduleStore';
import daySchedule from '../component/daySchedule.vue';

const days: Week[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const CNdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const scheduleStore = useScheduleStore()

const scheduleId = ref(scheduleStore.currentScheduleId)
const DEFAULT_MODEL = 'qwen3.7-plus'

let showModalImportFromImage = ref(false)
let modalImportFromImageScrollbar = useTemplateRef('modalImportFromImageScrollbar')
let modelStorage = useStorage('ai-model-import', DEFAULT_MODEL)
let userPrompt = ref('')
let saveToken = ref(false)// 是否节省token
let processing = ref(false)
let res = ref('');
let reasoningRes = ref(``);

function handleSelect(key: number) {
    scheduleId.value = key
}

const controller = new AbortController();
onBeforeUnmount(() => {
    controller.abort()
})
window.addEventListener('beforeunload', () => {
    controller.abort()
})
async function importFromImage() {
    try {
        if (!scheduleStore.setting.AIapiKey) {
            window.$NMessageApi.error('您没有配置AI API密钥，请先前往设置再使用！')
            return
        }
        if (!base64Result.value) {
            window.$NMessageApi.error('请先选择课程表图片')
            return
        }
        const openai = new OpenAI(
            {
                apiKey: scheduleStore.setting.AIapiKey,
                baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
                dangerouslyAllowBrowser: true
            }
        );
        processing.value = true
        res.value = ''
        reasoningRes.value = ''
        let schedule: Schedule = {
            mon: {
                pattern: 0,
                lessons: []
            },
            tue: {
                pattern: 0,
                lessons: []
            },
            wed: {
                pattern: 0,
                lessons: []
            },
            thu: {
                pattern: 0,
                lessons: []
            },
            fri: {
                pattern: 0,
                lessons: []
            },
            sat: {
                pattern: 0,
                lessons: []
            },
            sun: {
                pattern: 0,
                lessons: []
            }
        }
        let days: Week[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        let isAllEmpty = true // 是否每天的时间表都是空的
        for (let i = 0; i < days.length; i++) {
            schedule[days[i]] = {
                pattern: scheduleStore.schedule[scheduleId.value][days[i]].pattern,
                lessons: scheduleStore.schedule[scheduleId.value][days[i]].lessons.map(i => {
                    return {
                        name: '',
                        time: i.time,
                        active: i.active,
                        isDivider: i.isDivider
                    }
                })
            }
            if (schedule[days[i]].lessons.length > 0) {
                isAllEmpty = false
            }
        }
        if (isAllEmpty) {
            window.$NMessageApi.error('请先配置时间表再导入！')
            return
        }
        const stream = await (openai as any).chat.completions.create({
            model: modelStorage.value || DEFAULT_MODEL,
            stream: true,
            enable_thinking: true,
            ...(saveToken.value ? { thinking_budget: 2000 } : {}),
            messages: [
                {
                    role: "system",
                    content: `
提取图中的课程表，供软件的配置文件使用，软件包括时间表(Pattern)和课程表(Schedule)两部分：
type Pattern = {
    name: string,
    data: {
        isDivider: boolean,
        time?: string
    }[]
}
type Lesson = {
    name: string,
    time: string,
    active?: 0 | 1 | 2, // 0:不是当前课程，1:当前为课间，下一节是该课程，2:是当前课程
    isDivider: boolean // 若该字段为true，则认为该项不是一节课，而只是分隔符，其他字段均无实际意义
}
type Day = {
    pattern: number,
    lessons: Lesson[]
}
type Schedule = {
    mon: Day,
    tue: Day,
    wed: Day,
    thu: Day,
    fri: Day,
    sat: Day,
    sun: Day
}
按照以上规则，补全以下数据的name字段，如与图片产生冲突以所给数据为主，返回Schedule类型的完整课程表

${JSON.stringify(schedule)}

重要：
请务必仔细核对图片中的表格结构以防错误
如果图片缺少某些课节，请在数据的name字段中填写“空”，而不是保持空白
如果图片中的课程是单字，请补全为两个字（如“文”=>“语文”等），但对于不确定的课程，不要补全
只需读取图片中每天的课程名称和顺序进行填充，并忽略图片中的其他信息，如时间等
你只可以改动name字段，不能改动其他字段，不能新增或删除数组中的项目，否则会导致程序崩溃
若待补全内容为空或部分为空，不要根据图片中该部分的课程信息新增数组中的项目，直接跳过该部分。如：图片有周一到周五的课程信息，但待补全内容中周三是空的，则不对周三进行处理。再比如：图片中某天有10节课，但是待补全内容只有5节，则只补全前五节
返回规则：
先返回<true/>或<false/>来代表用户输入是否合法（如以上数据是否符合图片中的课程表，或图片是否为课程表）然后加个换行符，
如果输入合法，返回这段json，不要返回任何额外内容，并确保json格式合法，否则程序将无法解析返回内容;
如果输入不合法（比如图片不是课程表，图片中的课程信息多于给出的数据或给出的数据是空），返回失败原因，要求格式为100字内的纯文本
            `},
                {
                    role: "user",
                    content: [{
                        "type": "image_url",
                        "image_url": { "url": base64Result.value },
                    }]
                },
                {
                    role: "user",
                    content: [
                        {
                            "type": "text",
                            "text": userPrompt.value
                        }
                    ]
                }]
        }, {
            signal: controller.signal
        })
        for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
                const content = chunk.choices[0]?.delta?.content || "";
                const reasoning = (chunk as any).choices[0].delta.reasoning_content || "";
                res.value += content;
                reasoningRes.value += reasoning;
                modalImportFromImageScrollbar.value?.scrollBy({ top: 10000, behavior: 'smooth' })
            } else if (chunk.usage) {
                // 请求结束

            }
        }
        if (res.value.startsWith('<true/>')) {
            scheduleStore.schedule[scheduleId.value] = JSON.parse(res.value.slice(7))
            window.$NMessageApi.success('导入成功，请检查后再保存')
        } else if (res.value.startsWith('<false/>')) {
            window.$NMessageApi.error('导入失败：' + res.value.slice(8), { duration: 60 * 1000, closable: true })
        } else {
            window.$NMessageApi.error('AI返回格式错误：' + res.value, { duration: 60 * 1000, closable: true })
        }
        console.log(reasoningRes.value)
        console.log(res.value)
    } catch (error) {
        window.$NMessageApi.error('发生错误：' + error, { duration: 60 * 1000, closable: true })
    } finally {
        processing.value = false
        showModalImportFromImage.value = false
    }
}

const base64Result = ref('')

function compressImage(file: File, options = {}): Promise<File | Blob> {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            ...options,
            success(result) {
                resolve(result);
            },
            error(err) {
                reject(err);
            },
        });
    });
};
// 把图片转为base64
async function handleFileListChange(fileList: any) {
    if (fileList.length === 0) {
        base64Result.value = ''
        return
    }

    let file = fileList[fileList.length - 1].file

    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 文件大于5MB
            console.log('文件大于5MB，开始压缩')
            file = await compressImage(file, { quality: 0.5 })
            console.log('压缩完成，压缩后大小：', file.size)
        }
        const reader = new FileReader()
        reader.onload = (e: any) => {
            base64Result.value = e.target.result
            window.$NMessageApi.success('图片读取成功')
        }
        reader.onerror = () => {
            window.$NMessageApi.error('图片读取失败')
        }
        reader.readAsDataURL(file)
    }
}
</script>

<style scoped></style>