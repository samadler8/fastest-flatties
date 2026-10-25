import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exchangeCorosCode } from "@/lib/coros/auth";
import { scanAndSyncCorosActivities } from "@/lib/coros/scanner";

/** Handles the one-time COROS OAuth return. State and athlete ID come from a signed-by-browser
 * HTTP-only session cookie, not from query parameters (and not from base64-encoded state). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("coros_oauth_session")?.value;

  if (!sessionCookie || !returnedState || !code) {
    return NextResponse.json({ error: "Missing OAuth parameters or session expired." }, { status: 400 });
  }

  let session: { state: string; athleteId: string };
  try {
    const parsed: unknown = JSON.parse(sessionCookie);
    if (!parsed || typeof parsed !== "object" ||
      !("state" in parsed) || typeof parsed.state !== "string" ||
      !("athleteId" in parsed) || typeof parsed.athleteId !== "string" ||
      !parsed.athleteId) {
      throw new Error("Invalid OAuth session");
    }
    session = { state: parsed.state, athleteId: parsed.athleteId };
  } catch {
    return NextResponse.json({ error: "Invalid OAuth session cookie." }, { status: 400 });
  }

  if (session.state !== returnedState) {
    return NextResponse.json({ error: "Invalid state parameter. CSRF validation failed." }, { status: 403 });
  }

  cookieStore.delete("coros_oauth_session");
  const { athleteId } = session;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("COROS server is missing Supabase service-role configuration.");
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const tokenData = await exchangeCorosCode(code);
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    const { error } = await supabase.from("athlete_integrations").upsert({
      athlete_id: athleteId,
      provider: "coros",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      coros_user_id: tokenData.openId,
    }, { onConflict: "athlete_id,provider" });
    if (error) throw new Error(`Could not save COROS integration: ${error.message}`);

    await scanAndSyncCorosActivities(athleteId, tokenData.access_token);
    return NextResponse.redirect(new URL(`/athletes/${encodeURIComponent(athleteId)}`, request.url));
  } catch (error: unknown) {
    console.error("COROS OAuth Error:", error);
    return NextResponse.json({ error: "COROS connection failed. Check server logs." }, { status: 500 });
  }
}
