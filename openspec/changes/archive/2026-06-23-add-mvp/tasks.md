## 1. 專案骨架

- [x] 1.1 以 Vite 建立 React + TypeScript 專案
- [x] 1.2 安裝設定 Tailwind CSS
- [x] 1.3 安裝拖曳套件（dnd-kit）
- [x] 1.4 建立目錄結構 domain / data / ui
- [x] 1.5 加入 README、.gitignore、GitHub Pages 部署設定（vite base path）

## 2. Domain 邏輯（純函式 + 測試）

- [x] 2.1 定義 `Task` 型別（task.ts）
- [x] 2.2 實作分區函式（今天／明天／之後／已完成）
- [x] 2.3 實作置頂提醒（needsAttention：逾期／今天到期／到提醒日）
- [x] 2.4 實作同分區排序（sortTime → order → createdAt）
- [x] 2.5 為 2.2–2.4 撰寫單元測試（13 tests 全綠）

## 3. 資料層

- [x] 3.1 定義 `TaskRepository` 介面（list/create/update/remove/reorder）
- [x] 3.2 實作 `LocalStorageTaskRepository`（含 JSON 序列化、空狀態處理）
- [x] 3.3 確認 UI 僅依賴介面，不直接存取 localStorage

## 4. UI

- [x] 4.1 App 組裝：注入 repository、載入待辦、管理狀態
- [x] 4.2 Board：四分區 + 置頂提醒區（紅標樣式、空狀態不顯示）
- [x] 4.3 TaskItem：勾選完成／取消、編輯、刪除、備註多行 + 網址 autolink
- [x] 4.4 TaskComposer：新增／編輯表單（標題必填、備註、預計處理日、提醒日、排序時間）
- [x] 4.5 拖曳排序串接 reorder 並持久化
- [x] 4.6 基本 RWD：桌機為主、手機不破版

## 5. 驗收與交付

- [x] 5.1 對照 specs 逐項手動驗收（建立／完成／提醒置頂／重開資料保留）— Playwright 煙霧測試通過
- [x] 5.2 `vite build` 成功、本機預覽通過
- [x] 5.3 建立 GitHub repo（camadalobster-source/work-hub）並推送
- [x] 5.4 開啟 GitHub Pages，確認線上 demo 可用 — https://camadalobster-source.github.io/work-hub/
