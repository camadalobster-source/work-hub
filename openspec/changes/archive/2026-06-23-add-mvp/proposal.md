## Why

Henry 需要一個「只給自己、只用於工作」的待辦指揮中心。現有工具都不合用：Google 日曆要留給個人生活、Outlook 偏會議排程、Trello 功能過多太重。核心痛點有兩個：(1) 未來才要處理的事（例如「7 月底提醒把 footer 連到新聞舊站的連結下掉」）需要「設好就忘、時間到自動冒出來」；(2) 每天早上需要快速排出今天工作、下午結算完成並順手排好明天。

## What Changes

- 新增一個單頁 web 應用 `work-hub`（純前端、單機、免登入）。
- 提供待辦的新增／編輯／完成勾選，內容支援換行分段與自動連結。
- 提供兩種獨立日期：**預計處理日**（決定排在哪天）與**提醒日**（到日自動置頂提醒）。
- 提供同一天內的手動拖曳排序，並可選填排序時間。
- 提供每日視圖：今天／明天／之後／已完成四個分區。
- 開啟頁面時自動把「逾期、今天到期、已到提醒日」的事撈到最上方置頂提醒區。
- 資料存於瀏覽器 localStorage，所有讀寫經過 `TaskRepository` 抽象介面，預留之後接後端（Email 提醒、跨裝置同步）的空間，**但本次不實作後端**。

## Capabilities

### New Capabilities
- `task-management`: 待辦的建立、編輯、完成勾選與內容呈現（標題、可換行含連結的備註）。
- `task-scheduling`: 預計處理日、提醒日、同日排序（拖曳順序＋可選排序時間）。
- `daily-board`: 今天／明天／之後／已完成四分區視圖，以及開啟時的到期置頂提醒區。
- `local-persistence`: localStorage 持久化與 `TaskRepository` 抽象介面（預留後端替換）。

### Modified Capabilities
（無，全新專案。）

## Impact

- 全新 repo：`~/Documents/projects/web-tools/work-hub`，推到 GitHub `camadalobster-source`，可開 GitHub Pages 當線上 demo。
- 技術堆疊：Vite + React + TypeScript + Tailwind；無後端、無外部服務、無第三方帳號串接。
- 後續（非本次範圍）：輕量後端 + 排程器寄 Email 提醒、跨裝置同步——靠 `TaskRepository` 介面接入，前端幾乎不動。
