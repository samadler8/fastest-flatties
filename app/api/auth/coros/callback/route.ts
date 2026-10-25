import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // 1. Retrieve the secure cookie
  const sessionCookie = cookies().get("coros_oauth_session")?.value;

  if (!sessionCookie || !returnedState || !code) {
    return NextResponse.json({ error: "Missing OAuth parameters or session expired." }, { status: 400 });
  }

  // 2. Parse the cookie and validate the state
  const session = JSON.parse(sessionCookie);

  if (session.state !== returnedState) {
    // CSRF Attack detected or invalid session
    return NextResponse.json({ error: "Invalid state parameter. CSRF validation failed." }, { status: 403 });
  }

  // 3. Extract the athleteId securely from the cookie (NOT the URL parameter)
  const athleteId = session.athleteId;

  // 4. Clear the one-time-use cookie
  cookies().delete("coros_oauth_session");

  try {
    const { athleteId } = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    const tokenData = await exchangeCorosCode(code);

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // 1. Save or update integration tokens
    await supabase.from('athlete_integrations').upsert(
      {
        athlete_id: athleteId,
        provider: 'coros',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        coros_user_id: tokenData.openId,
      },
      { onConflict: 'athlete_id,provider' }
    );

    // 2. Trigger automatic scan of athlete's COROS workouts
    await scanAndSyncCorosActivities(athleteId, tokenData.access_token);

    return NextResponse.redirect(new URL(`/athletes/${athleteId}`, request.url));
  } catch (err: any) {
    console.error('COROS OAuth Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}