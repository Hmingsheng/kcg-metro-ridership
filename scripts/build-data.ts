import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseAnnualRecords } from './annual';
import { validateRecords } from './ingest';

const annualSourceUrl = 'https://openapi.kcg.gov.tw/Api/Service/Get/1e595d78-2f73-4edd-9c17-7cce8c2d7ce9';
const outputDirectory = resolve('public/data');

type ApiResponse = { data: Record<string, string | number | undefined>[] };

async function main() {
  const response = await fetch(annualSourceUrl);
  if (!response.ok) {
    throw new Error(`Official API request failed with HTTP ${response.status}`);
  }

  const payload = await response.json() as ApiResponse;
  const records = parseAnnualRecords(payload.data, annualSourceUrl);
  validateRecords(records);

  const stations = [...new Map(records
    .filter((record): record is typeof record & { stationName: string } => Boolean(record.stationName))
    .map((record) => [record.stationId, { id: record.stationId, name: record.stationName }]))
    .values()]
    .sort((left, right) => left.id.localeCompare(right.id));

  const years = [...new Set(records.map((record) => record.period))].sort();
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, 'ridership.json'), JSON.stringify(records)),
    writeFile(resolve(outputDirectory, 'stations.json'), JSON.stringify(stations)),
    writeFile(resolve(outputDirectory, 'metadata.json'), JSON.stringify({
      sourceUrl: annualSourceUrl,
      sourceName: '高雄市政府開放資料：高雄都會區大眾捷運系統各站旅運量入站',
      metric: '入站人次',
      years,
      recordCount: records.length,
      generatedAt: new Date().toISOString(),
    })),
  ]);

  console.log(`Generated ${records.length} inbound annual records for ${years.length} years.`);
}

main();
