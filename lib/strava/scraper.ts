import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import simplify from 'simplify-js';

export interface StravaSegmentEffort {
  activity_id: string;
  athlete_name: string;
  elapsed_time_seconds: number;
}

export interface CompressedActivityStream {
  activity_id: string;
  encoded_polyline: string;
}

/**
 * Compresses a raw Strava latlng stream into a simplified encoded polyline string.
 * @param latlngs Array of [lat, lng] coordinates from Strava
 * @param tolerance Simplification tolerance (0.0001 degrees is ~11 meters)
 */
export function compressRouteData(latlngs: [number, number][], tolerance = 0.0001): string {
  // 1. Format for simplify-js { x: lat, y: lng }
  const points = latlngs.map(coord => ({ x: coord[0], y: coord[1] }));
  
  // 2. Simplify the geometry (removes redundant points on straightaways)
  const simplified = simplify(points, tolerance, true);
  
  // 3. Format back to [lat, lng] arrays
  const reducedCoordinates = simplified.map(p => [p.x, p.y] as [number, number]);
  
  // 4. Encode into a compressed string
  return polyline.encode(reducedCoordinates);
}

/**
 * Retrieves top efforts from public Strava segment leaderboards.
 * Note: Ensure you pass a valid Bearer token in your environment for the v3 API.
 */
export async function fetchSegmentTopEfforts(
  segmentId: string,
  limit: number = 10,
  accessToken: string
): Promise<StravaSegmentEffort[]> {
  const url = `https://www.strava.com/api/v3/segments/${segmentId}/leaderboard?page=1&per_page=${limit}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FastestFlattiesScraper/1.0',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch segment leaderboard ${segmentId}: ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const entries = data.entries || [];

  return entries.map((entry: any) => ({
    activity_id: String(entry.activity_id),
    athlete_name: `${entry.athlete_firstname} ${entry.athlete_lastname}`.trim(),
    elapsed_time_seconds: entry.elapsed_time,
  }));
}

/**
 * Fetches high-resolution stream arrays from Strava's web endpoint and compresses them.
 * This returns only what is needed for the database (the encoded polyline).
 */
export async function fetchAndCompressActivity(activityId: string): Promise<CompressedActivityStream> {
  // Using the frontend web endpoint to bypass strict API rate limits for streams
  const streamUrl = `https://www.strava.com/activities/${activityId}/streams?stream_types[]=latlng`;

  const response = await fetch(streamUrl, {
    headers: {
      'User-Agent': 'FastestFlattiesScraper/1.0',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch streams for activity ${activityId}: ${response.statusText}`);
  }

  const data = (await response.json()) as any;

  if (!data.latlng || !Array.isArray(data.latlng)) {
    throw new Error(`Activity ${activityId} stream is missing latlng coordinate data.`);
  }

  const encoded_polyline = compressRouteData(data.latlng);

  return {
    activity_id: activityId,
    encoded_polyline
  };
}