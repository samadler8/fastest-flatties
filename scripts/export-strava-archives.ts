/** Materializes private, persisted archive rows into tracked files for GitHub Actions to commit. */
import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.");
}
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function writeIfChanged(path: string, content: string): Promise<boolean> {
  try { if (await readFile(path, "utf8") === content) return false; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  await writeFile(path, content, "utf8");
  return true;
}

async function main() {
  let offset = 0;
  let changed = 0;
  for (;;) {
    const { data, error } = await client.from("strava_activity_archives")
      .select("activity_id,athlete_name,activity_title,source_url,original_point_count,retained_point_count,sparse_gpx")
      .order("activity_id")
      .range(offset, offset + 499);
    if (error) throw new Error(`Cannot fetch Strava archives: ${error.message}`);
    if (!data?.length) break;

    for (const row of data) {
      // The SQL table also validates this; enforce again before touching the filesystem.
      if (!/^\d+$/.test(row.activity_id)) throw new Error("Invalid archived activity ID.");
      const directory = join(process.cwd(), "data", "activities", row.activity_id);
      await mkdir(directory, { recursive: true });
      const metadata = {
        activityId: row.activity_id,
        athleteName: row.athlete_name,
        activityTitle: row.activity_title,
        sourceUrl: row.source_url,
        originalPointCount: row.original_point_count,
        retainedPointCount: row.retained_point_count,
      };
      changed += Number(await writeIfChanged(join(directory, "metadata.json"), JSON.stringify(metadata, null, 2) + "\n"));
      changed += Number(await writeIfChanged(join(directory, "track.gpx"), row.sparse_gpx));
    }
    offset += data.length;
    if (data.length < 500) break;
  }
  console.log(`Archive export finished. ${offset} activities, ${changed} files changed.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
