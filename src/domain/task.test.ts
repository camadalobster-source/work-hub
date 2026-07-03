import { describe, it, expect } from 'vitest'
import {
  Task,
  addDaysISO,
  areaOf,
  isUrgent,
  needsAttention,
  sortTasks,
  groupByArea,
  attentionTasks,
} from './task'

const TODAY = '2026-06-23'
const TOMORROW = '2026-06-24'

function mk(p: Partial<Task>): Task {
  return {
    id: p.id ?? Math.random().toString(36).slice(2),
    title: p.title ?? 'x',
    notes: p.notes,
    plannedDate: p.plannedDate,
    remindAt: p.remindAt,
    sortTime: p.sortTime,
    waiting: p.waiting,
    order: p.order ?? 0,
    status: p.status ?? 'open',
    completedAt: p.completedAt,
    createdAt: p.createdAt ?? '2026-06-01T00:00:00.000Z',
  }
}

describe('日期工具', () => {
  it('addDaysISO 跨月正確', () => {
    expect(addDaysISO('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDaysISO('2026-01-01', -1)).toBe('2025-12-31')
  })
})

describe('areaOf 分區', () => {
  it('今天 / 明天 / 之後', () => {
    expect(areaOf(mk({ plannedDate: TODAY }), TODAY)).toBe('today')
    expect(areaOf(mk({ plannedDate: TOMORROW }), TODAY)).toBe('tomorrow')
    expect(areaOf(mk({}), TODAY)).toBe('someday')
  })
  it('逾期未完成歸入今天', () => {
    expect(areaOf(mk({ plannedDate: '2026-06-20' }), TODAY)).toBe('today')
  })
  it('已完成歸入 done', () => {
    expect(areaOf(mk({ status: 'done', plannedDate: TODAY }), TODAY)).toBe('done')
  })
  it('等待覆蓋日期分區（即使處理日是今天/逾期）', () => {
    expect(areaOf(mk({ waiting: true, plannedDate: TODAY }), TODAY)).toBe('waiting')
    expect(areaOf(mk({ waiting: true, plannedDate: '2026-06-20' }), TODAY)).toBe('waiting')
  })
  it('已完成優先於等待', () => {
    expect(areaOf(mk({ status: 'done', waiting: true }), TODAY)).toBe('done')
  })
  it('未來日期（非明天）歸入之後', () => {
    expect(areaOf(mk({ plannedDate: '2026-07-15' }), TODAY)).toBe('someday')
  })
  it('提醒到期浮上今天（無處理日）', () => {
    expect(areaOf(mk({ remindAt: TODAY }), TODAY)).toBe('today')
    expect(areaOf(mk({ remindAt: '2026-06-22' }), TODAY)).toBe('today')
  })
  it('提醒到期覆蓋未來處理日，浮上今天', () => {
    expect(areaOf(mk({ plannedDate: '2026-07-15', remindAt: TODAY }), TODAY)).toBe('today')
    expect(areaOf(mk({ plannedDate: TOMORROW, remindAt: TODAY }), TODAY)).toBe('today')
  })
  it('未來提醒日不影響分區', () => {
    expect(areaOf(mk({ plannedDate: TOMORROW, remindAt: '2026-07-31' }), TODAY)).toBe('tomorrow')
    expect(areaOf(mk({ remindAt: '2026-07-31' }), TODAY)).toBe('someday')
  })
})

describe('isUrgent 今天內需注意', () => {
  it('逾期觸發', () => {
    expect(isUrgent(mk({ plannedDate: '2026-06-20' }), TODAY)).toBe(true)
  })
  it('提醒到期觸發', () => {
    expect(isUrgent(mk({ remindAt: TODAY }), TODAY)).toBe(true)
  })
  it('單純今天到期不算需注意', () => {
    expect(isUrgent(mk({ plannedDate: TODAY }), TODAY)).toBe(false)
  })
  it('等待中不觸發（即使逾期）', () => {
    expect(isUrgent(mk({ waiting: true, plannedDate: '2026-06-20' }), TODAY)).toBe(false)
  })
  it('已完成不觸發', () => {
    expect(isUrgent(mk({ status: 'done', plannedDate: '2026-06-20' }), TODAY)).toBe(false)
  })
})

describe('needsAttention 置頂提醒', () => {
  it('逾期 / 今天到期觸發', () => {
    expect(needsAttention(mk({ plannedDate: '2026-06-20' }), TODAY)).toBe(true)
    expect(needsAttention(mk({ plannedDate: TODAY }), TODAY)).toBe(true)
  })
  it('到提醒日觸發（即使無處理日）', () => {
    expect(needsAttention(mk({ remindAt: TODAY }), TODAY)).toBe(true)
    expect(needsAttention(mk({ remindAt: '2026-06-22' }), TODAY)).toBe(true)
  })
  it('未來提醒日不觸發（footer 案例：到 7/31 前安靜）', () => {
    expect(needsAttention(mk({ remindAt: '2026-07-31' }), TODAY)).toBe(false)
  })
  it('已完成不觸發', () => {
    expect(needsAttention(mk({ status: 'done', plannedDate: TODAY }), TODAY)).toBe(false)
  })
  it('等待中不觸發（即使逾期）', () => {
    expect(needsAttention(mk({ waiting: true, plannedDate: '2026-06-20' }), TODAY)).toBe(false)
  })
})

describe('sortTasks 排序', () => {
  it('有 sortTime 者在前並依時間升冪', () => {
    const a = mk({ id: 'a', sortTime: '09:00' })
    const b = mk({ id: 'b', sortTime: '14:00' })
    const c = mk({ id: 'c' })
    expect(sortTasks([c, b, a]).map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })
  it('無 sortTime 時依 order', () => {
    const a = mk({ id: 'a', order: 2 })
    const b = mk({ id: 'b', order: 1 })
    expect(sortTasks([a, b]).map((t) => t.id)).toEqual(['b', 'a'])
  })
})

describe('groupByArea / attentionTasks 整合', () => {
  const tasks = [
    mk({ id: 'overdue', plannedDate: '2026-06-20' }),
    mk({ id: 'today', plannedDate: TODAY }),
    mk({ id: 'tomo', plannedDate: TOMORROW }),
    mk({ id: 'footer', remindAt: '2026-07-31' }),
    mk({ id: 'done', status: 'done', plannedDate: TODAY }),
  ]
  it('分區正確', () => {
    const g = groupByArea(tasks, TODAY)
    expect(g.today.map((t) => t.id).sort()).toEqual(['overdue', 'today'])
    expect(g.tomorrow.map((t) => t.id)).toEqual(['tomo'])
    expect(g.someday.map((t) => t.id)).toEqual(['footer'])
    expect(g.done.map((t) => t.id)).toEqual(['done'])
  })
  it('置頂只含逾期與今天到期（footer 尚未到期不入）', () => {
    expect(attentionTasks(tasks, TODAY).map((t) => t.id).sort()).toEqual(['overdue', 'today'])
  })
})
