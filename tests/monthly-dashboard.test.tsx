import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MonthlyDashboard } from '../src/components/MonthlyDashboard';

describe('MonthlyDashboard', () => {
  it('switches daily-average rankings and links each record to its PTT source', () => {
    render(<MonthlyDashboard records={[
      { stationId: 'R3', stationName: '小港', period: '2026-01', passengers: 120, sourceUrl: 'x', sourceFile: 'x' },
      { stationId: 'O1', stationName: '西子灣', period: '2026-01', passengers: 80, sourceUrl: 'x', sourceFile: 'x' },
      { stationId: 'R3', stationName: '小港', period: '2026-02', passengers: 100, sourceUrl: 'x', sourceFile: 'x' },
    ]} periods={['2026-01', '2026-02']} />);

    fireEvent.change(screen.getByLabelText('統計月份'), { target: { value: '2026-01' } });
    expect(screen.getByRole('heading', { name: '2026 年 1 月全站日均入站排行' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '西子灣' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: '平均每日入站人次' })).toBeVisible();
    expect(screen.getAllByRole('link', { name: '查看原文' })[0]).toHaveAttribute('href', 'x');
  });
});
