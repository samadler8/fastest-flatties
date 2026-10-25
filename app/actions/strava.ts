"use server";

import { fetchActivityStreams } from "@/lib/strava/scraper";
import { parseStravaActivityId, parseStravaMetadata } from "@/lib/strava/metadata";
import { thinCoordinates, toMinimalGpx } from "@/lib/strava/sparse-gpx";
import { saveStravaArchive } from "@/lib/strava/archive";

type RouteEndpoint = {
  id: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
};

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function processStravaActivity(url: string, availableRoutes: RouteEndpoint[]) {
  try {
    const activityId = parseStravaActivityId(url);
    const cookie = process.env.STRAVA_COOKIE;
    if (!cookie) throw new Error("STRAVA_COOKIE is missing on the server.");

    const page = await fetch(`https://www.strava.com/activities/${activityId}`, {
      headers: { "Cookie": cookie, "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    if (!page.ok) throw new Error(`Strava activity page returned HTTP ${page.status}.`);
    const { athleteName, activityTitle } = parseStravaMetadata(await page.text());
    const streams = await fetchActivityStreams(activityId, cookie);
    const elapsedSeconds = streams.time.at(-1)! - streams.time[0];
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
      throw new Error("Activity stream time data is invalid.");
    }

    // Match against the full-resolution track before any thinning.
    const start = streams.latlng[0];
    const end = streams.latlng[streams.latlng.length - 1];
    const detectedRouteId = availableRoutes.find(route =>
      [route.startLat, route.startLng, route.endLat, route.endLng].every(Number.isFinite) &&
      distanceMeters(start[0], start[1], route.startLat!, route.startLng!) <= 200 &&
      distanceMeters(end[0], end[1], route.endLat!, route.endLng!) <= 200
    )?.id ?? null;

    const sparse = thinCoordinates(streams.latlng);
    const sparseGpx = toMinimalGpx(sparse);
    await saveStravaArchive({
      activityId,
      athleteName,
      activityTitle,
      sourceUrl: `https://www.strava.com/activities/${activityId}`,
      originalPointCount: streams.latlng.length,
      retainedPointCount: sparse.length,
      sparseGpx,
    });

    return {
      success: true as const,
      activityId, athleteName, activityTitle, elapsedSeconds,
      pointCount: sparse.length,
      detectedRouteId,
    };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : "Unknown Strava import failure." };
  }
}
