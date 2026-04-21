/**
 * Route: GET /health
 *        GET /version
 */

import { Hono } from 'hono';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const pkg   = JSON.parse(readFileSync(join(__dir, '..', '..', '..', 'package.json'), 'utf8'));

export const healthRouter = new Hono();

healthRouter.get('/health',  c => c.json({ status: 'ok' }));
healthRouter.get('/version', c => c.json({ version: pkg.version, schema: 1 }));
