# Design — work-hub MVP

## 技術堆疊
- **Vite + React + TypeScript**：單頁應用，快速開發、易 build。
- **Tailwind CSS**：樣式快速、置頂紅標等狀態樣式好處理。
- **dnd-kit**（或 HTML5 drag-and-drop）：同日拖曳排序。
- 無後端、無外部服務、無第三方帳號。
- 部署：`vite build` → 靜態檔，可推 GitHub Pages 當 demo。

## 資料模型
```ts
type ISODate = string; // 'YYYY-MM-DD'
type HHmm = string;    // 'HH:mm'

interface Task {
  id: string;            // crypto.randomUUID()
  title: string;         // 必填
  notes?: string;        // 多行；顯示時 autolink
  plannedDate?: ISODate; // 預計處理日；undefined = someday
  remindAt?: ISODate;    // 提醒日；與 plannedDate 獨立
  sortTime?: HHmm;       // 可選排序時間
  order: number;         // 同分區內拖曳順序
  status: 'open' | 'done';
  completedAt?: string;  // ISO datetime
  createdAt: string;     // ISO datetime
}
```

## 視圖推導邏輯（純函式，便於測試）
- `today = 本機今天 (YYYY-MM-DD)`
- 分區：
  - `done`：status === 'done'
  - 否則依 plannedDate：`=== today → 今天`、`=== tomorrow → 明天`、`< today 或 > tomorrow 或 undefined → 之後`
    - 註：逾期（plannedDate < today）的未完成項仍顯示於「今天」清單頂或併入置頂提醒區（見下），避免被遺忘。
- **置頂提醒區（needsAttention）** = status open 且（`plannedDate < today` ｜ `plannedDate === today` ｜ `remindAt <= today`）。
- 同分區排序：先依 `sortTime`（有值者在前、依時間升冪），再依 `order`（拖曳序），最後 `createdAt`。

## 架構分層
```
src/
  domain/
    task.ts            // Task 型別、純函式：分區、置頂、排序
    task.test.ts       // 純邏輯單元測試
  data/
    TaskRepository.ts  // 介面：list/create/update/remove/reorder
    LocalStorageTaskRepository.ts
  ui/
    App.tsx
    Board.tsx          // 四分區 + 置頂提醒區
    TaskItem.tsx       // 勾選、編輯、刪除、autolink 備註
    TaskComposer.tsx   // 新增/編輯表單（日期、提醒、排序時間）
  main.tsx
```
- **關鍵約束**：UI 只依賴 `TaskRepository` 介面，不直接碰 localStorage（對應 local-persistence 規格）。之後接後端只需新增 `HttpTaskRepository` 並在組裝處替換。

## TaskRepository 介面（草案）
```ts
interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: Omit<Task,'id'|'order'|'status'|'createdAt'>): Promise<Task>;
  update(id: string, patch: Partial<Task>): Promise<Task>;
  remove(id: string): Promise<void>;
  reorder(area: string, orderedIds: string[]): Promise<void>;
}
```
（MVP 以同步 localStorage 實作，但介面採 Promise 以利日後換成網路後端。）

## 明確不做（MVP 範圍外）
多人/分享/權限、標籤、看板多欄、子任務、重複任務規則、Email/推播、跨裝置同步。架構（Repository 介面）預留 Email/同步接入點，但本次不實作。
