import { useMemo, useState } from 'react';
import type { RidershipRecord } from '../data/query';

export function MonthlyStationExplorer({ records }: { records: RidershipRecord[] }) {
  const stations = useMemo(() => [...new Map(records
    .filter((record): record is RidershipRecord & { stationName: string } => Boolean(record.stationName))
    .map((record) => [record.stationId, record.stationName]))]
    .sort((left, right) => left[1].localeCompare(right[1], 'zh-Hant')), [records]);
  const [stationId, setStationId] = useState('');
  const stationName = stations.find(([id]) => id === stationId)?.[1];
  const trend = records.filter((record) => record.stationId === stationId).sort((left, right) => left.period.localeCompare(right.period));

  return <section aria-label="單站月度趨勢">
    <h2>查詢單一車站月度日均運量</h2>
    <label htmlFor="monthly-station">選擇月度車站</label>
    <select id="monthly-station" value={stationId} onChange={(event) => setStationId(event.target.value)}>
      <option value="">請選擇</option>
      {stations.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select>
    {stationName && <>
      <h3>{stationName}月度日均入站趨勢</h3>
      <table><thead><tr><th scope="col">月份</th><th scope="col">平均每日入站人次</th><th scope="col">來源</th></tr></thead><tbody>
        {trend.map((record) => <tr key={record.period}><td>{record.period.slice(0, 4)} 年 {Number(record.period.slice(5))} 月</td><td>{record.passengers.toLocaleString('zh-TW')}</td><td><a href={record.sourceUrl} target="_blank" rel="noreferrer">查看原文</a></td></tr>)}
      </tbody></table>
    </>}
  </section>;
}
