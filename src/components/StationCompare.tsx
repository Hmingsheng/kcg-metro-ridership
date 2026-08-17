import { useMemo, useState } from 'react';
import type { RidershipRecord } from '../data/query';

type Props = { records: RidershipRecord[]; years: string[] };

export function StationCompare({ records, years }: Props) {
  const [year, setYear] = useState(years.at(-1) ?? '');
  const [stationIds, setStationIds] = useState<string[]>([]);
  const stations = useMemo(() => [...new Map(records
    .filter((record): record is RidershipRecord & { stationName: string } => Boolean(record.stationName))
    .map((record) => [record.stationId, record.stationName]))]
    .sort((left, right) => left[1].localeCompare(right[1], 'zh-Hant')), [records]);
  const selected = stationIds.map((id) => records.find((record) => record.stationId === id && record.period === year)).filter(Boolean) as RidershipRecord[];

  return <section aria-label="車站比較">
    <h2>比較多個車站</h2>
    <label htmlFor="compare-year">統計年度</label>
    <select id="compare-year" value={year} onChange={(event) => setYear(event.target.value)}>
      {years.map((value) => <option key={value} value={value}>{value} 年</option>)}
    </select>
    <label htmlFor="compare-stations">比較車站</label>
    <select id="compare-stations" multiple value={stationIds} onChange={(event) => setStationIds([...event.currentTarget.selectedOptions].map((option) => option.value).slice(0, 5))}>
      {stations.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select>
    {stationIds.length < 2
      ? <p>請選擇 2 至 5 個車站</p>
      : <table><thead><tr><th scope="col">車站</th><th scope="col">{year} 年入站人次</th></tr></thead><tbody>
        {selected.map((record) => <tr key={record.stationId}><td>{record.stationName ?? record.stationId}</td><td>{record.passengers.toLocaleString('zh-TW')}</td></tr>)}
      </tbody></table>}
  </section>;
}
