import { useMemo, useState } from 'react';
import type { RidershipRecord } from '../data/query';

export function StationExplorer({ records }: { records: RidershipRecord[] }) {
  const stations = useMemo(() => [...new Map(records
    .filter((record): record is RidershipRecord & { stationName: string } => Boolean(record.stationName))
    .map((record) => [record.stationId, record.stationName]))]
    .sort((left, right) => left[1].localeCompare(right[1], 'zh-Hant')), [records]);
  const [stationId, setStationId] = useState('');
  const stationName = stations.find(([id]) => id === stationId)?.[1];
  const trend = records.filter((record) => record.stationId === stationId).sort((left, right) => left.period.localeCompare(right.period));

  return <section aria-label="車站歷年趨勢">
    <h2>查詢單一車站</h2>
    <label htmlFor="station">選擇車站</label>
    <select id="station" value={stationId} onChange={(event) => setStationId(event.target.value)}>
      <option value="">請選擇</option>
      {stations.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select>
    {stationName && <>
      <h3>{stationName}歷年入站趨勢</h3>
      <table>
        <thead><tr><th scope="col">年度</th><th scope="col">入站人次</th></tr></thead>
        <tbody>{trend.map((record) => <tr key={record.period}><td>{record.period}</td><td>{record.passengers.toLocaleString('zh-TW')}</td></tr>)}</tbody>
      </table>
    </>}
  </section>;
}
