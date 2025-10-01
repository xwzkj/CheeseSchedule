import type { MessageApiInjection, ScrollbarInst } from 'naive-ui'
import type { Ref } from 'vue'

declare global {
    interface Window {
        $NMessageApi: MessageApiInjection
        $outerScrollbar: Ref<ScrollbarInst | null> // 主窗口滚动条 仅主窗口可用
    }
}