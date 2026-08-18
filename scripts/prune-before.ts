import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RidershipRecord } from '../src/data/query';

const cutoff = '2010-01';
const dataPath = resolve('public/data/monthly.json');
const metadataPath = resolve('public/data/monthly-metadata.json');
const records = JSON.parse(await readFile(dataPath, 'utf8')) as RidershipRecord[];
const retained = records.filter((record) => record.period >= cutoff);
const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as { periods: string[]; recordCount: number; generatedAt: string };
metadata.periods = [...new Set(retained.map((record) => record.period))].sort();
metadata.recordCount = retained.length;
metadata.generatedAt = new Date().toISOString();
await Promise.all([writeFile(dataPath, JSON.stringify(retained)), writeFile(metadataPath, JSON.stringify(metadata))]);
console.log(`Removed ${records.length - retained.length} records before ${cutoff}.`);
