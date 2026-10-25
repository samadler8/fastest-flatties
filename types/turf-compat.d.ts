/** Temporary compatibility declarations for Turf 6.5 with TS moduleResolution=bundler.
 * Remove after migrating to a Turf release that exports types correctly. */
declare module "@turf/turf" {
  import type { Feature, LineString, Point, Polygon, MultiPolygon } from "geojson";
  export type { Feature, LineString } from "geojson";
  export function point(coordinates: number[]): Feature<Point>;
  export function distance(
    from: Feature<Point>,
    to: Feature<Point>,
    options?: { units?: string },
  ): number;
  export function buffer(
    geojson: Feature<LineString>,
    radius: number,
    options?: { units?: string },
  ): Feature<Polygon | MultiPolygon> | undefined;
  export function booleanPointInPolygon(
    pt: Feature<Point>,
    polygon: Feature<Polygon | MultiPolygon>,
  ): boolean;
  export function lineString(coordinates: number[][]): Feature<LineString>;
  export function length(line: Feature<LineString>, options?: { units?: string }): number;
}
