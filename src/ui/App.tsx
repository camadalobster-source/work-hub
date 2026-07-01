import { useEffect, useMemo, useRef, useState } from 'react'
import { LocalStorageTaskRepository } from '../data/LocalStorageTaskRepository'
import { NewTaskInput } from '../data/TaskRepository'
import { ISODate, Task, addDaysISO, attentionTasks, groupByArea, todayISO } from '../domain/task'
import Board from './Board'
import TaskComposer from './TaskComposer'

export default function App() {
  const repo = useMemo(() => new LocalStorageTaskRepository(), [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [editing, setEditing] = useState<Task | null>(null)
  const today = todayISO()
  const composerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('work-hub.theme') === 'dark'
    } catch {
      return false
    }
  })

  const refresh = async () => setTasks(await repo.list())

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 深色模式：掛/卸 <html class="dark"> 並記住偏好
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('work-hub.theme', dark ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }, [dark])

  // 進入編輯時：把上方表單捲進視野（高亮由 TaskComposer 自身的 ring 呈現）
  useEffect(() => {
    if (editing) composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editing])

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
    // 指定日期即視為「重新排上時程」，一併解除等待狀態
    await repo.update(task.id, { plannedDate: date, waiting: false })
    await refresh()
  }

  const handleSetWaiting = async (task: Task, waiting: boolean) => {
    await repo.update(task.id, { waiting })
    await refresh()
  }

  // 延一天：處理日推到明天、延期次數 +1、解除等待（原子習慣式累計標記）
  const handleDefer = async (task: Task) => {
    await repo.update(task.id, {
      plannedDate: addDaysISO(today, 1),
      deferCount: (task.deferCount ?? 0) + 1,
      waiting: false,
    })
    await refresh()
  }

  const handleReorder = async (orderedIds: string[]) => {
    await repo.reorder(orderedIds)
    await refresh()
  }

  const downloadJSON = (data: Task[], name: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleExport = () => {
    downloadJSON(tasks, `work-hub-backup-${today}.json`)
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 允許連續匯入同一檔
    if (!file) return
    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      alert('匯入失敗：不是有效的 JSON 檔')
      return
    }
    if (!Array.isArray(parsed)) {
      alert('匯入失敗：檔案格式不對（應為待辦陣列）')
      return
    }
    const incoming = parsed as Task[]
    if (
      !confirm(
        `即將以「${incoming.length}」筆匯入資料「取代」目前的「${tasks.length}」筆。\n` +
          `按下確定前，會先自動下載一份目前資料的備份。要繼續嗎？`,
      )
    )
      return
    downloadJSON(tasks, `work-hub-before-import-${today}.json`)
    await repo.replaceAll(incoming)
    setEditing(null)
    await refresh()
  }

  const toolBtnCls =
    'rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink hover:border-muted'

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="font-mono text-lg font-semibold tracking-tight text-ink">work-hub</h1>
            <span className="text-xs text-muted">工作指揮台</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className={toolBtnCls}
              aria-label="切換深淺色"
            >
              {dark ? '淺色' : '深色'}
            </button>
            <button type="button" onClick={handleExport} className={toolBtnCls}>
              匯出
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className={toolBtnCls}>
              匯入
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div ref={composerRef} className="scroll-mt-4">
            <TaskComposer
              editing={editing}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditing(null)}
            />
          </div>

          {/* 需注意：精簡提醒（名稱＋勾選；點名稱可編輯） */}
          <section className="rounded-lg border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 border-l-2 border-alert pl-2 text-sm font-semibold text-ink">
              需注意
              <span className="font-mono text-xs text-alert">{attention.length}</span>
            </h2>
            {attention.length === 0 ? (
              <p className="text-sm text-muted">沒有需要注意的事。</p>
            ) : (
              <ul className="space-y-2">
                {attention.map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleToggleDone(t)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-alert)]"
                      aria-label="標為完成"
                    />
                    <button
                      type="button"
                      onClick={() => setEditing(t)}
                      className="truncate text-left text-[0.9375rem] text-ink hover:text-alert hover:underline"
                      title="編輯"
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <Board
          groups={groups}
          attention={attention}
          today={today}
          onToggleDone={handleToggleDone}
          onEdit={setEditing}
          onRemove={handleRemove}
          onSetPlanned={handleSetPlanned}
          onSetWaiting={handleSetWaiting}
          onDefer={handleDefer}
          onReorder={handleReorder}
        />
      </div>
    </div>
  )
}
