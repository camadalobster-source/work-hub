# local-persistence Specification

## Purpose
TBD - created by archiving change add-mvp. Update Purpose after archive.
## Requirements
### Requirement: 本機持久化
系統 SHALL 將所有待辦資料持久化於瀏覽器 localStorage。重新整理或關閉再開頁面後，資料 MUST 完整保留。

#### Scenario: 重開後資料保留
- **WHEN** 使用者建立若干待辦後關閉並重新開啟頁面
- **THEN** 系統 MUST 還原全部待辦及其狀態、日期與排序

#### Scenario: 首次開啟為空狀態
- **WHEN** 使用者首次開啟頁面且無既有資料
- **THEN** 系統 MUST 以空清單啟動，不報錯

### Requirement: 資料存取抽象介面
所有資料讀寫 MUST 經由單一 `TaskRepository` 介面進行，UI 層 MUST NOT 直接存取 localStorage。MVP SHALL 提供 localStorage 實作；介面 MUST 設計為可由其他實作（如 HTTP 後端）替換而不需改動 UI。

#### Scenario: UI 經由介面存取
- **WHEN** UI 需要讀取或寫入待辦
- **THEN** 系統 MUST 透過 `TaskRepository` 介面，而非直接操作 localStorage

#### Scenario: 實作可替換
- **WHEN** 未來新增一個非 localStorage 的 `TaskRepository` 實作
- **THEN** 系統 MUST 能在不修改 UI 元件的前提下替換資料來源

