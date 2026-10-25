import { createClient } from "@supabase/supabase-js";

export interface StravaArchive {
  activityId: string;
  athleteName: string;
  activityTitle: string;
  sourceUrl: string;
  originalPointCount: number;
  retainedPointCount: number;
  sparseGpx: string;
}

/** Archive server-side only. Public Supabase clients are not allowed to write to this table. */
export async function saveStravaArchive(archive: StravaArchive): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Activity archive is not configured (SUPABASE_SERVICE_ROLE_KEY missing).");
  }
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.from("strava_activity_archives").upsert({
    activity_id: archive.activityId,
    athlete_name: archive.athleteName,
    activity_title: archive.activityTitle,
    source_url: archive.sourceUrl,
    original_point_count: archive.originalPointCount,
    retained_point_count: archive.retainedPointCount,
    sparse_gpx: archive.sparseGpx,
  }, { onConflict: "activity_id" });
  if (error) throw new Error(`Activity archive could not be saved: ${error.message}`);
}
