import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AREA_LABEL, AREA_ORDER, Area, ISODate, Task } from '../domain/task'
import TaskItem from './TaskItem'

interface Props {
  groups: Record<Area, Task[]>
  attention: Task[]
  today: ISODate
  onToggleDone: (task: Task) => void
  onEdit: (task: Task) => void
  onRemove: (task: Task) => void
  onSetPlanned: (task: Task, date: ISODate | undefined) => void
  onReorder: (orderedIds: string[]) => void
}

export default function Board(props: Props) {
  const { groups, attention, today } = props
  const flaggedIds = new Set(attention.map((t) => t.id))

  return (
    <div className="space-y-6">
      {attention.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-red-50/60 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
            <span>🔺 需注意</span>
            <span className="rounded-full bg-red-200 px-2 text-xs text-red-800">{attention.length}</span>
          </h2>
          <div className="space-y-2">
            {attention.map((t) => (
              <TaskItem key={t.id} task={t} today={today} flagged {...itemHandlers(props)} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {AREA_ORDER.map((area) => (
          <Column
            key={area}
            area={area}
            tasks={groups[area]}
            today={today}
            flaggedIds={flaggedIds}
            handlers={props}
          />
        ))}
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
  }
}

function Column({
  area,
  tasks,
  today,
  flaggedIds,
  handlers,
}: {
  area: Area
  tasks: Task[]
  today: ISODate
  flaggedIds: Set<string>
  handlers: Props
}) {
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

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-slate-600">
        {AREA_LABEL[area]}
        <span className="rounded-full bg-slate-200 px-2 text-xs text-slate-500">{tasks.length}</span>
      </h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-slate-400">（無項目）</p>
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
    </section>
  )
}
