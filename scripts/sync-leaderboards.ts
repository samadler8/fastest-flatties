import * as fs from 'fs';
import * as path from 'path';
import { fetchSegmentTopEfforts, fetchActivityStreams } from '../lib/strava/scraper';
import { extractSubTrack, RouteConfig } from '../lib/geo/matcher';
import { verifyAttempt } from '../lib/verifier';

export interface LeaderboardEntry {
  rank: number;
  athleteName: string;
  activityId: string;
  elapsedTimeSeconds: number;
  avgSpeedKmh: number;
  elevationGainMeters: number;
  verifiedAt: string;
}

async function syncLeaderboards() {
  const routesDir = path.join(process.cwd(), 'data', 'routes');
  const leaderboardsDir = path.join(process.cwd(), 'data', 'leaderboards');

  if (!fs.existsSync(leaderboardsDir)) {
    fs.mkdirSync(leaderboardsDir, { recursive: true });
  }

  const files = fs.readdirSync(routesDir).filter((file) => file.endsWith('.json'));

  console.log(`🔍 Found ${files.length} route definitions to process...`);

  for (const file of files) {
    const routeFilePath = path.join(routesDir, file);
    const routeConfig: RouteConfig = JSON.parse(fs.readFileSync(routeFilePath, 'utf-8'));

    console.log(`\n--------------------------------------------------`);
    console.log(`Processing Route: ${routeConfig.id} (${routeConfig.name})`);

    // Load GeoJSON LineString
    const geoJsonPath = path.join(process.cwd(), routeConfig.geoJsonPath || `data/routes/geo/${routeConfig.id}.geojson`);
    if (!fs.existsSync(geoJsonPath)) {
      console.warn(`⚠️ GeoJSON baseline file missing for route ${routeConfig.id} at ${geoJsonPath}`);
      continue;
    }

    const geoJsonRaw = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));
    const lineStringFeature = geoJsonRaw.type === 'FeatureCollection'
      ? geoJsonRaw.features[0]
      : geoJsonRaw;

    if (!routeConfig.stravaSegmentId) {
      console.warn(`Skipping ${routeConfig.id}: no stravaSegmentId in route definition.`);
      continue;
    }

    // 1. Fetch Top Segment Efforts
    console.log(`Fetching top segment efforts for Strava Segment ${routeConfig.stravaSegmentId}...`);
    let efforts = [];
    try {
      efforts = await fetchSegmentTopEfforts(routeConfig.stravaSegmentId, 10);
    } catch (err: any) {
      console.error(`❌ Failed to fetch segment efforts: ${err.message}`);
      continue;
    }

    const verifiedEntries: Omit<LeaderboardEntry, 'rank'>[] = [];

    // 2. Verify Activity Streams
    for (const effort of efforts) {
      console.log(` Checking Activity ${effort.activity_id} (${effort.athlete_name})...`);

      try {
        const streams = await fetchActivityStreams(effort.activity_id);
        const candidate = extractSubTrack(streams, routeConfig, lineStringFeature);
        const verification = verifyAttempt(candidate, routeConfig);

        if (verification.verified && verification.candidate) {
          const cand = verification.candidate;
          const avgSpeedKmh = parseFloat((cand.distanceKm / (cand.elapsedTimeSeconds / 3600)).toFixed(2));

          console.log(`   ✅ Verified! Time: ${cand.elapsedTimeSeconds}s | Speed: ${avgSpeedKmh} km/h`);

          verifiedEntries.push({
            athleteName: effort.athlete_name,
            activityId: effort.activity_id,
            elapsedTimeSeconds: cand.elapsedTimeSeconds,
            avgSpeedKmh,
            elevationGainMeters: cand.elevationGainMeters,
            verifiedAt: new Date().toISOString(),
          });
        } else {
          console.log(`   ❌ Rejected: ${verification.reason}`);
        }
      } catch (err: any) {
        console.error(`   ⚠️ Stream fetch/processing error: ${err.message}`);
      }
    }

    // 3. Sort & Assign Ranks
    verifiedEntries.sort((a, b) => a.elapsedTimeSeconds - b.elapsedTimeSeconds);

    const rankedLeaderboard: LeaderboardEntry[] = verifiedEntries.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    // 4. Save Leaderboard JSON
    const leaderboardPayload = {
      routeId: routeConfig.id,
      lastUpdated: new Date().toISOString(),
      leaderboard: rankedLeaderboard,
    };

    const targetLeaderboardPath = path.join(leaderboardsDir, `${routeConfig.id}.json`);
    fs.writeFileSync(targetLeaderboardPath, JSON.stringify(leaderboardPayload, null, 2));

    console.log(`🎉 Saved ${rankedLeaderboard.length} verified efforts to ${targetLeaderboardPath}`);
  }
}

syncLeaderboards().catch((err) => {
  console.error('Unhandled error during sync:', err);
  process.exit(1);
});
