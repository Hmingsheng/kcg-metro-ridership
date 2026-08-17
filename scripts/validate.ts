import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RidershipRecord } from '../src/data/query';
import { validateRecords } from './ingest';

const records = JSON.parse(await readFile(resolve('public/data/ridership.json'), 'utf8')) as RidershipRecord[];
validateRecords(records);
console.log(`Validated ${records.length} ridership records.`);
