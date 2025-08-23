type Pattern = {
    name: string,
    data: {
        isDivider: boolean,
        time?: string
    }[]
}
type Lesson = { name: string, time: string, active?: boolean }
type Day = { pattern: string | null, lessons: (Lesson | "divider")[] }
type Schedule = {
    mon: Day,
    tue: Day,
    wed: Day,
    thu: Day,
    fri: Day,
    sat: Day,
    sun: Day
}