import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parsePttDailyRidershipPost } from './ptt';
import { extractPttPost } from './ptt-posts';
import type { RidershipRecord } from '../src/data/query';

const urls = process.argv.slice(2);
if (urls.length === 0) throw new Error('Provide one or more PTT post URLs');

const dataPath = resolve('public/data/monthly.json');
const metadataPath = resolve('public/data/monthly-metadata.json');
const records = JSON.parse(await readFile(dataPath, 'utf8')) as RidershipRecord[];
const fetched = await Promise.all(urls.map(async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PTT post request failed: HTTP ${response.status}`);
  const post = extractPttPost(await response.text(), url);
  return post ? parsePttDailyRidershipPost(post) : [];
}));
const merged = new Map(records.map((record) => [`${record.stationId}:${record.period}`, record]));
fetched.flat().forEach((record) => merged.set(`${record.stationId}:${record.period}`, record));
const output = [...merged.values()].sort((left, right) => left.period.localeCompare(right.period) || left.stationId.localeCompare(right.stationId));
const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as { periods: string[]; recordCount: number; generatedAt: string };
metadata.periods = [...new Set(output.map((record) => record.period))].sort();
metadata.recordCount = output.length;
metadata.generatedAt = new Date().toISOString();
await Promise.all([writeFile(dataPath, JSON.stringify(output)), writeFile(metadataPath, JSON.stringify(metadata))]);
console.log(`Added ${fetched.flat().length} PTT records; dataset now contains ${output.length} records.`);
