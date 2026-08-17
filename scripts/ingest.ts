import type { RidershipRecord } from '../src/data/query';
import * as XLSX from 'xlsx';

export type SourceFile = {
  period: `${number}-${string}`;
  url: string;
  fileName: string;
};

type OfficialRow = {
  stationName: string;
  passengers: string | number;
};

export type BoardingRow = {
  stationId: string;
  stationName: string;
  passengers: number;
};

export function readWorkbookRows(file: Buffer): unknown[][] {
  const workbook = XLSX.read(file, { type: 'buffer' });
  const worksheetName = workbook.SheetNames.find((name) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 });
    return rows.length > 0;
  });

  if (!worksheetName) {
    throw new Error('Workbook does not contain a populated worksheet');
  }

  return XLSX.utils.sheet_to_json(workbook.Sheets[worksheetName], {
    header: 1,
    defval: null,
  }) as unknown[][];
}

function parseStation(value: unknown, passengers: unknown): BoardingRow | undefined {
  if (typeof value !== 'string' || !Number.isFinite(Number(passengers))) {
    return undefined;
  }

  const match = value.trim().match(/^((?:[A-Z]+\d+[A-Z]?\s*)+)\s+(.+?)站$/);
  if (!match) {
    return undefined;
  }

  return {
    stationId: match[1].trim().replace(/\s+/g, '-'),
    stationName: match[2].trim(),
    passengers: Number(passengers),
  };
}

export function extractBoardingRows(sheetRows: unknown[][]): BoardingRow[] {
  return sheetRows.flatMap((row) => [
    parseStation(row[0], row[1]),
    parseStation(row[4], row[5]),
  ].filter((record): record is BoardingRow => record !== undefined));
}

export function normalizeRows(
  rows: OfficialRow[],
  source: SourceFile,
  stationIds: Record<string, string>,
): RidershipRecord[] {
  return rows.map((row) => {
    const stationId = stationIds[row.stationName];
    if (!stationId) {
      throw new Error(`Unknown station: ${row.stationName}`);
    }

    return {
      stationId,
      period: source.period,
      passengers: Number(row.passengers),
      sourceUrl: source.url,
      sourceFile: source.fileName,
    };
  });
}

export function validateRecords(records: RidershipRecord[]) {
  const seen = new Set<string>();

  for (const record of records) {
    if (!Number.isInteger(record.passengers) || record.passengers < 0) {
      throw new Error(`Passengers must be a non-negative integer for ${record.stationId}`);
    }

    const key = `${record.stationId}:${record.period}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate ridership record: ${key}`);
    }
    seen.add(key);
  }
}
