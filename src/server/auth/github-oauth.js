/**
 * GitHub OAuth flow.
 *
 * GET  /auth/github          → redirect to GitHub authorize
 * GET  /auth/github/callback → exchange code, upsert person, issue JWT, redirect
 *
 * Wired in src/server/index.js.
 *
 * TODO: populate GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars to activate.
 * In mock mode these routes are unused — auth is handled by X-Mock-User header.
 */

import { Hono }     from 'hono';
import { v4 as uuid } from 'uuid';
import { signJwt }  from './jwt.js';
import { getDb }    from '../../../db/db.js';

export const githubAuthRouter = new Hono();

const CLIENT_ID     = () => process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = () => process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI  = () => `${process.env.APP_URL ?? 'http://localhost:3000'}/auth/github/callback`;
const GITHUB_AUTH   = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN  = 'https://github.com/login/oauth/access_token';
const GITHUB_USER   = 'https://api.github.com/user';

githubAuthRouter.get('/', c => {
  if (!CLIENT_ID()) return c.json({ error: 'GitHub OAuth not configured' }, 503);
  const url = `${GITHUB_AUTH}?client_id=${CLIENT_ID()}&scope=read:user&redirect_uri=${encodeURIComponent(REDIRECT_URI())}`;
  return c.redirect(url);
});

githubAuthRouter.get('/callback', async c => {
  const code = c.req.query('code');
  if (!code) return c.json({ error: 'Missing code' }, 400);

  // Exchange code for token
  const tokenRes = await fetch(GITHUB_TOKEN, {
    method:  'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body:    JSON.stringify({ client_id: CLIENT_ID(), client_secret: CLIENT_SECRET(), code, redirect_uri: REDIRECT_URI() }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) return c.json({ error: tokenData.error_description }, 400);

  // Fetch user profile
  const userRes = await fetch(GITHUB_USER, {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'judgmental.io' },
  });
  const ghUser  = await userRes.json();

  // Upsert person + linked_identity
  const db       = getDb();
  const platform = 'github';
  const platformUserId = String(ghUser.id);
  const handle   = ghUser.login;

  let identity = db.get(
    'SELECT * FROM linked_identities WHERE platform = ? AND platform_user_id = ?',
    [platform, platformUserId]
  );

  let personId;
  if (identity) {
    personId = identity.person_id;
  } else {
    personId = uuid();
    db.run(
      'INSERT INTO persons (id, display_name) VALUES (?, ?)',
      [personId, handle]
    );
    const identityId = uuid();
    db.run(
      'INSERT INTO linked_identities (id, person_id, platform, platform_user_id, handle, profile_pic_url) VALUES (?, ?, ?, ?, ?, ?)',
      [identityId, personId, platform, platformUserId, handle, ghUser.avatar_url ?? '']
    );
  }

  const jwt = await signJwt(personId);
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  return c.redirect(`${appUrl}/?token=${jwt}`);
});
