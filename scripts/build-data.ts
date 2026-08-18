import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseAnnualRecords } from './annual';
import { extractBoardingRows, readWorkbookRows, validateRecords } from './ingest';
import { extractMonthlySources, officialHistoricalMonthlySources } from './monthly';

const annualSourceUrl = 'https://openapi.kcg.gov.tw/Api/Service/Get/1e595d78-2f73-4edd-9c17-7cce8c2d7ce9';
const monthlyIndexUrl = 'https://kcgdg.kcg.gov.tw/KcgStatWebNew/Page/kcg01_1.aspx?Mid=LoHqlcF90Xs=&p=nWfS7drIbrE=&y=aAAfbT6+ZzM=&m=nWfS7drIbrE=';
const outputDirectory = resolve('public/data');

type ApiResponse = { data: Record<string, string | number | undefined>[] };

async function fetchMonthlyRecords() {
  const indexResponse = await fetch(monthlyIndexUrl);
  if (!indexResponse.ok) {
    throw new Error(`Monthly index request failed with HTTP ${indexResponse.status}`);
  }
  const sources = [...officialHistoricalMonthlySources(), ...extractMonthlySources(await indexResponse.text())]
    .sort((left, right) => left.period.localeCompare(right.period));
  const batches = await Promise.all(sources.map(async (source) => {
    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`Monthly file request failed for ${source.fileName}: HTTP ${response.status}`);
    }
    return extractBoardingRows(readWorkbookRows(Buffer.from(await response.arrayBuffer()))).map((record) => ({
      ...record,
      period: source.period,
      sourceUrl: source.url,
      sourceFile: source.fileName,
    }));
  }));
  return { records: batches.flat(), sources };
}

async function main() {
  const response = await fetch(annualSourceUrl);
  if (!response.ok) {
    throw new Error(`Official API request failed with HTTP ${response.status}`);
  }

  const payload = await response.json() as ApiResponse;
  const records = parseAnnualRecords(payload.data, annualSourceUrl);
  validateRecords(records);
  const monthly = await fetchMonthlyRecords();
  validateRecords(monthly.records);

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
    writeFile(resolve(outputDirectory, 'monthly.json'), JSON.stringify(monthly.records)),
    writeFile(resolve(outputDirectory, 'monthly-metadata.json'), JSON.stringify({
      sourceUrl: monthlyIndexUrl,
      sourceName: '高雄市政府統計資料：高雄都會區大眾捷運系統各站旅運量統計表',
      metric: '入站人次',
      periods: monthly.sources.map((source) => source.period),
      recordCount: monthly.records.length,
      generatedAt: new Date().toISOString(),
    })),
  ]);

  console.log(`Generated ${records.length} inbound annual records for ${years.length} years and ${monthly.records.length} monthly records.`);
}

main();
