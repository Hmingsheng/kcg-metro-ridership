import { useEffect, useState } from 'react';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { MonthlyStationExplorer } from './components/MonthlyStationExplorer';
import type { RidershipRecord } from './data/query';

export type Metadata = {
  sourceUrl: string;
  sourceName: string;
  metric: string;
  periods: string[];
  recordCount: number;
  generatedAt: string;
};

export type SiteData = { monthlyRecords: RidershipRecord[]; metadata: Metadata };

async function loadStaticData(): Promise<SiteData> {
  const [monthlyResponse, metadataResponse] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}data/monthly.json`),
    fetch(`${import.meta.env.BASE_URL}data/monthly-metadata.json`),
  ]);
  if (!metadataResponse.ok || !monthlyResponse.ok) {
    throw new Error('Static data request failed');
  }
  return { metadata: await metadataResponse.json(), monthlyRecords: await monthlyResponse.json() };
}

export function App({ loadData = loadStaticData }: { loadData?: () => Promise<SiteData> }) {
  const [data, setData] = useState<SiteData>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadData().then(setData).catch(() => setFailed(true));
  }, [loadData]);

  if (failed) {
    return <main className="status"><h1>資料暫時無法載入</h1><p>請稍後重新載入頁面。</p></main>;
  }
  if (!data) {
    return <main className="status"><p>正在載入各站日均入站資料…</p></main>;
  }

  return <>
    <main>
      <MonthlyDashboard records={data.monthlyRecords} periods={data.metadata.periods} />
      <MonthlyStationExplorer records={data.monthlyRecords} />
    </main>
    <footer>資料來源：<a href={data.metadata.sourceUrl} target="_blank" rel="noreferrer">{data.metadata.sourceName}</a>・資料單位：{data.metadata.metric}・最後產生：{new Date(data.metadata.generatedAt).toLocaleDateString('zh-TW')}・資料為 PTT 社群文章整理，部分月份可能缺漏。</footer>
  </>;
}
