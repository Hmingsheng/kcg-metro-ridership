import type { RidershipRecord } from '../src/data/query';

export type PttPost = { url: string; title: string; body: string };

const stationNameAliases: Record<string, string> = {
  '西子灣站': '哈瑪星',
  '南岡山站': '岡山高醫',
  '楠梓加工區站': '楠梓科技園區',
  '市議會站': '前金',
  '技擊館站': '苓雅運動園區',
};

const historicStationCodes: Record<string, [string, string]> = {
  '左營站': ['R16', '左營'], '巨蛋站': ['R14', '巨蛋'], '高雄車站': ['R11', '高雄車站'],
  '三多商圈站': ['R8', '三多商圈'], '美麗島站': ['O5/R10', '美麗島'], '中央公園站': ['R9', '中央公園'],
  '小港站': ['R3', '小港'], '後驛站': ['R12', '後驛'], '凹子底站': ['R13', '凹子底'],
  '草衙站': ['R4A', '草衙'], '南岡山站': ['R24', '岡山高醫'], '前鎮高中站': ['R5', '前鎮高中'],
  '西子灣站': ['O1', '哈瑪星'], '凱旋站': ['R6', '凱旋'], '生態園區站': ['R15', '生態園區'],
  '楠梓加工區站': ['R19', '楠梓科技園區'], '鹽埕埔站': ['O2', '鹽埕埔'], '獅甲站': ['R7', '獅甲'],
  '文化中心站': ['O7', '文化中心'], '大寮站': ['OT1', '大寮'], '都會公園站': ['R21', '都會公園'],
  '高雄國際機場站': ['R4', '高雄國際機場'], '衛武營站': ['O10', '衛武營'], '市議會站': ['O4', '前金'],
  '油廠國小站': ['R18', '油廠國小'], '鳳山西站': ['O11', '鳳山西'], '信義國小站': ['O6', '信義國小'],
  '橋頭火車站': ['R23', '橋頭火車站'], '大東站': ['O13', '大東'], '五塊厝站': ['O8', '五塊厝'],
  '鳳山國中站': ['O14', '鳳山國中'], '鳳山站': ['O12', '鳳山'], '技擊館站': ['O9', '苓雅運動園區'],
  '後勁站': ['R20', '後勁'], '世運站': ['R17', '世運'], '青埔站': ['R22', '青埔'], '橋頭糖廠站': ['R22A', '橋頭糖廠'],
};

export function parsePttDailyRidershipPost(post: PttPost): RidershipRecord[] {
  const title = post.title.match(/高雄捷運(\d+)年(\d+)月各站旅運量/);
  if (!title) return [];

  const period = `${Number(title[1]) + 1911}-${title[2].padStart(2, '0')}`;
  return post.body.split(/\r?\n/).flatMap((line) => {
    const row = line.match(/\b([A-Z]+\d+[A-Z]?(?:\/[A-Z]+\d+[A-Z]?)?)\s+(.+?)\s+([\d,]+)/);
    if (row && /[^\d,]/.test(row[2])) return [{
      stationId: row[1],
      stationName: stationNameAliases[row[2]] ?? row[2],
      period,
      passengers: Number(row[3].replaceAll(',', '')),
      sourceUrl: post.url,
      sourceFile: post.title,
    }];
    const historicRow = line.match(/^\s*\d+\s+[※◎]?(.+?站)\s+([\d,]+)/);
    const station = historicRow && historicStationCodes[historicRow[1]];
    if (!historicRow || !station) return [];
    return [{
      stationId: station[0],
      stationName: station[1],
      period,
      passengers: Number(historicRow[2].replaceAll(',', '')),
      sourceUrl: post.url,
      sourceFile: post.title,
    }];
  });
}
