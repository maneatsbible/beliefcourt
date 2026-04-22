/**
 * Hono API server — truthbook.io
 *
 * Mock mode:   USE_MOCK_DB=true node src/server/index.js
 * Production:  DB_PATH=/data/jdg.db JWT_SECRET=... node src/server/index.js
 */

import { Hono }            from 'hono';
import { serve }           from '@hono/node-server';
import { serveStatic }     from '@hono/node-server/serve-static';

import { initDb }              from '../../db/db.js';
import { corsMiddleware }      from './middleware/cors.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { maintenanceMiddleware } from './middleware/maintenance.js';

import { healthRouter }  from './routes/health.js';
import { authRouter }    from './routes/auth.js';
import { recordsRouter } from './routes/records.js';
import { casesRouter }   from './routes/cases.js';
import { personsRouter } from './routes/persons.js';
import { githubAuthRouter } from './auth/github-oauth.js';

const PORT = Number(process.env.PORT ?? 3000);

// ---- Bootstrap DB -----------------------------------------------------------
await initDb();

// ---- App --------------------------------------------------------------------
const app = new Hono();

// Middleware order matters:
// 1. Health — always passes
// 2. Maintenance check — blocks all others when enabled
// 3. CORS
// 4. Rate limit
app.use('*', corsMiddleware);
app.use('*', maintenanceMiddleware);
app.use('*', rateLimitMiddleware);

// Routes
app.route('/', healthRouter);
app.route('/', authRouter);
app.route('/auth/github', githubAuthRouter);
app.route('/', recordsRouter);
app.route('/', casesRouter);
app.route('/', personsRouter);

// Serve static frontend assets (index.html, styles, src/)
app.use('/*', serveStatic({ root: './' }));

// Catch-all: serve index.html for SPA client-side routing
app.notFound(c => {
  const accept = c.req.header('Accept') ?? '';
  if (accept.includes('text/html')) {
    return serveStatic({ path: './index.html' })(c, () => {});
  }
  return c.json({ error: 'Not found' }, 404);
});

// ---- Start ------------------------------------------------------------------
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[server] truthbook.io running on http://localhost:${PORT}`);
  console.log(`[server] mock mode: ${process.env.USE_MOCK_DB === 'true' ? 'ON' : 'OFF'}`);
});

export { app };
