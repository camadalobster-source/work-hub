import { Task } from '../domain/task'
import { NewTaskInput, TaskRepository } from './TaskRepository'

const STORAGE_KEY = 'work-hub.tasks.v1'

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// localStorage 實作。讀寫皆同步，但以 Promise 包裝以符合介面。
export class LocalStorageTaskRepository implements TaskRepository {
  private read(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as Task[]) : []
    } catch {
      return []
    }
  }

  private write(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }

  async list(): Promise<Task[]> {
    return this.read()
  }

  async create(input: NewTaskInput): Promise<Task> {
    const tasks = this.read()
    const maxOrder = tasks.reduce((m, t) => Math.max(m, t.order), 0)
    const task: Task = {
      id: genId(),
      title: input.title.trim(),
      notes: input.notes?.trim() || undefined,
      plannedDate: input.plannedDate || undefined,
      remindAt: input.remindAt || undefined,
      sortTime: input.sortTime || undefined,
      order: maxOrder + 1,
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    this.write([...tasks, task])
    return task
  }

  async update(id: string, patch: Partial<Task>): Promise<Task> {
    const tasks = this.read()
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error(`Task not found: ${id}`)
    const updated: Task = { ...tasks[idx], ...patch, id }
    tasks[idx] = updated
    this.write(tasks)
    return updated
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((t) => t.id !== id))
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const tasks = this.read()
    const rank = new Map(orderedIds.map((id, i) => [id, i]))
    for (const t of tasks) {
      const r = rank.get(t.id)
      if (r !== undefined) t.order = r
    }
    this.write(tasks)
  }

  async replaceAll(tasks: Task[]): Promise<void> {
    this.write(tasks)
  }
}
