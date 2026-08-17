import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MonthlyStationExplorer } from '../src/components/MonthlyStationExplorer';

describe('MonthlyStationExplorer', () => {
  it('shows a selected station’s monthly inbound trend', () => {
    render(<MonthlyStationExplorer records={[
      { stationId: 'R3', stationName: '小港', period: '2026-01', passengers: 120, sourceUrl: 'x', sourceFile: 'x' },
      { stationId: 'R3', stationName: '小港', period: '2026-02', passengers: 100, sourceUrl: 'x', sourceFile: 'x' },
    ]} />);
    fireEvent.change(screen.getByLabelText('選擇月度車站'), { target: { value: 'R3' } });

    expect(screen.getByRole('heading', { name: '小港月度入站趨勢' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '2026 年 2 月' })).toBeVisible();
  });
});
