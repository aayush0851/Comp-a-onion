export type VerifiedIdentity = { email: string };

export async function verifyGoogleAccessToken(accessToken: string): Promise<VerifiedIdentity> {
  const res = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
  );
  if (!res.ok) throw new Error('Invalid Google access token');

  const data = (await res.json()) as { aud?: string; email?: string };
  const expectedAud = process.env.GOOGLE_WEB_CLIENT_ID;
  if (expectedAud && data.aud !== expectedAud) throw new Error('Google token audience mismatch');
  if (!data.email) throw new Error('Google token has no email');

  return { email: data.email };
}
