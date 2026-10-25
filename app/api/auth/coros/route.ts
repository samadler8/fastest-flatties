import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const athleteId = url.searchParams.get("athleteId");

  if (!athleteId) {
    return NextResponse.json({ error: "Missing athleteId" }, { status: 400 });
  }

  // Generate a cryptographically secure random state
  const state = crypto.randomUUID();

  // Store both the state and the athleteId in a secure, HTTP-only cookie.
  // This ensures the client cannot tamper with it.
  cookies().set({
    name: "coros_oauth_session",
    value: JSON.stringify({ state, athleteId }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minute expiration
  });

  // Redirect to COROS OAuth with the secure state
  const corosAuthUrl = new URL("https://coros.com/oauth2/authorize");
  corosAuthUrl.searchParams.set("client_id", process.env.COROS_CLIENT_ID!);
  corosAuthUrl.searchParams.set("redirect_uri", process.env.COROS_REDIRECT_URI!);
  corosAuthUrl.searchParams.set("response_type", "code");
  corosAuthUrl.searchParams.set("state", state); // Pass only the random UUID

  return NextResponse.redirect(corosAuthUrl.toString());
}