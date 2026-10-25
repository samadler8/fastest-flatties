import { supabase } from '@/lib/supabase';
import { extractSubTrack, RouteConfig } from '@/lib/geo/matcher';
import { verifyAttempt } from '@/lib/verifier';

export async function scanAndSyncCorosActivities(athleteId: string, accessToken: string) {
  // 1. Fetch user workouts from COROS Open API
  const response = await fetch('https://open.coros.com/v2/coros/workout/list?mode=1', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch COROS workout list');
  const data = await response.json();
  const workouts = data.data?.resultList || [];

  // 2. Fetch all site routes and baseline GeoJSON lines
  const { data: routes } = await supabase.from('routes').select('*');
  if (!routes) return;

  for (const workout of workouts) {
    // Fetch detailed activity streams (lat/lng, altitude, timestamps)
    const streamRes = await fetch(`https://open.coros.com/v2/coros/workout/detail?labelId=${workout.labelId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!streamRes.ok) continue;
    const streamData = await streamRes.json();
    const points = streamData.data?.points || [];

    if (points.length === 0) continue;

    const streams = {
      latlng: points.map((p: any) => [p.latitude, p.longitude] as [number, number]),
      time: points.map((p: any) => p.timestamp),
      altitude: points.map((p: any) => p.altitude),
    };

    // 3. Test activity stream against every defined Flatiron route
    for (const route of routes) {
      if (!route.rules_geojson?.features?.[0]) continue;

      const lineStringFeature = route.rules_geojson.features[0];
      const routeConfig: RouteConfig = {
        id: route.id,
        targetDistanceKm: (route.distance_miles || 0) * 1.60934,
        maxElevationGainMeters: 5000,
        startCoordinates: lineStringFeature.geometry.coordinates[0].slice().reverse(),
        endCoordinates: lineStringFeature.geometry.coordinates.slice(-1)[0].slice().reverse(),
        bufferToleranceMeters: 30,
      };

      // Extract sub-track and verify path integrity (>= 95% inside buffer)
      const candidate = extractSubTrack(streams, routeConfig, lineStringFeature);
      const verification = verifyAttempt(candidate, routeConfig);

      if (verification.verified && verification.candidate) {
        const cand = verification.candidate;
        const formattedTime = new Date(cand.elapsedTimeSeconds * 1000).toISOString().substring(11, 19);
        const activityDate = new Date(workout.startTime * 1000).toISOString().split('T')[0];

        // 4. Save verified effort to Supabase
        await supabase.from('efforts').upsert({
          route_id: route.id,
          athlete_id: athleteId,
          time_seconds: cand.elapsedTimeSeconds,
          formatted_time: formattedTime,
          activity_date: activityDate,
          verified: true,
          category_tags: ['Male', 'Unsupported'],
          source: 'COROS',
        });
      }
    }
  }
}
