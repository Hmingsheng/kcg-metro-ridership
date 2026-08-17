import type { SourceFile } from './ingest';

const sourcePattern = /href=['"]([^'"]+)['"][^>]*title=['"]下載檔案\s+(高雄都會區大眾捷運系統各站旅運量統計表\((\d+)\.(\d+)\.?\)\.xlsx)['"]/g;

export function extractMonthlySources(pageHtml: string): SourceFile[] {
  return [...pageHtml.matchAll(sourcePattern)].map((match) => {
    const rocYear = Number(match[3]);
    const month = Number(match[4]);
    return {
      period: `${rocYear + 1911}-${String(month).padStart(2, '0')}`,
      url: match[1].replaceAll('&amp;', '&'),
      fileName: match[2],
    };
  }).sort((left, right) => left.period.localeCompare(right.period));
}
