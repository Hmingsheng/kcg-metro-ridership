import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateRecords } from './ingest';
import { buildPttRecords, fetchPttDailyRidershipPosts } from './ptt-posts';

const outputDirectory = resolve('public/data');
const sourceUrl = 'https://www.ptt.cc/bbs/MRT/index.html';

async function main() {
  const posts = await fetchPttDailyRidershipPosts();
  const records = buildPttRecords(posts);
  validateRecords(records);
  if (records.length === 0) throw new Error('No PTT daily ridership records were parsed');
  const periods = [...new Set(records.map((record) => record.period))].sort();

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, 'monthly.json'), JSON.stringify(records)),
    writeFile(resolve(outputDirectory, 'monthly-metadata.json'), JSON.stringify({
      sourceUrl,
      sourceName: 'PTT MRT 板：高雄捷運各站旅運量',
      metric: '平均每日入站人次',
      periods,
      recordCount: records.length,
      generatedAt: new Date().toISOString(),
    })),
  ]);
  console.log(`Generated ${records.length} PTT daily inbound records for ${periods.length} months.`);
}

main();
