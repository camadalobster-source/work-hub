import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { AREA_LABEL, Area, ISODate, Task } from '../domain/task'
import TaskItem from './TaskItem'

interface Props {
  groups: Record<Area, Task[]>
  attention: Task[]
  today: ISODate
  onToggleDone: (task: Task) => void
  onEdit: (task: Task) => void
  onRemove: (task: Task) => void
  onSetPlanned: (task: Task, date: ISODate | undefined) => void
  onSetWaiting: (task: Task, waiting: boolean) => void
  onDefer: (task: Task) => void
  onReorder: (orderedIds: string[]) => void
}

const WEEKDAY = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

// 'YYYY-MM-DD' → { date: 'YYYY·MM·DD', weekday: '週三' }（signature：mono 帳簿感）
function dateline(iso: ISODate) {
  const [y, m, d] = iso.split('-').map(Number)
  const wd = WEEKDAY[new Date(y, m - 1, d).getDay()]
  return { date: `${y}·${String(m).padStart(2, '0')}·${String(d).padStart(2, '0')}`, weekday: wd }
}

export default function Board(props: Props) {
  const { groups, attention, today } = props
  const flaggedIds = new Set(attention.map((t) => t.id))

  return (
    <div className="space-y-5">
      {/* 置頂：今天（主要區、最顯眼） */}
      <Section area="today" tasks={groups.today} today={today} flaggedIds={flaggedIds} handlers={props} prominent />

      {/* 次要區：兩欄並排、可摺疊 */}
      <div className="grid gap-3 md:grid-cols-2">
        <Section area="tomorrow" tasks={groups.tomorrow} today={today} flaggedIds={flaggedIds} handlers={props} collapsible />
        <Section area="someday" tasks={groups.someday} today={today} flaggedIds={flaggedIds} handlers={props} collapsible />
        <Section area="waiting" tasks={groups.waiting} today={today} flaggedIds={flaggedIds} handlers={props} collapsible />
        <Section area="done" tasks={groups.done} today={today} flaggedIds={flaggedIds} handlers={props} collapsible defaultCollapsed />
      </div>
    </div>
  )
}

function itemHandlers(p: Props) {
  return {
    onToggleDone: p.onToggleDone,
    onEdit: p.onEdit,
    onRemove: p.onRemove,
    onSetPlanned: p.onSetPlanned,
    onSetWaiting: p.onSetWaiting,
    onDefer: p.onDefer,
  }
}

function Section({
  area,
  tasks,
  today,
  flaggedIds,
  handlers,
  prominent = false,
  collapsible = false,
  defaultCollapsed = false,
}: {
  area: Area
  tasks: Task[]
  today: ISODate
  flaggedIds: Set<string>
  handlers: Props
  prominent?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const ids = tasks.map((t) => t.id)

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    handlers.onReorder(arrayMove(ids, oldIndex, newIndex))
  }

  const list = (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="mt-3 space-y-2">
          {tasks.length === 0 ? (
            <p className="py-3 text-xs text-muted">無項目。</p>
          ) : (
            tasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                today={today}
                flagged={flaggedIds.has(t.id)}
                {...itemHandlers(handlers)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  )

  // 今天＝signature 橫幅：mono 日期 + 星期 + 計數，松綠細線
  if (prominent) {
    const { date, weekday } = dateline(today)
    return (
      <section className="rounded-lg border border-line bg-surface p-4 shadow-sm">
        <div className="flex items-baseline gap-3 border-b-2 border-accent pb-2">
          <span className="font-mono text-lg font-semibold text-ink">{date}</span>
          <span className="text-sm text-muted">{weekday}</span>
          <span className="ml-auto text-sm font-semibold text-ink">
            今天 <span className="font-mono text-accent">{tasks.length}</span>
          </span>
        </div>
        {list}
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-4 shadow-sm">
      <button
        type="button"
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
        className={`flex w-full items-center gap-2 text-sm font-semibold text-ink ${
          collapsible ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        {collapsible && <span className="text-xs text-muted">{collapsed ? '›' : '⌄'}</span>}
        <span>{AREA_LABEL[area]}</span>
        <span className="font-mono text-xs text-muted">{tasks.length}</span>
      </button>

      {!collapsed && list}
    </section>
  )
}
