import { useMemo, useState } from 'react';
import { rankStations, type RidershipRecord } from '../data/query';

type DashboardProps = {
  records: RidershipRecord[];
  years: string[];
};

export function Dashboard({ records, years }: DashboardProps) {
  const [year, setYear] = useState(years.at(-1) ?? '');
  const ranking = useMemo(() => rankStations(records, { period: year }), [records, year]);
  const names = useMemo(
    () => new Map(records.flatMap((record) => record.stationName ? [[record.stationId, record.stationName] as const] : [])),
    [records],
  );

  return <main>
    <header>
      <p>高雄都會區大眾捷運系統</p>
      <h1>高雄捷運站運量</h1>
      <p>依高雄市政府公開資料整理的歷年各站 <strong>入站人次</strong></p>
    </header>

    <section aria-label="年度篩選">
      <label htmlFor="year">統計年度</label>
      <select id="year" value={year} onChange={(event) => setYear(event.target.value)}>
        {years.map((value) => <option key={value} value={value}>{value} 年</option>)}
      </select>
    </section>

    <section aria-label={`${year} 年全站排行`}>
      <h2>{year} 年全站入站排行</h2>
      <table>
        <thead><tr><th scope="col">排名</th><th scope="col">車站</th><th scope="col">入站人次</th></tr></thead>
        <tbody>
          {ranking.map((record, index) => <tr key={record.stationId}>
            <td>{index + 1}</td>
            <td>{names.get(record.stationId) ?? record.stationId}</td>
            <td>{record.passengers.toLocaleString('zh-TW')}</td>
          </tr>)}
        </tbody>
      </table>
    </section>
  </main>;
}
