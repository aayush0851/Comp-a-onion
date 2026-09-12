import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { VerifiedIdentity } from './google-verifier.js';

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export async function verifyAppleIdentityToken(identityToken: string): Promise<VerifiedIdentity> {
  const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
    issuer: 'https://appleid.apple.com',
    audience: process.env.APPLE_BUNDLE_ID || undefined,
  });

  if (typeof payload.email !== 'string') throw new Error('Apple token has no email');
  return { email: payload.email };
}
