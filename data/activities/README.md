# Strava activity archive

This directory is populated by `npm run export:strava` and the `Export Strava activity archive` GitHub Action.

Each activity is stored in `data/activities/<numeric-strava-activity-id>/`:

- `metadata.json` contains athlete name, title, source URL, ID, and original/retained GPS point counts.
- `track.gpx` contains only sparse latitude/longitude trackpoints. There are no timestamps, elevation samples, heart-rate readings, or per-point extension fields.

Do not commit tracks for activities without the athlete's permission. This repository is public, and simplified GPS traces may still reveal sensitive locations.
