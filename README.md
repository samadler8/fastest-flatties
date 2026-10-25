# Fastest Flatties

Next.js website for documenting fastest human-powered records on Boulder-area Flatiron routes.

## Strava activity import and archive

The website can import a Strava activity using a **server-only Strava session cookie**. It fetches the athlete name and activity title from Strava's HTML and uses the activity's lat/lng/time streams to calculate elapsed time and suggest a route match. Before storing, it simplifies the GPS geometry (default 12 m shape tolerance, maximum ~200 m spacing) and drops timestamps, elevation, heart rate, and all other streams.

When a scrape succeeds, it immediately writes to the **private** Supabase `strava_activity_archives` table using the service role key. The GitHub Action `Export Strava activity archive` runs every six hours (and on demand) to export and commit:

```text
data/activities/<activity-id>/metadata.json
data/activities/<activity-id>/track.gpx
```

Each `metadata.json` contains the activity ID, athlete name, activity title, Strava link, and point counts. The GPX contains only `<trkpt lat="..." lon="..."/>` elements. Running the exporter twice without new data doesn't change the files.

### Configure locally

1. Copy `.env.example` to `.env.local` and fill in the Supabase and Strava values. Use `STRAVA_COOKIE=_strava4_session=...`, **not** `NEXT_PUBLIC_STRAVA_COOKIE`. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it to the browser or commit `.env.local`.
2. Apply `supabase/migrations/20261025130000_strava_activity_archives.sql` to your Supabase project. If you use the repository's migration deploy workflow, make sure earlier migrations apply cleanly too.
3. `npm ci && npm run dev` and import an activity at `/submit`. A successful result means the archive was saved in Supabase, not yet committed to GitHub.
4. Run `npm run export:strava` in a checked-out repository to create `data/activities/...` locally. Review the files before committing them.

### Configure GitHub export

Add repository **Actions secrets** `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The existing `package-lock.json` is required by `npm ci`. Allow GitHub Actions to have read and write workflow permissions under repository settings, and ensure branch protection allows the workflow to push, or adjust it to open a pull request. Run **Actions > Export Strava activity archive > Run workflow** once to test; the six-hour schedule will handle future imports. The website needs its own `SUPABASE_SERVICE_ROLE_KEY` configured in its hosting provider, plus the existing Strava cookie and public Supabase keys.

**Privacy:** The repository is public. Even without timestamps, GPX locations are sensitive. Only archive and publish activities with the athlete's permission. Simplification does not anonymize locations.

**Access control:** The archive table has RLS enabled and has no public client policies. The current website's import action is still publicly callable and must be given rate limits and abuse protection before substantial public traffic; the Strava cookie and service role key must never be sent to the browser.

**Scope:** Importing and archiving is separate from creating or verifying a leaderboard effort. The submission wizard now explicitly says that archive success is *not* a verified submission. The old `Confirm Submission` button previously showed success without inserting anything into Supabase.

### Development checks

```bash
npm run test
npm run typecheck
npm run export:strava
```

The Strava web streams endpoint is unofficial and may change or reject a session cookie. The site's extraction may also need updating if Strava changes its HTML metadata.
