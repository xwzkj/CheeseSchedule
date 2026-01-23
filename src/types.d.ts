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
    isDivider: boolean
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
type Week = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type UpdateInfo = {
    hasUpdate: boolean,
    latestVersion: string,
    html_url: string,
    changeLog: {
        full: string,
        simple: string
    },
    assets: {
        name: string,
        browser_download_url: string
    }[],
}
type WidgetParam = {
    label: string,
    type: 'text' | 'date',
    value: any,
}
type WidgetConfig = {
    name: string,
    id: string,
    key: number, // 用于v-for的key
    param: {
        [key: string]: WidgetParam
    },
}

type candidate = { // 抽签候选人
    name: string,
    historyCount: number, // 历史抽中次数，用于计算权重
    isEnabled: boolean,
    isDrawnThisRound: boolean, // 本轮是否已经抽中过，可用于防止多次抽中
}