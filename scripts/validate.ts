import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RidershipRecord } from '../src/data/query';
import { validateRecords } from './ingest';

const monthlyRecords = JSON.parse(await readFile(resolve('public/data/monthly.json'), 'utf8')) as RidershipRecord[];
validateRecords(monthlyRecords);
for (const record of monthlyRecords) {
  if (new URL(record.sourceUrl).hostname !== 'www.ptt.cc') {
    throw new Error(`Non-PTT source found for ${record.stationId} ${record.period}`);
  }
}
console.log(`Validated ${monthlyRecords.length} PTT daily ridership records.`);
