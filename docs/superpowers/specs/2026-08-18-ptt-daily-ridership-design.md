# PTT daily station-ridership data

## Goal

Replace every city-government ridership data source and view with verifiable PTT MRT-board posts containing Kaohsiung Metro station-level daily inbound averages.

## Scope

- Include only posts whose title and body identify a monthly Kaohsiung Metro station-ridership table.
- Store one record per station and month: `stationId`, station name, ISO month, daily average inbound passengers, and the original PTT post URL.
- Preserve only months whose original post was successfully parsed and validated. Missing months are omitted; no values are estimated or filled.
- Use the source unit exactly as published: average daily inbound passengers. Do not multiply by the number of days in the month.
- Remove annual views, annual comparisons, city-government data files, and all city-government source wording from the public app.

## Data ingestion

The importer will discover qualifying PTT MRT posts, parse the station ranking rows, and save normalized static JSON for GitHub Pages. It will reject records without a recognized station code, ISO month, numeric daily average, or source URL. The static metadata will state the PTT MRT board as the source and list the actual available months.

Station codes and historic station names will be normalized so that renames, such as O1 and R24, remain queryable as the same station. Every displayed data point will link to its original post.

## Public interface

The app will become a monthly-only explorer:

- Monthly ranking, labeled `平均每日入站人次`.
- Single-station history using available months only.
- Source link on each station/month record.
- A plain disclosure that values are community-posted PTT data and may have month gaps.

## Validation and testing

Tests will cover post discovery, ROC-to-ISO month conversion, representative ranking-row parsing, station-name normalization, and rejection of malformed rows. The build validation will require a source URL, valid ISO month, station code, and non-negative integer daily average for every record. The app build and all tests must pass before deployment.

## Non-goals

- No monthly-total conversion or estimation.
- No use of city-government, KRTC, or other sources in the public data set.
- No display of months with no successfully verified PTT post.
