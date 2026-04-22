/**
 * JWT helpers — sign and verify HS256 tokens using jose.
 * JWT_SECRET env var must be set in production.
 */

import { SignJWT, jwtVerify } from 'jose';

const ALG      = 'HS256';
const EXPIRY   = '24h';
const ISSUER   = 'truthbook.io';
const AUDIENCE = 'truthbook.io';

function _secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET env var is not set');
  return new TextEncoder().encode(s);
}

/**
 * Sign a JWT for a person.
 * @param {string} personId
 * @returns {Promise<string>}
 */
export async function signJwt(personId) {
  return new SignJWT({ personId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(EXPIRY)
    .sign(_secret());
}

/**
 * Verify a JWT and return its payload.
 * Throws on invalid/expired tokens.
 * @param {string} token
 * @returns {Promise<{ personId: string }>}
 */
export async function verifyJwt(token) {
  const { payload } = await jwtVerify(token, _secret(), {
    issuer:   ISSUER,
    audience: AUDIENCE,
  });
  return { personId: payload.personId };
}
