import type { RidershipRecord } from '../src/data/query';

export type PttPost = { url: string; title: string; body: string };

const stationNameAliases: Record<string, string> = {
  '西子灣站': '哈瑪星',
  '南岡山站': '岡山高醫',
  '楠梓加工區站': '楠梓科技園區',
  '市議會站': '前金',
  '技擊館站': '苓雅運動園區',
};

export function parsePttDailyRidershipPost(post: PttPost): RidershipRecord[] {
  const title = post.title.match(/高雄捷運(\d+)年(\d+)月各站旅運量/);
  if (!title) return [];

  const period = `${Number(title[1]) + 1911}-${title[2].padStart(2, '0')}`;
  return post.body.split(/\r?\n/).flatMap((line) => {
    const row = line.match(/^\s*\d+\s+([A-Z]+\d+[A-Z]?)\s+(.+?站)\s+([\d,]+)/);
    if (!row) return [];
    return [{
      stationId: row[1],
      stationName: stationNameAliases[row[2]] ?? row[2],
      period,
      passengers: Number(row[3].replaceAll(',', '')),
      sourceUrl: post.url,
      sourceFile: post.title,
    }];
  });
}
