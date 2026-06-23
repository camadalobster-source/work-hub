import { useEffect, useState } from 'react'
import { Task } from '../domain/task'
import { NewTaskInput } from '../data/TaskRepository'

interface Props {
  editing: Task | null
  onCreate: (input: NewTaskInput) => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  onCancelEdit: () => void
}

const EMPTY = { title: '', notes: '', plannedDate: '', remindAt: '', sortTime: '' }

export default function TaskComposer({ editing, onCreate, onUpdate, onCancelEdit }: Props) {
  const [form, setForm] = useState(EMPTY)

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
      setForm(EMPTY)
    }
  }, [editing])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

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
      setForm(EMPTY)
    }
  }

  const inputCls =
    'rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          {editing ? '編輯待辦' : '新增待辦'}
        </h2>
        {editing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            取消編輯
          </button>
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

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col text-xs text-slate-500">
          預計處理日
          <input type="date" className={inputCls} value={form.plannedDate} onChange={set('plannedDate')} />
        </label>
        <label className="flex flex-col text-xs text-slate-500">
          提醒日
          <input type="date" className={inputCls} value={form.remindAt} onChange={set('remindAt')} />
        </label>
        <label className="flex flex-col text-xs text-slate-500">
          排序時間
          <input type="time" className={inputCls} value={form.sortTime} onChange={set('sortTime')} />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editing ? '儲存' : '加入'}
          </button>
        </div>
      </div>
    </form>
  )
}
