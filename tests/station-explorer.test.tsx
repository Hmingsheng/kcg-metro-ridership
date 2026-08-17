import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StationExplorer } from '../src/components/StationExplorer';

describe('StationExplorer', () => {
  it('shows a selected station’s year-by-year inbound totals', () => {
    render(<StationExplorer records={[
      { stationId: 'R3', stationName: '小港', period: '2023', passengers: 100, sourceUrl: 'x', sourceFile: 'x' },
      { stationId: 'R3', stationName: '小港', period: '2024', passengers: 120, sourceUrl: 'x', sourceFile: 'x' },
      { stationId: 'O1', stationName: '西子灣', period: '2024', passengers: 80, sourceUrl: 'x', sourceFile: 'x' },
    ]} />);

    fireEvent.change(screen.getByLabelText('選擇車站'), { target: { value: 'R3' } });

    expect(screen.getByRole('heading', { name: '小港歷年入站趨勢' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '2023' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '120' })).toBeVisible();
  });
});
