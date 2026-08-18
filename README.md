# 高雄捷運站運量

公開查詢高雄捷運各站的月度「平均每日入站人次」，提供全站排行與單站歷月趨勢。

## 本機執行

```powershell
npm install
npm run ingest
npm run dev
```

## 資料來源

資料取自 [PTT MRT 板](https://www.ptt.cc/bbs/MRT/index.html) 的「高雄捷運各站旅運量」文章。所有數值均為文章所載的平均每日入站人次；僅收錄可驗證的文章月份，不以零值或估計值補足。每筆資料皆保留原始文章連結。

## 發布

將專案推送到 GitHub 預設分支 `main`，在儲存庫 Settings → Pages 選擇 GitHub Actions。工作流程會驗證已版本化的資料、測試、建置並發布；更新資料時，先在本機執行 `npm run ingest`，檢查後再推送。
