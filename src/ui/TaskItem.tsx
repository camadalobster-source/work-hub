import { useState } from 'react'
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
  onSetWaiting: (task: Task, waiting: boolean) => void
  onDefer: (task: Task) => void
}

// 'YYYY-MM-DD' → 'MM·DD'（mono 短日期）
function md(iso: ISODate) {
  const [, m, d] = iso.split('-')
  return `${m}·${d}`
}

function dateBadges(task: Task, today: ISODate) {
  const badges: { text: string; cls: string; mono?: boolean }[] = []
  const neutral = 'border border-line text-muted'
  const hold = 'bg-hold-soft text-hold'
  const alert = 'bg-alert-soft text-alert'

  if (task.waiting && task.status === 'open') {
    badges.push({ text: '等待', cls: hold })
  }
  const deferN = task.deferCount ?? 0
  if (deferN >= 1 && task.status === 'open') {
    const cls = deferN >= 5 ? alert : deferN >= 3 ? hold : neutral
    badges.push({ text: `${deferN >= 5 ? '🔥 ' : ''}延 ×${deferN}`, cls, mono: true })
  }
  if (task.plannedDate && task.plannedDate < today && task.status === 'open' && !task.waiting) {
    badges.push({ text: `逾期 ${md(task.plannedDate)}`, cls: alert, mono: true })
  } else if (task.plannedDate) {
    badges.push({ text: `處理 ${md(task.plannedDate)}`, cls: neutral, mono: true })
  }
  if (task.remindAt) {
    const due = task.remindAt <= today
    badges.push({ text: `提醒 ${md(task.remindAt)}`, cls: due ? hold : neutral, mono: true })
  }
  if (task.sortTime) badges.push({ text: task.sortTime, cls: neutral, mono: true })
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
  onSetWaiting,
  onDefer,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const done = task.status === 'done'
  const badges = dateBadges(task, today)
  const close = () => setMenuOpen(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border bg-surface p-3 shadow-sm transition ${
        flagged
          ? 'border-line border-l-2 border-l-alert'
          : task.waiting && !done
            ? 'border-line border-l-2 border-l-hold'
            : 'border-line'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-line hover:text-muted active:cursor-grabbing"
          title="拖曳排序"
          aria-label="拖曳排序"
        >
          ⠿
        </button>

        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggleDone(task)}
          className="mt-1 h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
          aria-label="標為完成"
        />

        <div className="min-w-0 flex-1">
          <div className={`break-words text-[0.9375rem] font-medium leading-snug ${done ? 'text-muted line-through' : 'text-ink'}`}>
            {task.title}
          </div>
          {task.notes && (
            <div className="mt-1 whitespace-pre-wrap break-words text-xs text-muted">
              {linkify(task.notes)}
            </div>
          )}
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {badges.map((b, i) => (
                <span
                  key={i}
                  className={`rounded px-1.5 py-0.5 text-[0.6875rem] ${b.mono ? 'font-mono' : ''} ${b.cls}`}
                >
                  {b.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 動作：常駐顯示。主要=延一天，其餘收進 ⋯ 選單 */}
        <div className="relative flex shrink-0 items-center gap-1">
          {!done && (
            <button
              type="button"
              onClick={() => onDefer(task)}
              className="rounded border border-line px-2 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent"
              title="延到明天，並記一次延期"
            >
              延一天
            </button>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded px-1.5 py-0.5 text-muted transition hover:text-ink"
            aria-label="更多動作"
          >
            ⋯
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="關閉選單"
                onClick={close}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-28 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg">
                {!done && (
                  <>
                    <MenuItem label="排今天" onClick={() => { onSetPlanned(task, today); close() }} />
                    <MenuItem label="排明天" onClick={() => { onSetPlanned(task, addDay(today)); close() }} />
                    <MenuItem label="移到之後" onClick={() => { onSetPlanned(task, undefined); close() }} />
                    <MenuItem
                      label={task.waiting ? '取消等待' : '標為等待'}
                      onClick={() => { onSetWaiting(task, !task.waiting); close() }}
                    />
                  </>
                )}
                <MenuItem label="編輯" onClick={() => { onEdit(task); close() }} />
                <MenuItem label="刪除" danger onClick={() => { onRemove(task); close() }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-canvas ${danger ? 'text-alert' : 'text-ink'}`}
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
