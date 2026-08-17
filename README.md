# 高雄捷運站運量

公開查詢高雄都會區大眾捷運系統各站的年度入站人次，提供年度全站排行、單站跨年趨勢與多站比較。

## 本機執行

```powershell
npm install
npm run ingest
npm run dev
```

## 資料來源

歷年資料取自高雄市政府開放資料 API「高雄都會區大眾捷運系統各站旅運量入站」。所有數值均為年度入站人次；缺少年度不以零值或估計值補足。

## 發布

將專案推送到 GitHub 預設分支 `main`，在儲存庫 Settings → Pages 選擇 GitHub Actions。工作流程會驗證已版本化的資料、測試、建置並發布；更新資料時，先在本機執行 `npm run ingest`，檢查後再推送。
