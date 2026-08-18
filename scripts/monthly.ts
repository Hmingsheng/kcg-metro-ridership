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

export function officialHistoricalMonthlySources(): SourceFile[] {
  const fileName = (month: number, trailingDot: boolean) => `高雄都會區大眾捷運系統各站旅運量統計表(114.${month}${trailingDot ? '.' : ''}).xlsx`;
  const entries: Array<[number, number, boolean]> = [
    [1, 347814, true], [2, 347815, true], [3, 347816, false], [4, 347817, true],
    [5, 347781, false], [6, 347782, true], [7, 347783, false], [8, 347784, true],
    [9, 347785, false], [10, 347786, true], [11, 347787, false],
  ];
  return entries.map(([month, uid, trailingDot]) => {
    const name = fileName(month, trailingDot);
    return {
      period: `2025-${String(month).padStart(2, '0')}`,
      fileName: name,
      url: `https://kcgdg.kcg.gov.tw/CWSSLWEB/Attachment/Download.ashx?VP_FileName=${encodeURIComponent(name)}&VP_LinkSheetName=SDB_ReportStateData&VP_LinkUID=${uid}`,
    };
  });
}
