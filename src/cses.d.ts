type CsesClass = {
    subject: string
    start_time: string // HH:MM:SS
    end_time: string // HH:MM:SS
}

type CsesSchedule = {
    name: string
    enable_day: number // 星期几启用，1-7
    weeks?: 'odd' | 'even'
    classes: CsesClass[]
}

type CsesSubject = {
    name: string
    simplified_name?: string
    room?: string
    teacher?: string
}

type CSES = {
    version: number,
    subjects: CsesSubject[],
    schedules: CsesSchedule[]
}