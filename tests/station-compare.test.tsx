import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StationCompare } from '../src/components/StationCompare';

describe('StationCompare', () => {
  it('requires two stations and then displays their selected-year inbound values', () => {
    render(<StationCompare records={[
      { stationId: 'R3', stationName: '小港', period: '2024', passengers: 120, sourceUrl: 'x', sourceFile: 'x' },
      { stationId: 'O1', stationName: '西子灣', period: '2024', passengers: 80, sourceUrl: 'x', sourceFile: 'x' },
    ]} years={['2024']} />);
    expect(screen.getByText('請選擇 2 至 5 個車站')).toBeVisible();

    const select = screen.getByLabelText('比較車站') as HTMLSelectElement;
    select.options[0].selected = true;
    select.options[1].selected = true;
    fireEvent.change(select);

    expect(screen.getByRole('cell', { name: '小港' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '80' })).toBeVisible();
  });
});
