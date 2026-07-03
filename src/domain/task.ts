// 領域模型與純函式：分區、置頂提醒、排序。無副作用，便於單元測試。

export type ISODate = string // 'YYYY-MM-DD'
export type HHmm = string // 'HH:mm'

export interface Task {
  id: string
  title: string
  notes?: string
  plannedDate?: ISODate // 預計處理日；undefined = 之後(someday)
  remindAt?: ISODate // 提醒日；與 plannedDate 獨立
  sortTime?: HHmm // 可選排序時間
  waiting?: boolean // 等待中（卡在別人/被阻擋）；覆蓋日期分區，且不進置頂提醒。選填、向下相容
  deferCount?: number // 延期次數（原子習慣式累計標記）；每按一次「延一天」+1。選填、向下相容
  order: number // 同分區內拖曳順序
  status: 'open' | 'done'
  completedAt?: string // ISO datetime
  createdAt: string // ISO datetime
}

export type Area = 'today' | 'tomorrow' | 'someday' | 'waiting' | 'done'

export const AREA_ORDER: Area[] = ['today', 'tomorrow', 'someday', 'waiting', 'done']

export const AREA_LABEL: Record<Area, string> = {
  today: '今天',
  tomorrow: '明天',
  someday: '之後',
  waiting: '等待',
  done: '已完成',
}

// --- 日期工具（一律以本機時區計算，避免 UTC 位移）---

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now)
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toISODate(dt)
}

// --- 分區 ---

// 歸入「今天」的三種情況：處理日是今天、逾期、或提醒日已到。
// 提醒＝今天要看的事，故提醒到期就把該事浮上今天，不再另立平行清單。
export function areaOf(task: Task, today: ISODate): Area {
  if (task.status === 'done') return 'done'
  if (task.waiting) return 'waiting' // 等待覆蓋日期分區
  const tomorrow = addDaysISO(today, 1)
  if (task.plannedDate === today) return 'today'
  if (task.plannedDate && task.plannedDate < today) return 'today' // 逾期 → 今天
  if (task.remindAt && task.remindAt <= today) return 'today' // 提醒到期 → 浮上今天
  if (task.plannedDate === tomorrow) return 'tomorrow'
  return 'someday'
}

// 今天區塊內「需注意」的判定：逾期或提醒到期（不含單純今天到期），
// 未完成且非等待。用於今天區塊的計數與逐列標記，讓緊急的事在今天裡跳出來。
export function isUrgent(task: Task, today: ISODate): boolean {
  if (task.status !== 'open' || task.waiting) return false
  if (task.plannedDate && task.plannedDate < today) return true
  if (task.remindAt && task.remindAt <= today) return true
  return false
}

// --- 置頂提醒 ---

// 未完成且：逾期 ｜ 今天到期 ｜ 已到提醒日
export function needsAttention(task: Task, today: ISODate): boolean {
  if (task.status !== 'open') return false
  if (task.waiting) return false // 等待中的事已被主動擱置，不再置頂催
  if (task.plannedDate && task.plannedDate <= today) return true
  if (task.remindAt && task.remindAt <= today) return true
  return false
}

// --- 排序：先 sortTime（有值在前、升冪），再 order（拖曳序），最後 createdAt ---

export function compareTasks(a: Task, b: Task): number {
  if (a.sortTime && b.sortTime) {
    if (a.sortTime !== b.sortTime) return a.sortTime < b.sortTime ? -1 : 1
  } else if (a.sortTime) {
    return -1
  } else if (b.sortTime) {
    return 1
  }
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1
  return 0
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(compareTasks)
}

// --- 分群（含已排序）---

export function groupByArea(tasks: Task[], today: ISODate): Record<Area, Task[]> {
  const groups: Record<Area, Task[]> = { today: [], tomorrow: [], someday: [], waiting: [], done: [] }
  for (const t of tasks) groups[areaOf(t, today)].push(t)
  for (const area of AREA_ORDER) groups[area] = sortTasks(groups[area])
  return groups
}

export function attentionTasks(tasks: Task[], today: ISODate): Task[] {
  return sortTasks(tasks.filter((t) => needsAttention(t, today)))
}
