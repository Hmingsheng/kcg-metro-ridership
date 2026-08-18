import { describe, expect, it } from 'vitest';
import { parsePttDailyRidershipPost } from '../scripts/ptt';
import { buildPttRecords, extractPttPost, extractPttPostUrls } from '../scripts/ptt-posts';

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

  it('parses newer posts whose station names omit the 站 suffix', () => {
    expect(parsePttDailyRidershipPost({
      url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
      title: '高雄捷運113年12月各站旅運量',
      body: ' -    2    R11    高雄車站           31,580  28,306  28,029',
    })[0]).toMatchObject({ stationId: 'R11', stationName: '高雄車站', passengers: 31580 });
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

  it('parses 2018 ranking rows that identify stations by name instead of code', () => {
    expect(parsePttDailyRidershipPost({
      url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
      title: '高雄捷運107年10月各站旅運量',
      body: '  1   左營站        36,242  35,397  36,061',
    })[0]).toMatchObject({ stationId: 'R16', stationName: '左營', passengers: 36242, period: '2018-10' });
  });

  it('parses historic titles that place the year before 高雄捷運', () => {
    expect(parsePttDailyRidershipPost({
      url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
      title: '106年11月高雄捷運各站旅運量',
      body: '1 R16 左營站 34,203 36,061',
    })[0]).toMatchObject({ stationId: 'R16', period: '2017-11', passengers: 34203 });
  });

  it('rejects summary lines that contain a station-like code but no station name', () => {
    expect(parsePttDailyRidershipPost({
      url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
      title: '高雄捷運106年8月各站旅運量',
      body: 'C12 10,578 10,634',
    })).toEqual([]);
  });

  it('keeps records only from parseable daily-ridership posts', () => {
    const records = buildPttRecords([
      {
        url: 'https://www.ptt.cc/bbs/MRT/M.example.html',
        title: '高雄捷運113年12月各站旅運量',
        body: '1 R11 高雄車站 31,580',
      },
      { url: 'https://www.ptt.cc/bbs/MRT/M.invalid.html', title: '閒聊', body: '' },
    ]);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ stationId: 'R11', period: '2024-12' });
  });

  it('deduplicates identical station values republished for the same month', () => {
    const records = buildPttRecords([
      { url: 'https://www.ptt.cc/bbs/MRT/M.first.html', title: '高雄捷運113年12月各站旅運量', body: '1 R11 高雄車站 31,580' },
      { url: 'https://www.ptt.cc/bbs/MRT/M.copy.html', title: '高雄捷運113年12月各站旅運量', body: '1 R11 高雄車站 31,580' },
    ]);

    expect(records).toHaveLength(1);
    expect(records[0]?.sourceUrl).toBe('https://www.ptt.cc/bbs/MRT/M.first.html');
  });

  it('discovers only Kaohsiung station-ridership posts from a PTT search page', () => {
    const index = `<div class="title"><a href="/bbs/MRT/M.valid.html">[情報] 高雄捷運113年12月各站旅運量</a></div>
      <div class="title"><a href="/bbs/MRT/M.other.html">[討論] 高雄捷運營運</a></div>`;

    expect(extractPttPostUrls(index)).toEqual([
      'https://www.ptt.cc/bbs/MRT/M.valid.html',
    ]);
  });

  it('extracts the post body after PTT metadata blocks', () => {
    const html = `<meta property="og:title" content="[情報] 高雄捷運113年12月各站旅運量">
      <div id="main-content"><div class="article-metaline">作者</div><div class="article-metaline-right">MRT</div><div class="article-metaline">標題</div><div class="article-metaline">時間</div>
      1 R11 高雄車站 31,580
      <div class="push">推文</div></div>`;

    expect(extractPttPost(html, 'https://www.ptt.cc/bbs/MRT/M.example.html')?.body).toContain('1 R11 高雄車站 31,580');
  });
});
