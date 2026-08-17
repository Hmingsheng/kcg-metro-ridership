import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App, type SiteData } from '../src/App';

const siteData: SiteData = {
  records: [{ stationId: 'R3', stationName: '小港', period: '2024', passengers: 120, sourceUrl: 'https://example.test', sourceFile: 'source' }],
  metadata: { sourceUrl: 'https://example.test', sourceName: '高雄市政府', metric: '入站人次', years: ['2024'], recordCount: 1, generatedAt: '2026-08-17T00:00:00.000Z' },
};

describe('App', () => {
  it('loads static data and exposes the official source link', async () => {
    render(<App loadData={async () => siteData} />);

    expect(await screen.findByRole('heading', { name: '高雄捷運站運量' })).toBeVisible();
    expect(screen.getByRole('link', { name: '資料來源' })).toHaveAttribute('href', 'https://example.test');
  });

  it('shows a clear reload state when static data cannot be read', async () => {
    render(<App loadData={async () => { throw new Error('network failed'); }} />);

    expect(await screen.findByText('資料暫時無法載入')).toBeVisible();
  });
});
