import { useEffect, useMemo, useState } from 'react'
import { LocalStorageTaskRepository } from '../data/LocalStorageTaskRepository'
import { NewTaskInput } from '../data/TaskRepository'
import { ISODate, Task, attentionTasks, groupByArea, todayISO } from '../domain/task'
import Board from './Board'
import TaskComposer from './TaskComposer'

export default function App() {
  const repo = useMemo(() => new LocalStorageTaskRepository(), [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [editing, setEditing] = useState<Task | null>(null)
  const today = todayISO()

  const refresh = async () => setTasks(await repo.list())

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groups = useMemo(() => groupByArea(tasks, today), [tasks, today])
  const attention = useMemo(() => attentionTasks(tasks, today), [tasks, today])

  const handleCreate = async (input: NewTaskInput) => {
    await repo.create(input)
    await refresh()
  }

  const handleUpdate = async (id: string, patch: Partial<Task>) => {
    await repo.update(id, patch)
    setEditing(null)
    await refresh()
  }

  const handleToggleDone = async (task: Task) => {
    await repo.update(task.id, {
      status: task.status === 'done' ? 'open' : 'done',
      completedAt: task.status === 'done' ? undefined : new Date().toISOString(),
    })
    await refresh()
  }

  const handleRemove = async (task: Task) => {
    await repo.remove(task.id)
    if (editing?.id === task.id) setEditing(null)
    await refresh()
  }

  const handleSetPlanned = async (task: Task, date: ISODate | undefined) => {
    await repo.update(task.id, { plannedDate: date })
    await refresh()
  }

  const handleReorder = async (orderedIds: string[]) => {
    await repo.reorder(orderedIds)
    await refresh()
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-5">
          <h1 className="text-xl font-bold text-slate-800">
            work-hub <span className="text-sm font-normal text-slate-400">· 工作指揮中心</span>
          </h1>
          <p className="text-xs text-slate-400">{today}　設好就忘，時間到自動冒出來。</p>
        </header>

        <div className="mb-6">
          <TaskComposer
            editing={editing}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onCancelEdit={() => setEditing(null)}
          />
        </div>

        <Board
          groups={groups}
          attention={attention}
          today={today}
          onToggleDone={handleToggleDone}
          onEdit={setEditing}
          onRemove={handleRemove}
          onSetPlanned={handleSetPlanned}
          onReorder={handleReorder}
        />
      </div>
    </div>
  )
}
