import { SubTrackCandidate, RouteConfig } from './geo/matcher';

export interface VerificationResult {
  verified: boolean;
  reason?: string;
  candidate?: SubTrackCandidate;
}

/**
 * Validates a sliced sub-track attempt against strict completion rules.
 */
export function verifyAttempt(
  candidate: SubTrackCandidate | null,
  routeConfig: RouteConfig
): VerificationResult {
  if (!candidate) {
    return {
      verified: false,
      reason: 'No matching sub-track found passing through both start and end coordinates.',
    };
  }

  // Rule 1: Spatial Path Integrity (>= 95% inside buffer)
  if (candidate.bufferMatchRatio < 0.95) {
    return {
      verified: false,
      reason: `Path integrity failed: Only ${(candidate.bufferMatchRatio * 100).toFixed(1)}% of coordinates aligned with route buffer (Required >= 95%).`,
      candidate,
    };
  }

  // Rule 2: Elevation Gain Cap
  if (routeConfig.maxElevationGainMeters !== undefined && candidate.elevationGainMeters > routeConfig.maxElevationGainMeters) {
    return {
      verified: false,
      reason: `Elevation gain limit exceeded: ${candidate.elevationGainMeters}m recorded (Max allowed: ${routeConfig.maxElevationGainMeters}m).`,
      candidate,
    };
  }

  // Rule 3: Target Distance Tolerance (±3%)
  const minDistanceKm = routeConfig.targetDistanceKm * 0.97;
  const maxDistanceKm = routeConfig.targetDistanceKm * 1.03;

  if (candidate.distanceKm < minDistanceKm || candidate.distanceKm > maxDistanceKm) {
    return {
      verified: false,
      reason: `Distance tolerance failed: ${candidate.distanceKm}km recorded (Target: ${routeConfig.targetDistanceKm}km ±3%).`,
      candidate,
    };
  }

  return {
    verified: true,
    candidate,
  };
}
