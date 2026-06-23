# work-hub · 工作指揮中心

個人、單機、純工作場景的待辦指揮中心。核心精神：**「設好就忘，時間到自動冒出來」** ＋ **「每天早上排今天、下午結算並排明天」**。

## 功能

- 新增／編輯／刪除待辦，備註可換行、貼網址自動變連結
- **預計處理日**（決定排在哪天）與**提醒日**（到日自動置頂提醒）兩個獨立日期
- 今天／明天／之後／已完成四分區視圖
- 開啟頁面時，把逾期、今天到期、已到提醒日的事自動撈到最上方「需注意」置頂區
- 同分區內拖曳排序（可選填排序時間）
- 一鍵勾選完成；資料存於瀏覽器 localStorage，關掉再開仍在

## 技術

Vite + React + TypeScript + Tailwind CSS + dnd-kit。純前端、無後端、無外部服務。
資料存取經 `TaskRepository` 介面抽象（目前為 localStorage 實作），預留日後接後端（Email 提醒、跨裝置同步）的空間。

## 開發

```bash
npm install
npm run dev      # 本機開發
npm test         # 跑 domain 單元測試
npm run build    # 產出 dist/
npm run preview  # 預覽 build 結果
```

## 部署（GitHub Pages）

`vite.config.ts` 的 `base` 已設為 `/work-hub/`。push 後可用 GitHub Actions 將 `dist/` 發佈到 Pages。

## 規格

本專案以 [OpenSpec](https://github.com/Fission-AI/OpenSpec) spec-driven 流程開發，規格見 `openspec/`。
