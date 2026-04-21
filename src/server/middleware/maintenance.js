/**
 * Maintenance mode middleware.
 * When MAINTENANCE_MODE=true, returns 503 for all routes except:
 *   - GET /health
 *   - POST /maintenance/submit
 *
 * HTML requests receive maintenance.html; API requests receive JSON.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const MAINTENANCE_HTML_PATH = join(__dir, '..', '..', '..', 'maintenance.html');

const EXEMPT_PATHS = new Set(['/health', '/maintenance/submit']);

export function maintenanceMiddleware(c, next) {
  if (process.env.MAINTENANCE_MODE !== 'true') return next();
  if (EXEMPT_PATHS.has(c.req.path)) return next();

  const acceptsHtml = (c.req.header('Accept') ?? '').includes('text/html');
  if (acceptsHtml) {
    try {
      const html = readFileSync(MAINTENANCE_HTML_PATH, 'utf8');
      return c.html(html, 503);
    } catch {
      return c.text('Service unavailable — maintenance in progress', 503);
    }
  }
  return c.json({ error: 'maintenance' }, 503);
}
