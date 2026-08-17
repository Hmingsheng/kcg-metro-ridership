import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { StationExplorer } from './components/StationExplorer';
import { StationCompare } from './components/StationCompare';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { MonthlyStationExplorer } from './components/MonthlyStationExplorer';
import type { RidershipRecord } from './data/query';

export type Metadata = {
  sourceUrl: string;
  sourceName: string;
  metric: string;
  years: string[];
  recordCount: number;
  generatedAt: string;
};

export type SiteData = { records: RidershipRecord[]; metadata: Metadata; monthlyRecords?: RidershipRecord[] };

async function loadStaticData(): Promise<SiteData> {
  const [recordsResponse, metadataResponse, monthlyResponse] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}data/ridership.json`),
    fetch(`${import.meta.env.BASE_URL}data/metadata.json`),
    fetch(`${import.meta.env.BASE_URL}data/monthly.json`),
  ]);
  if (!recordsResponse.ok || !metadataResponse.ok || !monthlyResponse.ok) {
    throw new Error('Static data request failed');
  }
  return { records: await recordsResponse.json(), metadata: await metadataResponse.json(), monthlyRecords: await monthlyResponse.json() };
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
    return <main className="status"><p>正在載入歷年入站資料…</p></main>;
  }

  return <>
    <Dashboard records={data.records} years={data.metadata.years} />
    <main>
      {data.monthlyRecords?.length ? <>
        <MonthlyDashboard records={data.monthlyRecords} periods={[...new Set(data.monthlyRecords.map((record) => record.period))].sort()} />
        <MonthlyStationExplorer records={data.monthlyRecords} />
      </> : null}
      <StationExplorer records={data.records} />
      <StationCompare records={data.records} years={data.metadata.years} />
    </main>
    <footer>資料來源：<a href={data.metadata.sourceUrl} target="_blank" rel="noreferrer">資料來源</a>・最後產生：{new Date(data.metadata.generatedAt).toLocaleDateString('zh-TW')}</footer>
  </>;
}
