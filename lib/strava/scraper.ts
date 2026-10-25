import fetch from 'node-fetch';

export interface StravaSegmentEffort {
  activity_id: string;
  athlete_name: string;
  elapsed_time_seconds: number;
}

export interface ActivityStreams {
  latlng: [number, number][]; // [lat, lng]
  time: number[];             // Seconds offset
  altitude: number[];         // Elevation in meters
}

/**
 * Retrieves top efforts from public Strava segment leaderboards.
 */
export async function fetchSegmentTopEfforts(
  segmentId: string,
  limit: number = 10
): Promise<StravaSegmentEffort[]> {
  const url = `https://www.strava.com/api/v3/segments/${segmentId}/leaderboard?page=1&per_page=${limit}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FastestFlattiesScraper/1.0',
      'Accept': 'application/json',
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
 * Fetches high-resolution stream arrays from Strava's public activity stream endpoint[cite: 2].
 */
export async function fetchActivityStreams(activityId: string): Promise<ActivityStreams> {
  const streamUrl = `https://www.strava.com/activities/${activityId}/streams?stream_types[]=latlng&stream_types[]=time&stream_types[]=altitude`;[cite: 2]

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

  return {
    latlng: data.latlng,
    time: data.time || [],
    altitude: data.altitude || [],
  };
}