import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RidershipRecord } from '../src/data/query';
import { validateRecords } from './ingest';

const annualRecords = JSON.parse(await readFile(resolve('public/data/ridership.json'), 'utf8')) as RidershipRecord[];
const monthlyRecords = JSON.parse(await readFile(resolve('public/data/monthly.json'), 'utf8')) as RidershipRecord[];
validateRecords(annualRecords);
validateRecords(monthlyRecords);
console.log(`Validated ${annualRecords.length} annual and ${monthlyRecords.length} monthly ridership records.`);
