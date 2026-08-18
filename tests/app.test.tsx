import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App, type SiteData } from '../src/App';

const siteData: SiteData = {
  monthlyRecords: [{ stationId: 'R3', stationName: '小港', period: '2024-12', passengers: 120, sourceUrl: 'https://www.ptt.cc/bbs/MRT/M.example.html', sourceFile: 'source' }],
  metadata: { sourceUrl: 'https://www.ptt.cc/bbs/MRT/index.html', sourceName: 'PTT MRT 板', metric: '平均每日入站人次', periods: ['2024-12'], recordCount: 1, generatedAt: '2026-08-17T00:00:00.000Z' },
};

describe('App', () => {
  it('loads PTT daily data and exposes the source disclosure', async () => {
    render(<App loadData={async () => siteData} />);

    expect(await screen.findByRole('heading', { name: '月度日均入站排行' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'PTT MRT 板' })).toHaveAttribute('href', 'https://www.ptt.cc/bbs/MRT/index.html');
  });

  it('shows a clear reload state when static data cannot be read', async () => {
    render(<App loadData={async () => { throw new Error('network failed'); }} />);

    expect(await screen.findByText('資料暫時無法載入')).toBeVisible();
  });
});
