# task-management Specification

## Purpose
TBD - created by archiving change add-mvp. Update Purpose after archive.
## Requirements
### Requirement: 建立待辦
使用者 SHALL 能新增一筆待辦。標題為必填；備註為選填，且 MUST 支援多行（換行分段）。

#### Scenario: 以標題建立待辦
- **WHEN** 使用者輸入標題並送出
- **THEN** 系統建立一筆待辦，狀態為未完成，並出現在對應視圖中

#### Scenario: 標題為空時不可建立
- **WHEN** 使用者未輸入標題即送出
- **THEN** 系統 MUST 拒絕建立並提示標題為必填

#### Scenario: 備註支援多行
- **WHEN** 使用者在備註輸入含換行的多行文字
- **THEN** 系統 MUST 保留換行並在顯示時呈現分段

### Requirement: 備註內的連結自動可點
顯示備註時，系統 SHALL 將其中的網址自動轉為可點擊的連結，並於新分頁開啟。

#### Scenario: 貼上網址自動連結
- **WHEN** 待辦備註含有 `http(s)://` 開頭的網址
- **THEN** 系統 MUST 將該網址渲染為可點擊連結，點擊後於新分頁開啟

### Requirement: 編輯待辦
使用者 SHALL 能編輯既有待辦的標題與備註。

#### Scenario: 修改標題並儲存
- **WHEN** 使用者修改某待辦的標題並儲存
- **THEN** 系統 MUST 更新該待辦內容並立即反映於畫面

### Requirement: 完成勾選
使用者 SHALL 能一鍵將待辦標記為完成。完成的待辦 MUST 記錄完成時間並移至「已完成」分區；使用者亦 SHALL 能取消完成。

#### Scenario: 勾選完成
- **WHEN** 使用者勾選某未完成待辦
- **THEN** 系統 MUST 將其標記為完成、記錄完成時間，並移至「已完成」分區

#### Scenario: 取消完成
- **WHEN** 使用者對已完成待辦取消勾選
- **THEN** 系統 MUST 將其恢復為未完成並移回原本所屬視圖

### Requirement: 刪除待辦
使用者 SHALL 能刪除待辦。

#### Scenario: 刪除待辦
- **WHEN** 使用者刪除某待辦
- **THEN** 系統 MUST 將其自清單與儲存中移除

