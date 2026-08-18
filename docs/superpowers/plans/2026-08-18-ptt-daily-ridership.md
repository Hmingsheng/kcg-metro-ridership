# PTT 日均入站資料改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將公開網站改為只呈現可驗證 PTT MRT 板文章中的高雄捷運各站平均每日入站人次。

**Architecture:** 以獨立 PTT 文章解析器，將已驗證文章網址轉為標準化月資料 JSON。前端只載入此資料集，移除年度元件與市府資料；每筆數值附原文連結。

**Tech Stack:** TypeScript、React、Vitest、Vite、GitHub Pages。

**Spec:** `docs/superpowers/specs/2026-08-18-ptt-daily-ridership-design.md`

## Global Constraints

- 只使用 PTT MRT 板文章，不使用市府、高雄捷運公司或其他來源。
- 單位固定為「平均每日入站人次」，不得換算月總量。
- 無法解析與驗證的月份不得寫入資料集；每筆資料必須保存原文網址。
- 公開介面與資料說明使用繁體中文。

---

### Task 1: PTT 文章解析器

**Files:**
- Create: `scripts/ptt.ts`
- Create: `tests/ptt.test.ts`
- Modify: `src/data/query.ts`

**Interfaces:**
- Produces: `PttPost`、`parsePttDailyRidershipPost(post: PttPost): RidershipRecord[]`。
- Consumes: `RidershipRecord`。

- [ ] **Step 1: 寫出失敗測試**

```ts
const post = { url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
  title: '高雄捷運113年12月各站旅運量',
  body: '1 R11 高雄車站 31,580 28,306 28,029' };
expect(parsePttDailyRidershipPost(post)).toEqual([{
  stationId: 'R11', stationName: '高雄車站', period: '2024-12',
  passengers: 31580, sourceUrl: post.url, sourceFile: post.title,
}]);
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/ptt.test.ts --pool=threads --maxWorkers=1`

Expected: FAIL，因解析器尚未存在。

- [ ] **Step 3: 實作最小解析器**

```ts
export type PttPost = { url: string; title: string; body: string };
export function parsePttDailyRidershipPost(post: PttPost): RidershipRecord[] {
  const match = post.title.match(/高雄捷運(\d+)年(\d+)月各站旅運量/);
  if (!match) return [];
  const period = `${Number(match[1]) + 1911}-${match[2].padStart(2, '0')}`;
  // 僅擷取有車站代碼、站名及日均數值的排名列。
}
```

站名標準化：西子灣→哈瑪星、南岡山→岡山高醫、楠梓加工區→楠梓科技園區。

- [ ] **Step 4: 加入拒絕與標準化測試，確認通過**

```ts
expect(parsePttDailyRidershipPost({ ...post, title: '討論文章' })).toEqual([]);
expect(parsePttDailyRidershipPost({ ...post, body: '11 R24 南岡山站 8,326' })[0].stationName).toBe('岡山高醫');
```

Run: `npx vitest run tests/ptt.test.ts --pool=threads --maxWorkers=1`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add scripts/ptt.ts tests/ptt.test.ts src/data/query.ts
git commit -m "feat: parse PTT daily station ridership"
```

### Task 2: PTT 靜態資料建置與驗證

**Files:**
- Create: `scripts/ptt-posts.ts`
- Modify: `scripts/build-data.ts`
- Modify: `scripts/validate.ts`
- Modify: `tests/ptt.test.ts`
- Delete: `public/data/ridership.json`, `public/data/stations.json`, `public/data/metadata.json`
- Modify: `public/data/monthly.json`, `public/data/monthly-metadata.json`

**Interfaces:**
- Consumes: `parsePttDailyRidershipPost`。
- Produces: 僅含 PTT 日均值的 `monthly.json` 與 `monthly-metadata.json`。

- [ ] **Step 1: 寫出失敗測試**

```ts
expect(buildPttRecords([validPost, { url: 'https://www.ptt.cc/bbs/MRT/M.invalid.html', title: '閒聊', body: '' }])).toHaveLength(1);
```

- [ ] **Step 2: 確認失敗**

Run: `npx vitest run tests/ptt.test.ts --pool=threads --maxWorkers=1`

Expected: FAIL，因 `buildPttRecords` 尚未存在。

- [ ] **Step 3: 實作來源清單與建置**

```ts
export const pttPostUrls = [
  'https://www.ptt.cc/bbs/MRT/M.1358301090.A.35C.html',
  'https://www.ptt.cc/bbs/MRT/M.1516461306.A.0D3.html',
];
```

只下載已驗證的網址並解析。中繼資料須為：

```json
{ "sourceUrl": "https://www.ptt.cc/bbs/MRT/index.html",
  "sourceName": "PTT MRT 板：高雄捷運各站旅運量",
  "metric": "平均每日入站人次" }
```

- [ ] **Step 4: 實作驗證並確認通過**

`validate.ts` 僅讀月資料，要求來源主機為 `www.ptt.cc`、月份為 `YYYY-MM`、數值為非負整數且有車站代碼。

Run: `npm run ingest; npm run validate; npx vitest run tests/ptt.test.ts --pool=threads --maxWorkers=1`

Expected: 成功，且所有來源網址皆為 PTT。

- [ ] **Step 5: 提交**

```bash
git add scripts/ptt-posts.ts scripts/build-data.ts scripts/validate.ts tests/ptt.test.ts public/data
git rm public/data/ridership.json public/data/stations.json public/data/metadata.json
git commit -m "feat: build daily ridership data from PTT"
```

### Task 3: 月度專用繁中介面

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/MonthlyDashboard.tsx`
- Modify: `src/components/MonthlyStationExplorer.tsx`
- Delete: `src/components/Dashboard.tsx`, `src/components/StationExplorer.tsx`, `src/components/StationCompare.tsx`
- Modify: `tests/App.test.tsx`, `tests/MonthlyDashboard.test.tsx`

**Interfaces:**
- Consumes: PTT `monthly.json`、`monthly-metadata.json`。
- Produces: 日均月度排行、單站歷史與原文連結。

- [ ] **Step 1: 寫出失敗 UI 測試**

```tsx
render(<MonthlyDashboard records={[record]} periods={['2024-12']} />);
expect(screen.getByRole('columnheader', { name: '平均每日入站人次' })).toBeInTheDocument();
expect(screen.getByRole('link', { name: '查看原文' })).toHaveAttribute('href', record.sourceUrl);
```

- [ ] **Step 2: 確認失敗**

Run: `npx vitest run tests/MonthlyDashboard.test.tsx --pool=threads --maxWorkers=1`

Expected: FAIL，現有介面仍為「入站人次」且沒有原文連結。

- [ ] **Step 3: 實作月度專用載入與畫面**

```tsx
const response = await fetch(`${import.meta.env.BASE_URL}data/monthly.json`);
return { monthlyRecords: await response.json(), metadata: await metadataResponse.json() };
```

移除年度元件與年度檔案載入。排行與單站表格均顯示「平均每日入站人次」，每列增加「查看原文」連結；頁尾說明資料為 PTT 社群文章整理，可能有月份缺漏。

- [ ] **Step 4: 執行完整檢查**

Run: `npm run validate; npm test -- --pool=threads --maxWorkers=1; npm run build`

Expected: 全部成功。

- [ ] **Step 5: 提交**

```bash
git add src tests
git rm src/components/Dashboard.tsx src/components/StationExplorer.tsx src/components/StationCompare.tsx
git commit -m "feat: show PTT daily ridership only"
```

### Task 4: 文件、發布與公開驗證

**Files:**
- Modify: `README.md`
- Modify: `.github/workflows/pages.yml`（僅在驗證仍引用市府檔案時調整）

- [ ] **Step 1: 更新 README**

```md
資料來源為 PTT MRT 板已驗證文章；單位為平均每日入站人次。未找到或無法解析的月份不會顯示。
```

- [ ] **Step 2: 最終驗證**

Run: `npm run ingest; npm run validate; npm test -- --pool=threads --maxWorkers=1; npm run build`

Expected: 中繼資料只提及 PTT，所有命令成功。

- [ ] **Step 3: 推送並驗證發布**

```bash
git add README.md .github/workflows/pages.yml public/data
git commit -m "docs: document PTT daily ridership source"
git push origin main
gh run list --repo Hmingsheng/kcg-metro-ridership --branch main --limit 1
```

Expected: 最新 GitHub Pages 工作流程成功；公開網站可選月份、顯示日均單位並可開啟 PTT 原文。

## 自我檢查

- 規格的資料來源、日均單位、缺月略過、原文連結、移除年度功能與繁中介面，皆由 Task 1 至 Task 4 覆蓋。
- 已檢查沒有 `TBD`、`TODO`、未定義函式或欄位不一致。
- `RidershipRecord.passengers` 在此資料集一律表示日均入站人次，前端與中繼資料會明確標示。

