import { describe, expect, it } from 'vitest';
import { aggregateYear, rankStations, type RidershipRecord } from '../src/data/query';

const records: RidershipRecord[] = [
  { stationId: 'R10', period: '2026-01', passengers: 120, sourceUrl: 'https://example.test/a.xlsx', sourceFile: 'a.xlsx' },
  { stationId: 'O1', period: '2026-01', passengers: 80, sourceUrl: 'https://example.test/a.xlsx', sourceFile: 'a.xlsx' },
  { stationId: 'R10', period: '2026-02', passengers: 100, sourceUrl: 'https://example.test/b.xlsx', sourceFile: 'b.xlsx' },
];

describe('ridership queries', () => {
  it('ranks selected-period stations descending without inventing missing data', () => {
    expect(rankStations(records, { period: '2026-01', stationIds: ['R10', 'O1', 'G1'] }))
      .toEqual([
        { stationId: 'R10', passengers: 120 },
        { stationId: 'O1', passengers: 80 },
      ]);
  });

  it('sums only available records in a yearly aggregate', () => {
    expect(aggregateYear(records, 'R10', 2026)).toEqual({ passengers: 220, monthsPresent: 2 });
  });
});
