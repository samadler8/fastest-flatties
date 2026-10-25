const COROS_CLIENT_ID = process.env.COROS_CLIENT_ID!;
const COROS_CLIENT_SECRET = process.env.COROS_CLIENT_SECRET!;
const REDIRECT_URI = process.env.COROS_REDIRECT_URI!;

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
