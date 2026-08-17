import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Dashboard } from '../src/components/Dashboard';

describe('Dashboard', () => {
  it('shows an annual inbound-station ranking and its data period', () => {
    render(<Dashboard
      records={[
        { stationId: 'R3', stationName: '小港', period: '2024', passengers: 120, sourceUrl: 'https://example.test', sourceFile: 'source' },
        { stationId: 'O1', stationName: '西子灣', period: '2024', passengers: 80, sourceUrl: 'https://example.test', sourceFile: 'source' },
      ]}
      years={['2024']}
    />);

    expect(screen.getByRole('heading', { name: '高雄捷運站運量' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: '入站人次' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '小港' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '120' })).toBeVisible();
  });
});
