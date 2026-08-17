import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { extractBoardingRows, readWorkbookRows, normalizeRows, validateRecords } from '../scripts/ingest';

describe('official data ingestion', () => {
  it('reads the first populated official worksheet from an XLSX buffer', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ['捷運站別', '入站', '出站'],
      ['R3 小港站', 120, 110],
    ]), '表');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    expect(readWorkbookRows(buffer)).toEqual([
      ['捷運站別', '入站', '出站'],
      ['R3 小港站', 120, 110],
    ]);
  });

  it('extracts only entry counts from the two station columns in an official worksheet', () => {
    expect(extractBoardingRows([
      ['高雄都會區大眾捷運系統各站旅運量統計表'],
      ['捷運站別', '入站', '出站', null, '捷運站別', '入站', '出站'],
      ['紅線小計', 400, 400, null, '橘線小計', 200, 200],
      ['R3 小港站', 120, 110, null, 'O1 西子灣站', 80, 77],
    ])).toEqual([
      { stationId: 'R3', stationName: '小港', passengers: 120 },
      { stationId: 'O1', stationName: '西子灣', passengers: 80 },
    ]);
  });

  it('normalizes an official row and preserves source provenance', () => {
    expect(normalizeRows(
      [{ stationName: '美麗島', passengers: '120' }],
      { period: '2026-01', url: 'https://example.test/ridership.xlsx', fileName: 'ridership.xlsx' },
      { '美麗島': 'R10' },
    )).toEqual([
      {
        stationId: 'R10',
        period: '2026-01',
        passengers: 120,
        sourceUrl: 'https://example.test/ridership.xlsx',
        sourceFile: 'ridership.xlsx',
      },
    ]);
  });

  it('rejects duplicate station-period records and negative passenger counts', () => {
    expect(() => validateRecords([
      { stationId: 'R10', period: '2026-01', passengers: 120, sourceUrl: 'a', sourceFile: 'a.xlsx' },
      { stationId: 'R10', period: '2026-01', passengers: 121, sourceUrl: 'b', sourceFile: 'b.xlsx' },
    ])).toThrow(/duplicate/i);

    expect(() => validateRecords([
      { stationId: 'R10', period: '2026-01', passengers: -1, sourceUrl: 'a', sourceFile: 'a.xlsx' },
    ])).toThrow(/non-negative/i);
  });
});
