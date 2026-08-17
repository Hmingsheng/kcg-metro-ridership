import { describe, expect, it } from 'vitest';
import { extractMonthlySources } from '../scripts/monthly';

describe('monthly source discovery', () => {
  it('finds official station-ridership XLSX files and converts ROC months to ISO periods', () => {
    const page = `<a href='https://example.test/a.xlsx' title='下載檔案 高雄都會區大眾捷運系統各站旅運量統計表(115.1).xlsx'>xls</a>
      <a href='https://example.test/other.xlsx' title='下載檔案 其他統計表(115.1).xlsx'>xls</a>`;

    expect(extractMonthlySources(page)).toEqual([
      { period: '2026-01', url: 'https://example.test/a.xlsx', fileName: '高雄都會區大眾捷運系統各站旅運量統計表(115.1).xlsx' },
    ]);
  });
});
