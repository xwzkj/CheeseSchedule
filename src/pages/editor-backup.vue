<template>
    <div class="p-1rem">

        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <div class="text-1.5rem">备份管理
                    <span class="text-1.1rem text-#999">（当前{{ metadata.items?.length || 0 }}个）</span>
                </div>
                <div class="flex gap-2">
                    <n-button secondary type="primary" @click="backupNow">立即备份</n-button>
                    <n-popconfirm @positive-click="removeAllBackups">
                        <template #trigger>
                            <n-button secondary type="error">清空备份</n-button>
                        </template>
                        危险！确定清空所有备份吗？
                    </n-popconfirm>
                </div>
            </div>
            <div v-if="metadata.items?.length === 0">
                <div class="text-center text-#999 text-1.2rem">暂无备份文件</div>
            </div>
            <n-table v-else>
                <thead>
                    <tr>
                        <th>文件名</th>
                        <th>备份时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in metadata.items" :key="item.fileName">
                        <td>{{ item.fileName }}</td>
                        <td>{{ Dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</td>
                        <td>
                            <div class="flex gap-1">
                                <n-popconfirm @positive-click="restoreBackup(item.fileName)">
                                    <template #trigger>
                                        <n-button secondary type="primary" size="small">恢复</n-button>
                                    </template>
                                    确定恢复备份文件 {{ item.fileName }} 吗？将在备份当前配置后恢复。
                                </n-popconfirm>
                                <n-popconfirm @positive-click="removeBackup(item.fileName)">
                                    <template #trigger>
                                        <n-button secondary type="error" size="small">删除</n-button>
                                    </template>
                                    确定删除备份文件 {{ item.fileName }} 吗？
                                </n-popconfirm>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </n-table>
        </div>

    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useScheduleStore } from '../stores/scheduleStore';
import { NTable, NButton, NPopconfirm } from 'naive-ui';
import { BaseDirectory, copyFile, exists, readTextFile, remove, writeTextFile } from '@tauri-apps/plugin-fs';
import Dayjs from 'dayjs';
const scheduleStore = useScheduleStore()
let metadata = ref<BackupMetadata>({ version: 1, items: [] })
onMounted(async () => {
    await loadBackupMetadata()
})
async function loadBackupMetadata() {
    try {
        if (await exists("backup/metadata.json", { baseDir: BaseDirectory.AppData })) {
            try {
                let mf = JSON.parse(await readTextFile("backup/metadata.json", { baseDir: BaseDirectory.AppData }))
                if (mf.version === 1) {
                    metadata.value = mf
                }
            } catch (e) {
                console.error("备份元数据解析失败", e)
            }
        } else {
            metadata.value = { version: 1, items: [] }
        }
    } catch (error) {
        console.log("读取备份元数据失败", error)
        window.$NMessageApi.error("读取备份元数据失败")
    }
}
async function backupNow() {
    let res = await scheduleStore.saveBackup('manual')
    if (res.ok) {
        window.$NMessageApi.success('已备份当前配置')
    } else {
        window.$NMessageApi.error(res.msg)
    }
    await loadBackupMetadata()
}
async function removeAllBackups() {
    try {
        await remove("backup", { baseDir: BaseDirectory.AppData, recursive: true })
        window.$NMessageApi.success('已清空所有备份')
    } catch (error) {
        console.log("备份清空失败", error)
        window.$NMessageApi.error('备份清空失败')
    }
    await loadBackupMetadata()
}
async function restoreBackup(fileName: string) {
    if (!await exists(`backup/${fileName}`, { baseDir: BaseDirectory.AppData })) {
        await removeBackup(fileName)
        window.$NMessageApi.error(`备份${fileName}不存在，已尝试删除该备份`)
        return
    }
    let res = await scheduleStore.saveBackup('beforeRestore')
    if (res.canContinue) {
        if (res.ok) {
            window.$NMessageApi.success('已备份当前配置')
        } else {
            window.$NMessageApi.success('当前配置无需备份')
        }
    } else {
        window.$NMessageApi.error("备份失败，已停止恢复流程：" + res.msg)
        return
    }
    try {
        await copyFile(`backup/${fileName}`, `config.json`, { fromPathBaseDir: BaseDirectory.AppData, toPathBaseDir: BaseDirectory.AppData })
    } catch (error) {
        console.log(`备份${fileName}恢复失败`, error)
        window.$NMessageApi.error(`备份${fileName}恢复失败`)
        return
    }
    window.$NMessageApi.success(`已恢复备份，重启应用生效`)
}
async function removeBackup(fileName: string) {
    try {
        if (await exists(`backup/${fileName}`, { baseDir: BaseDirectory.AppData })) {
            await remove(`backup/${fileName}`, { baseDir: BaseDirectory.AppData })
        }
        await loadBackupMetadata() // 此时metadata文件可能有更新 读取新文件
        metadata.value.items = metadata.value.items.filter(item => item.fileName !== fileName)
        await writeTextFile("backup/metadata.json", JSON.stringify(metadata.value), { baseDir: BaseDirectory.AppData })
        window.$NMessageApi.success(`已删除备份${fileName}`)
    } catch (error) {
        console.log(`备份${fileName}删除失败`, error)
        window.$NMessageApi.error(`备份${fileName}删除失败`)
    }
    await loadBackupMetadata() // 更新页面
}
</script>

<style scoped></style>