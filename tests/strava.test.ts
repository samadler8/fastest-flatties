import assert from "node:assert/strict";
import test from "node:test";
import { parseStravaMetadata, parseStravaActivityId } from "../lib/strava/metadata.ts";
import { thinCoordinates, toMinimalGpx } from "../lib/strava/sparse-gpx.ts";

test("reads athlete and activity title, preserving hyphens and HTML entities", () => {
  const parsed = parseStravaMetadata(`<html><meta content='Morning - Run &amp; Climb - Jane O&#39;Connor | Strava' property='og:title'></html>`);
  assert.deepEqual(parsed, { athleteName: "Jane O'Connor", activityTitle: "Morning - Run & Climb" });
});

test("fails closed when athlete name cannot be identified", () => {
  assert.throws(() => parseStravaMetadata('<meta property="og:title" content="A Run | Strava">'), /athlete/);
});

test("accepts only numeric Strava HTTPS activity links", () => {
  assert.equal(parseStravaActivityId("https://www.strava.com/activities/19787649809?foo=1"), "19787649809");
  for (const url of ["http://www.strava.com/activities/1", "https://evil.com/activities/1", "https://strava.com/athletes/1", "https://strava.com/activities/../admin"]) {
    assert.throws(() => parseStravaActivityId(url));
  }
});

test("thin GPS points but keep endpoints, corners, and maximum spatial gaps", () => {
  const coords: [number, number][] = [];
  for (let i = 0; i <= 100; i++) coords.push([40 + i * 0.00001, -105]);
  for (let i = 1; i <= 100; i++) coords.push([40.001, -105 + i * 0.00001]);
  const thin = thinCoordinates(coords, 12, 200);
  assert.ok(thin.length < coords.length / 4, `${thin.length} vs ${coords.length}`);
  assert.deepEqual(thin[0], coords[0]);
  assert.deepEqual(thin.at(-1), coords.at(-1));
  assert.ok(thin.some(c => c[0] === 40.001 && c[1] === -105), "corner preserved");
});

test("GPX is positions only with no sensitive stream fields", () => {
  const xml = toMinimalGpx([[40.12345672, -105.12345678], [40.124, -105.123]]);
  assert.match(xml, /<trkpt lat="40\.123457" lon="-105\.123457"\/>/);
  assert.equal((xml.match(/<trkpt /g) ?? []).length, 2);
  assert.doesNotMatch(xml, /<time|<ele|heartrate|<extensions|<name|<metadata/i);
});

test("invalid coordinates cannot be exported", () => {
  assert.throws(() => thinCoordinates([[40, -105], [91, 0]]), /invalid GPS/i);
  assert.throws(() => thinCoordinates([[40, -105]]), /fewer than two/i);
});
