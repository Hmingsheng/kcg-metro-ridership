import { describe, expect, it } from 'vitest';
import { parseAnnualRecords } from '../scripts/annual';

describe('annual open-data ingestion', () => {
  it('turns official annual inbound fields into station records', () => {
    expect(parseAnnualRecords([
      { 年份: '2011年', R3小港站: '120', O5R10美麗島站: '250', 總計: '370' },
    ], 'https://openapi.kcg.gov.tw/example')).toEqual([
      {
        stationId: 'R3', stationName: '小港', period: '2011', passengers: 120,
        sourceUrl: 'https://openapi.kcg.gov.tw/example', sourceFile: '高雄市政府開放資料 API',
      },
      {
        stationId: 'O5-R10', stationName: '美麗島', period: '2011', passengers: 250,
        sourceUrl: 'https://openapi.kcg.gov.tw/example', sourceFile: '高雄市政府開放資料 API',
      },
    ]);
  });
});
