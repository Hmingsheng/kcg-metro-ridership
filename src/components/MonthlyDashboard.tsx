import { useMemo, useState } from 'react';
import { rankStations, type RidershipRecord } from '../data/query';

export function MonthlyDashboard({ records, periods }: { records: RidershipRecord[]; periods: string[] }) {
  const [period, setPeriod] = useState(periods.at(-1) ?? '');
  const ranking = useMemo(() => rankStations(records, { period }), [records, period]);
  const names = useMemo(() => new Map(records.flatMap((record) => record.stationName ? [[record.stationId, record.stationName] as const] : [])), [records]);
  const label = period ? `${period.slice(0, 4)} 年 ${Number(period.slice(5))} 月` : '';

  return <section aria-label="月度全站排行">
    <h2>月度日均入站排行</h2>
    <label htmlFor="month">統計月份</label>
    <select id="month" value={period} onChange={(event) => setPeriod(event.target.value)}>
      {periods.map((value) => <option key={value} value={value}>{value.slice(0, 4)} 年 {Number(value.slice(5))} 月</option>)}
    </select>
    <h3>{label}全站日均入站排行</h3>
    <table>
      <thead><tr><th scope="col">排名</th><th scope="col">車站</th><th scope="col">平均每日入站人次</th><th scope="col">來源</th></tr></thead>
      <tbody>{ranking.map((record, index) => {
        const source = records.find((value) => value.stationId === record.stationId && value.period === period);
        return <tr key={record.stationId}><td>{index + 1}</td><td>{names.get(record.stationId) ?? record.stationId}</td><td>{record.passengers.toLocaleString('zh-TW')}</td><td>{source && <a href={source.sourceUrl} target="_blank" rel="noreferrer">查看原文</a>}</td></tr>;
      })}</tbody>
    </table>
  </section>;
}
