import polyline from "@mapbox/polyline";
import simplify from "simplify-js";

export interface StravaSegmentEffort {
  activity_id: string;
  athlete_name: string;
  elapsed_time_seconds: number;
}

export interface ActivityStreams {
  latlng: [number, number][];
  time: number[];
  altitude: number[];
}
export type StravaStreams = ActivityStreams;

/** Retained for leaderboard and polyline tooling; not used for the sparse GPX archive. */
export function compressRouteData(latlngs: [number, number][], tolerance = 0.0001): string {
  const points = latlngs.map(([lat, lon]) => ({ x: lat, y: lon }));
  const simplified = simplify(points, tolerance, true);
  return polyline.encode(simplified.map(p => [p.x, p.y]));
}

export async function fetchSegmentTopEfforts(
  segmentId: string,
  limit = 10,
  accessToken = process.env.STRAVA_ACCESS_TOKEN ?? "",
): Promise<StravaSegmentEffort[]> {
  if (!accessToken) throw new Error("STRAVA_ACCESS_TOKEN is required for segment leaderboard requests.");
  const url = `https://www.strava.com/api/v3/segments/${encodeURIComponent(segmentId)}/leaderboard?page=1&per_page=${limit}`;
  const response = await fetch(url, {
    headers: { "Accept": "application/json", "Authorization": `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Segment leaderboard request failed (${response.status}).`);
  const data: any = await response.json();
  const entries: any[] = Array.isArray(data.entries) ? data.entries : [];
  return entries.map((entry) => ({
    activity_id: String(entry.activity_id),
    athlete_name: `${entry.athlete_firstname ?? ""} ${entry.athlete_lastname ?? ""}`.trim(),
    elapsed_time_seconds: Number(entry.elapsed_time),
  }));
}

/** Internal Strava web endpoint: deliberately uses a server-side cookie, never exposes it to the client. */
export async function fetchActivityStreams(
  activityId: string,
  cookie = process.env.STRAVA_COOKIE ?? "",
): Promise<ActivityStreams> {
  if (!/^\d+$/.test(activityId)) throw new Error("Invalid Strava activity ID.");
  if (!cookie.includes("=")) throw new Error("STRAVA_COOKIE must contain cookieName=cookieValue.");
  const url = new URL(`https://www.strava.com/activities/${activityId}/streams`);
  for (const type of ["latlng", "altitude", "time"]) url.searchParams.append("stream_types[]", type);
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Cookie": cookie,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Strava stream request failed for ${activityId} (HTTP ${response.status}). Check session access and activity permissions.`);
  }
  const raw: unknown = await response.json();
  if (!raw || typeof raw !== "object") throw new Error("Unexpected Strava stream response.");
  const obj = raw as Partial<ActivityStreams>;
  if (!Array.isArray(obj.latlng) || obj.latlng.length < 2 ||
    !Array.isArray(obj.time) || obj.time.length !== obj.latlng.length ||
    !obj.time.every(t => typeof t === "number" && Number.isFinite(t))) {
    throw new Error(`Activity ${activityId} has incomplete latlng/time streams.`);
  }
  if (!obj.latlng.every(p => Array.isArray(p) && p.length >= 2 &&
    typeof p[0] === "number" && typeof p[1] === "number")) {
    throw new Error(`Activity ${activityId} has invalid GPS coordinates.`);
  }
  const altitude = Array.isArray(obj.altitude) && obj.altitude.length === obj.latlng.length
    ? obj.altitude : new Array(obj.latlng.length).fill(0);
  return { latlng: obj.latlng, time: obj.time, altitude };
}
