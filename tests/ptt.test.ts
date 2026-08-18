import { describe, expect, it } from 'vitest';
import { parsePttDailyRidershipPost } from '../scripts/ptt';

describe('PTT daily-ridership parser', () => {
  it('converts an identified station ranking row to a daily inbound record', () => {
    const post = {
      url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
      title: '高雄捷運113年12月各站旅運量',
      body: '1 R11 高雄車站 31,580 28,306 28,029',
    };

    expect(parsePttDailyRidershipPost(post)).toEqual([{
      stationId: 'R11',
      stationName: '高雄車站',
      period: '2024-12',
      passengers: 31580,
      sourceUrl: post.url,
      sourceFile: post.title,
    }]);
  });

  it('normalizes historic station names and rejects non-ridership posts', () => {
    expect(parsePttDailyRidershipPost({
      url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
      title: '高雄捷運110年12月各站旅運量',
      body: '11 R24 南岡山站 8,326',
    })[0]?.stationName).toBe('岡山高醫');

    expect(parsePttDailyRidershipPost({
      url: 'https://www.ptt.cc/bbs/MRT/M.other.html',
      title: '高雄捷運討論',
      body: '1 R11 高雄車站 31,580',
    })).toEqual([]);
  });
});
