export type RidershipRecord = {
  stationId: string;
  stationName?: string;
  period: string;
  passengers: number;
  sourceUrl: string;
  sourceFile: string;
};

type RankOptions = {
  period: string;
  stationIds?: string[];
};

export function rankStations(records: RidershipRecord[], options: RankOptions) {
  const allowedStations = options.stationIds ? new Set(options.stationIds) : undefined;

  return records
    .filter((record) => record.period === options.period && (!allowedStations || allowedStations.has(record.stationId)))
    .map(({ stationId, passengers }) => ({ stationId, passengers }))
    .sort((left, right) => right.passengers - left.passengers || left.stationId.localeCompare(right.stationId));
}

export function aggregateYear(records: RidershipRecord[], stationId: string, year: number) {
  const matchingRecords = records.filter(
    (record) => record.stationId === stationId && record.period.startsWith(`${year}-`),
  );

  return {
    passengers: matchingRecords.reduce((total, record) => total + record.passengers, 0),
    monthsPresent: matchingRecords.length,
  };
}
