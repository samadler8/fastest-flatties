import * as turf from '@turf/turf';
import { ActivityStreams } from '../strava/scraper';

export interface SubTrackCandidate {
  startIndex: number;
  endIndex: number;
  slicedCoordinates: [number, number][]; // [lat, lng]
  slicedTime: number[];
  slicedAltitude: number[];
  elapsedTimeSeconds: number;
  elevationGainMeters: number;
  distanceKm: number;
  bufferMatchRatio: number;
}

export interface RouteConfig {
  id: string;
  targetDistanceKm: number;
  maxElevationGainMeters: number;
  startCoordinates: [number, number]; // [lat, lng]
  endCoordinates: [number, number];   // [lat, lng]
  bufferToleranceMeters: number;
}

/**
 * Scans activity streams for route start/end points and extracts matching sub-tracks.
 */
export function extractSubTrack(
  streams: ActivityStreams,
  routeConfig: RouteConfig,
  officialLineStringGeoJSON: turf.Feature<turf.LineString>
): SubTrackCandidate | null {
  const { latlng, time, altitude } = streams;
  const bufferTolerance = routeConfig.bufferToleranceMeters || 30;

  const startPoint = turf.point([routeConfig.startCoordinates[1], routeConfig.startCoordinates[0]]);
  const endPoint = turf.point([routeConfig.endCoordinates[1], routeConfig.endCoordinates[0]]);

  // 1. Identify Candidate Start & End Point Indices
  const startIndices: number[] = [];
  const endIndices: number[] = [];

  for (let i = 0; i < latlng.length; i++) {
    const pt = turf.point([latlng[i][1], latlng[i][0]]);
    const distToStart = turf.distance(pt, startPoint, { units: 'meters' });
    if (distToStart <= bufferTolerance) {
      startIndices.push(i);
    }
  }

  for (let j = 0; j < latlng.length; j++) {
    const pt = turf.point([latlng[j][1], latlng[j][0]]);
    const distToEnd = turf.distance(pt, endPoint, { units: 'meters' });
    if (distToEnd <= bufferTolerance) {
      endIndices.push(j);
    }
  }

  if (startIndices.length === 0 || endIndices.length === 0) {
    return null; // Route start or end point not reached in activity
  }

  // 2. Build 30-meter Buffer Polygon around the baseline route
  const routeBufferPolygon = turf.buffer(officialLineStringGeoJSON, 0.03, { units: 'kilometers' });[cite: 1]

  let bestCandidate: SubTrackCandidate | null = null;

  // 3. Evaluate Candidate Start/End Index Pairs (i, j)
  const pointBufferStatus = latlng.map(([lat, lng]) => {
    const p = turf.point([lng, lat]);
    return turf.booleanPointInPolygon(p, routeBufferPolygon);
  });
  for (const i of startIndices) {
    for (const j of endIndices) {
      if (j <= i + 5) continue; // Ensure a minimal valid sub-track duration

      const slicedLatlng = latlng.slice(i, j + 1);
      const slicedTime = time.slice(i, j + 1);
      const slicedAltitude = altitude.slice(i, j + 1);

      // Verify Buffer Coverage (>= 95% of points must lie inside route buffer)
      let insideCount = 0;
      for (let k = i; k <= j; k++) {
        if (pointBufferStatus[k]) insideCount++;
      }

      const bufferMatchRatio = insideCount / slicedLatlng.length;

      // 4. Compute Sub-Track Metrics
      const elapsedTimeSeconds = slicedTime[slicedTime.length - 1] - slicedTime[0];[cite: 1]

      let elevationGainMeters = 0;
      let lastAltitude = slicedAltitude[0];

      for (let k = 1; k < slicedAltitude.length; k++) {
        const diff = slicedAltitude[k] - lastAltitude;
        // Only register gain if the threshold is exceeded to filter GPS noise
        if (diff > 3) { 
          elevationGainMeters += diff;
          lastAltitude = slicedAltitude[k];
        } else if (diff < -3) {
          // Update baseline for descents to accurately track subsequent climbs
          lastAltitude = slicedAltitude[k];
        }
      }

      // GeoJSON LineString coordinates use [lng, lat]
      const geoJsonCoords = slicedLatlng.map(([lat, lng]) => [lng, lat]);
      const slicedLine = turf.lineString(geoJsonCoords);
      const distanceKm = turf.length(slicedLine, { units: 'kilometers' });

      const candidate: SubTrackCandidate = {
        startIndex: i,
        endIndex: j,
        slicedCoordinates: slicedLatlng,
        slicedTime,
        slicedAltitude,
        elapsedTimeSeconds,
        elevationGainMeters: Math.round(elevationGainMeters),
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        bufferMatchRatio,
      };

      // Select candidate with the best buffer match ratio and fastest elapsed time
      if (!bestCandidate || (candidate.bufferMatchRatio >= 0.95 && candidate.elapsedTimeSeconds < bestCandidate.elapsedTimeSeconds)) {
        bestCandidate = candidate;
      }
    }
  }

  return bestCandidate;
}