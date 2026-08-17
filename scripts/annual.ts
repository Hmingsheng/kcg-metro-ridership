import type { RidershipRecord } from '../src/data/query';

type AnnualRow = Record<string, string | number | undefined>;

const sourceFile = '高雄市政府開放資料 API';

function parseStationField(field: string) {
  if (field === 'R1+M:AJ2後驛站') {
    return { stationId: 'R12', stationName: '後驛' };
  }

  if (!field.endsWith('站')) {
    return undefined;
  }

  const codePattern = /[A-Z]+\d+(?:[A-Z](?!\d))?/y;
  const codes: string[] = [];
  let position = 0;
  while (true) {
    codePattern.lastIndex = position;
    const match = codePattern.exec(field);
    if (!match) {
      break;
    }
    codes.push(match[0]);
    position = codePattern.lastIndex;
  }

  const stationName = field.slice(position, -1);
  return codes.length > 0 && stationName
    ? { stationId: codes.join('-'), stationName }
    : undefined;
}

export function parseAnnualRecords(rows: AnnualRow[], sourceUrl: string): RidershipRecord[] {
  return rows.flatMap((row) => {
    const yearMatch = String(row.年份 ?? '').match(/\d{4}/);
    if (!yearMatch) {
      throw new Error(`Invalid annual reporting period: ${row.年份}`);
    }

    return Object.entries(row).flatMap(([field, value]) => {
      const station = parseStationField(field);
      const passengers = Number(value);
      if (!station || !Number.isFinite(passengers)) {
        return [];
      }

      return [{
        ...station,
        period: yearMatch[0],
        passengers,
        sourceUrl,
        sourceFile,
      }];
    });
  });
}
