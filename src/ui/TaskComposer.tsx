import { useEffect, useState } from 'react'
import { Task, addDaysISO, todayISO } from '../domain/task'
import { NewTaskInput } from '../data/TaskRepository'

interface Props {
  editing: Task | null
  onCreate: (input: NewTaskInput) => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  onCancelEdit: () => void
  onClose?: () => void // 新增模式下收起表單
}

// 新增時的預設：預計處理日帶今天（貼合「每天早上排今天」）；提醒日/排序時間留空。
function emptyForm() {
  return { title: '', notes: '', plannedDate: todayISO(), remindAt: '', sortTime: '' }
}

export default function TaskComposer({ editing, onCreate, onUpdate, onCancelEdit, onClose }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        notes: editing.notes ?? '',
        plannedDate: editing.plannedDate ?? '',
        remindAt: editing.remindAt ?? '',
        sortTime: editing.sortTime ?? '',
      })
    } else {
      setForm(emptyForm())
    }
  }, [editing])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const setPlanned = (v: string) => setForm((f) => ({ ...f, plannedDate: v }))
  const setSortTime = (v: string) => setForm((f) => ({ ...f, sortTime: v }))
  const today = todayISO()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return
    const payload = {
      title,
      notes: form.notes.trim() || undefined,
      plannedDate: form.plannedDate || undefined,
      remindAt: form.remindAt || undefined,
      sortTime: form.sortTime || undefined,
    }
    if (editing) {
      onUpdate(editing.id, payload)
    } else {
      onCreate(payload)
      setForm(emptyForm())
    }
  }

  const inputCls =
    'rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'

  return (
    <form
      onSubmit={submit}
      className={`rounded-lg border bg-surface p-4 shadow-sm transition ${
        editing ? 'border-accent ring-1 ring-accent' : 'border-line'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">
          {editing ? (
            <span className="text-accent">
              正在編輯：<span className="font-normal text-ink">{editing.title}</span>
            </span>
          ) : (
            '新增待辦'
          )}
        </h2>
        {editing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded px-2 py-0.5 text-xs text-muted hover:text-ink"
          >
            取消
          </button>
        ) : (
          onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded px-2 py-0.5 text-xs text-muted hover:text-ink"
            >
              收起
            </button>
          )
        )}
      </div>

      <input
        className={`${inputCls} mb-2 w-full`}
        placeholder="要做的事（必填）"
        value={form.title}
        onChange={set('title')}
        autoFocus
      />
      <textarea
        className={`${inputCls} mb-2 w-full resize-y`}
        placeholder="備註（可換行、貼網址會自動變連結）"
        rows={2}
        value={form.notes}
        onChange={set('notes')}
      />

      {/* 預計處理日：一鍵 chips */}
      <div className="mb-3">
        <div className="mb-1.5 text-xs text-muted">預計處理日</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <DateChip label="今天" active={form.plannedDate === today} onClick={() => setPlanned(today)} />
          <DateChip label="明天" active={form.plannedDate === addDaysISO(today, 1)} onClick={() => setPlanned(addDaysISO(today, 1))} />
          <DateChip label="後天" active={form.plannedDate === addDaysISO(today, 2)} onClick={() => setPlanned(addDaysISO(today, 2))} />
          <DateChip label="下週" active={form.plannedDate === addDaysISO(today, 7)} onClick={() => setPlanned(addDaysISO(today, 7))} />
          <DateChip label="無" active={form.plannedDate === ''} onClick={() => setPlanned('')} />
        </div>
      </div>

      {/* 排序時間：一鍵時段（只影響同區排序） */}
      <div className="mb-3">
        <div className="mb-1.5 text-xs text-muted">排序時間</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <DateChip label="上午" active={form.sortTime === '09:00'} onClick={() => setSortTime('09:00')} />
          <DateChip label="中午" active={form.sortTime === '12:00'} onClick={() => setSortTime('12:00')} />
          <DateChip label="下午" active={form.sortTime === '14:00'} onClick={() => setSortTime('14:00')} />
          <DateChip label="傍晚" active={form.sortTime === '17:00'} onClick={() => setSortTime('17:00')} />
          <DateChip label="晚上" active={form.sortTime === '20:00'} onClick={() => setSortTime('20:00')} />
          <DateChip label="清除" active={form.sortTime === ''} onClick={() => setSortTime('')} />
        </div>
      </div>

      {/* 自訂（進階）：把原生日期/時間框收起，減少日常噪音 */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          className="text-xs text-muted hover:text-ink"
        >
          {showCustom ? '收起進階' : '進階：自訂日期／提醒日／時間'}
        </button>
        {showCustom && (
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              自訂處理日
              <input type="date" className={inputCls} value={form.plannedDate} onChange={set('plannedDate')} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              提醒日
              <input type="date" className={inputCls} value={form.remindAt} onChange={set('remindAt')} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              自訂時間
              <input type="time" className={inputCls} value={form.sortTime} onChange={set('sortTime')} />
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">
          {form.plannedDate || '之後'}
          {form.remindAt ? ` · 提醒 ${form.remindAt}` : ''}
        </span>
        <button type="submit" className="btn-primary rounded-md px-5 py-2 text-sm font-medium">
          {editing ? '儲存' : '加入'}
        </button>
      </div>
    </form>
  )
}

function DateChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? 'bg-accent-soft text-accent ring-1 ring-accent'
          : 'border border-line text-muted hover:text-ink hover:border-muted'
      }`}
    >
      {label}
    </button>
  )
}
