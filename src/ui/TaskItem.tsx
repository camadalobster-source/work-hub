import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, ISODate } from '../domain/task'
import { linkify } from './linkify'

interface Props {
  task: Task
  today: ISODate
  flagged?: boolean // 是否在置頂提醒區呈現
  onToggleDone: (task: Task) => void
  onEdit: (task: Task) => void
  onRemove: (task: Task) => void
  onSetPlanned: (task: Task, date: ISODate | undefined) => void
}

function dateBadges(task: Task, today: ISODate) {
  const badges: { text: string; cls: string }[] = []
  if (task.plannedDate && task.plannedDate < today && task.status === 'open') {
    badges.push({ text: `逾期 ${task.plannedDate}`, cls: 'bg-red-100 text-red-700' })
  } else if (task.plannedDate) {
    badges.push({ text: `處理 ${task.plannedDate}`, cls: 'bg-slate-100 text-slate-600' })
  }
  if (task.remindAt) {
    const due = task.remindAt <= today
    badges.push({
      text: `🔔 ${task.remindAt}`,
      cls: due ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500',
    })
  }
  if (task.sortTime) badges.push({ text: `⏱ ${task.sortTime}`, cls: 'bg-slate-100 text-slate-500' })
  return badges
}

export default function TaskItem({
  task,
  today,
  flagged,
  onToggleDone,
  onEdit,
  onRemove,
  onSetPlanned,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const done = task.status === 'done'
  const badges = dateBadges(task, today)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border bg-white p-3 shadow-sm ${
        flagged ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          title="拖曳排序"
          aria-label="拖曳排序"
        >
          ⠿
        </button>

        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggleDone(task)}
          className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
          aria-label="完成"
        />

        <div className="min-w-0 flex-1">
          <div className={`break-words text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {task.title}
          </div>
          {task.notes && (
            <div className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500">
              {linkify(task.notes)}
            </div>
          )}
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {badges.map((b, i) => (
                <span key={i} className={`rounded px-1.5 py-0.5 text-[11px] ${b.cls}`}>
                  {b.text}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 opacity-0 transition group-hover:opacity-100">
          <div className="flex gap-1">
            <button type="button" onClick={() => onEdit(task)} className="text-xs text-slate-400 hover:text-blue-600">
              編輯
            </button>
            <button type="button" onClick={() => onRemove(task)} className="text-xs text-slate-400 hover:text-red-600">
              刪除
            </button>
          </div>
          {!done && (
            <div className="flex gap-1">
              <QuickDate label="今天" onClick={() => onSetPlanned(task, today)} />
              <QuickDate label="明天" onClick={() => onSetPlanned(task, addDay(today))} />
              <QuickDate label="之後" onClick={() => onSetPlanned(task, undefined)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickDate({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200"
    >
      {label}
    </button>
  )
}

function addDay(iso: ISODate): ISODate {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + 1)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
