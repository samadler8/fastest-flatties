export type LatLng = readonly [number, number];

const RADIUS_METERS = 6371000;

function distanceMeters(a: LatLng, b: LatLng): number {
  const phi1 = a[0] * Math.PI / 180;
  const phi2 = b[0] * Math.PI / 180;
  const dPhi = phi2 - phi1;
  const dLambda = (b[1] - a[1]) * Math.PI / 180;
  const x = Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(x)));
}

function perpendicularMeters(p: LatLng, a: LatLng, b: LatLng): number {
  const latScale = 111195;
  const lonScale = latScale * Math.cos(((a[0] + b[0]) / 2) * Math.PI / 180);
  const x = (p[1] - a[1]) * lonScale;
  const y = (p[0] - a[0]) * latScale;
  const bx = (b[1] - a[1]) * lonScale;
  const by = (b[0] - a[0]) * latScale;
  const denom = bx * bx + by * by;
  if (denom === 0) return Math.hypot(x, y);
  const t = Math.max(0, Math.min(1, (x * bx + y * by) / denom));
  return Math.hypot(x - t * bx, y - t * by);
}

/** Keep shape-defining turns, end points, and a point at least every maxGapMeters. */
export function thinCoordinates(
  coordinates: ReadonlyArray<LatLng>,
  toleranceMeters = 12,
  maxGapMeters = 200,
): LatLng[] {
  if (coordinates.length < 2) throw new Error("Activity has fewer than two GPS points.");
  if (!coordinates.every(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon) &&
    Math.abs(lat) <= 90 && Math.abs(lon) <= 180)) {
    throw new Error("Activity contains invalid GPS coordinates.");
  }
  if (toleranceMeters <= 0 || maxGapMeters <= 0) throw new Error("Invalid thinning settings.");

  // Iterative Ramer-Douglas-Peucker: keep turns rather than every Nth sample.
  const keep = new Set<number>([0, coordinates.length - 1]);
  const stack: Array<[number, number]> = [[0, coordinates.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop()!;
    let farthest = -1;
    let greatest = toleranceMeters;
    for (let i = start + 1; i < end; i++) {
      const deviation = perpendicularMeters(coordinates[i], coordinates[start], coordinates[end]);
      if (deviation > greatest) { greatest = deviation; farthest = i; }
    }
    if (farthest !== -1) {
      keep.add(farthest);
      stack.push([start, farthest], [farthest, end]);
    }
  }

  // Also bound long spatial gaps along the source track for map/route visibility.
  const indices = [...keep].sort((a, b) => a - b);
  const outputIndices: number[] = [indices[0]];
  for (let k = 1; k < indices.length; k++) {
    const end = indices[k];
    let distance = 0;
    let previous = outputIndices[outputIndices.length - 1];
    for (let i = previous + 1; i < end; i++) {
      distance += distanceMeters(coordinates[i - 1], coordinates[i]);
      if (distance >= maxGapMeters) {
        outputIndices.push(i);
        distance = 0;
      }
    }
    if (outputIndices[outputIndices.length - 1] !== end) outputIndices.push(end);
  }
  return outputIndices.map(i => coordinates[i]);
}

/** GPX deliberately contains positions only: no athlete details, timestamps, HR, or elevation. */
export function toMinimalGpx(coordinates: ReadonlyArray<LatLng>): string {
  const points = coordinates.map(([lat, lon]) =>
    `    <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"/>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<gpx version="1.1" creator="Fastest Flatties" xmlns="http://www.topografix.com/GPX/1/1">\n` +
    `  <trk><trkseg>\n${points}\n  </trkseg></trk>\n</gpx>\n`;
}
