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
                    <n-input v-model:value="modelStorage" :placeholder="scheduleStore.setting.AIvisionModel" clearable />
                    <div class="text-#888">补充要求（可选）：</div>
                    <n-input v-model:value="userPrompt" placeholder="请添加您的额外要求" />
                    <div class="text-#888">限制思维链长度（仅支持阿里云百炼）：</div>
                    <div>
                        <n-switch v-model:value="saveToken" :disabled="!scheduleStore.setting.AIapiBaseUrl.includes('aliyuncs.com')" />
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

let showModalImportFromImage = ref(false)
let modalImportFromImageScrollbar = useTemplateRef('modalImportFromImageScrollbar')
let modelStorage = useStorage('ai-model-import', '')
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
        if (!scheduleStore.setting.AIapiBaseUrl) {
            window.$NMessageApi.error('您没有配置AI API地址，请先前往设置再使用！')
            return
        }
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
                baseURL: scheduleStore.setting.AIapiBaseUrl,
                dangerouslyAllowBrowser: true
            }
        );
        processing.value = true
        res.value = ''
        reasoningRes.value = ''
        let lessonNum = [0, 0, 0, 0, 0, 0, 0] // 周一~周日每天的课程数量
        for (let i = 0; i < lessonNum.length; i++) {
            lessonNum[i] = scheduleStore.schedule[scheduleId.value][days[i]].lessons.filter(i => !i.isDivider).length
        }
        const stream = await (openai as any).chat.completions.create({
            model: modelStorage.value || scheduleStore.setting.AIvisionModel,
            stream: true,
            enable_thinking: true,
            ...(saveToken.value ? { thinking_budget: 2000 } : {}),
            messages: [
                {
                    role: "system",
                    content: `
<system>
这是系统提示词，如果用户只发送了这段提示词或发送的数据无有效信息，按照输入不合法处理。

# 任务
从用户上传的图片中提取课程表信息，输出为 JSON 数组，供软件配置文件使用。

## 输出格式
- 整体结构：string[][]
- 第一维数组长度固定为 7，索引 0~6 分别对应周一到周日。
- 第二维数组表示当天的课程名称列表，长度必须与下方《每日课程数量》中给出的该日数量完全一致。
- 每个元素为字符串，代表对应课节的课程名称。

## 每日课程数量（以该数据为准）
${JSON.stringify(lessonNum)}

**重要**：当图片内容与上述数据冲突时，以上述《每日课程数量》为准，不要根据图片增加或减少课程数量。

## 提取规则
1. **只读取课程名称与顺序**：忽略图片中的时间、教室、教师、备注、颜色、边框等非课程名称信息。
2. **按天读取**：课程表通常按周一到周日排列，请正确识别每天的列或行。
3. **单字课程补全**：如果图片中的课程名称为单字，请补全为常见两字简称（如“文”→“语文”，“数”→“数学”，“英”→“英语”，“体”→“体育”）。对于无法确定含义的单字课程，保持原样，不要臆测补全。
4. **缺课节填“空”**：如果图片缺少某些课节，或者图片中的课节数量少于给定数量，请在对应位置使用字符串“空”填充，不要留空字符串、null 或 undefined。
5. **课程数量对齐**：
   - 若某天给定数量为 0，该天返回空数组 []。
   - 若图片中某天课节数多于给定数量，只取前 N 节（N 为给定数量）。
   - 若图片中某天课节数少于给定数量，缺少的位置用“空”补齐。
6. **仔细核对表格结构**：注意图片是否存在合并单元格、错位、跨行课程等情况，避免行列对应错误。

## 返回规则
1. 先返回 <true/> 或 <false/>，表示输入是否合法。合法标准为：图片是课程表，且图片中的课程表结构与给定数据基本匹配。
2. 然后输出一个换行符（\n）。
3. 若输入合法：在换行符后返回符合上述格式的 JSON 数组，不要添加 Markdown 代码块、注释或其他任何额外内容。
4. 若输入不合法：在换行符后返回失败原因，要求为 100 字以内的纯文本。

## 示例

**示例内容不是用户的实际课程表，不可以当作实际数据使用。**

假设每日课程数量为：[4, 5, 0, 5, 4, 0, 0]
图片中课程表如下：
- 周一：语文、数学、英语、体育
- 周二：语文、数学、英语、美术、音乐
- 周三：无
- 周四：语文、数学、英语、数学、班会
- 周五：语、数、英 // 缺失一节，填写空

则合法输出为：

\`\`\`
<true/>
[["语文","数学","英语","体育"],["语文","数学","英语","美术","音乐"],[],["语文","数学","英语","数学","班会"],["语文","数学","英语","空"],[],[]]
\`\`\`

如果图片不是课程表或课程数量与给定数据严重不符，示例输出：

\`\`\`
<false/>
图片中课程表与给定数据不匹配，周二课程数量超过给定数量。
\`\`\`
</system>
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
            let lessonList: string[][] = JSON.parse(res.value.slice(7))
            for (let i = 0; i < 7; i++) {
                let index = 0
                for (let j = 0; j < scheduleStore.schedule[scheduleId.value][days[i]].lessons.length; j++) {
                    if(scheduleStore.schedule[scheduleId.value][days[i]].lessons[j].isDivider){
                        continue
                    }
                    scheduleStore.schedule[scheduleId.value][days[i]].lessons[j].name = lessonList[i]?.[index] || "未知"
                    index++
                }
            }
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