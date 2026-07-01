import { Task } from '../domain/task'

// 新增待辦時由使用者提供的欄位（其餘由 repository 補上）
export type NewTaskInput = Pick<Task, 'title'> &
  Partial<Pick<Task, 'notes' | 'plannedDate' | 'remindAt' | 'sortTime'>>

// 資料存取抽象。UI 僅依賴此介面，不直接碰 localStorage。
// 採 Promise 介面，方便日後替換成 HTTP 後端而不需改 UI。
export interface TaskRepository {
  list(): Promise<Task[]>
  create(input: NewTaskInput): Promise<Task>
  update(id: string, patch: Partial<Task>): Promise<Task>
  remove(id: string): Promise<void>
  // 將某分區的待辦依給定 id 順序重新編號（持久化拖曳結果）
  reorder(orderedIds: string[]): Promise<void>
  // 以給定資料整批取代（匯入用）
  replaceAll(tasks: Task[]): Promise<void>
}
