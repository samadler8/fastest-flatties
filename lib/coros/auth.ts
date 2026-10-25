const COROS_CLIENT_ID = process.env.COROS_CLIENT_ID!;
const COROS_CLIENT_SECRET = process.env.COROS_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/coros/callback`;

/**
 * Returns the authorization URL to redirect users to COROS sign-in
 */
export function getCorosAuthUrl(athleteId: string): string {
  const state = Buffer.from(JSON.stringify({ athleteId })).toString('base64');
  return `https://open.coros.com/oauth/authorize?client_id=${COROS_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
}

/**
 * Exchanges authorization code for access and refresh tokens
 */
export async function exchangeCorosCode(code: string) {
  const response = await fetch('https://open.coros.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: COROS_CLIENT_ID,
      client_secret: COROS_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error(`COROS token exchange failed: ${response.statusText}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    openId: string;
  }>;
}