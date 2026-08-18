import type { RidershipRecord } from '../src/data/query';
import { parsePttDailyRidershipPost, type PttPost } from './ptt';

export function buildPttRecords(posts: PttPost[]): RidershipRecord[] {
  const records = new Map<string, RidershipRecord>();
  posts.flatMap(parsePttDailyRidershipPost).forEach((record) => {
    const key = `${record.stationId}:${record.period}`;
    if (!records.has(key)) records.set(key, record);
  });
  return [...records.values()];
}

export function extractPttPostUrls(indexHtml: string): string[] {
  return [...indexHtml.matchAll(/href="(\/bbs\/MRT\/M\.[^"]+\.html)">([^<]+高雄捷運\d+年\d+月各站旅運量[^<]*)<\/a>/g)]
    .map((match) => `https://www.ptt.cc${match[1]}`)
    .filter((url, index, urls) => urls.indexOf(url) === index);
}

const searchPages = 65;
const additionalPostUrls = ['https://www.ptt.cc/bbs/MRT/M.1513354543.A.C9B.html'];
const searchUrl = (page: number, query = '高雄捷運') => `https://www.ptt.cc/bbs/MRT/search?page=${page}&q=${encodeURIComponent(query)}`;

function stripHtml(html: string) {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' ').trim();
}

export function extractPttPost(html: string, url: string): PttPost | undefined {
  const title = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1];
  const mainContent = html.match(/<div id="main-content"[^>]*>([\s\S]*?)<div class="push/i)?.[1];
  const body = mainContent?.replace(/^(?:<div class="article-metaline(?:-right)?">[\s\S]*?<\/div>){4}/, '');
  return title && body ? { url, title, body: stripHtml(body) } : undefined;
}

export async function fetchPttDailyRidershipPosts(): Promise<PttPost[]> {
  const indexPages: string[] = [];
  const searches = [
    ...Array.from({ length: searchPages }, (_, index) => searchUrl(index + 1)),
    ...Array.from({ length: 2 }, (_, index) => searchUrl(index + 1, '高雄捷運107年')),
  ];
  for (const url of searches) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`PTT search request failed: HTTP ${response.status}`);
    indexPages.push(await response.text());
  }
  const urls = [...new Set([...indexPages.flatMap(extractPttPostUrls), ...additionalPostUrls])];
  const posts: PttPost[] = [];
  for (const urlsBatch of Array.from({ length: Math.ceil(urls.length / 8) }, (_, index) => urls.slice(index * 8, index * 8 + 8))) {
    const fetched = await Promise.all(urlsBatch.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`PTT post request failed: HTTP ${response.status}`);
      return extractPttPost(await response.text(), url);
    }));
    posts.push(...fetched.filter((post): post is PttPost => Boolean(post)));
  }
  return posts;
}
