/**
 * Routes: /api/persons
 */

import { Hono }           from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getPersonById }  from '../models/person.js';

export const personsRouter = new Hono();

personsRouter.get('/api/persons/:id', authMiddleware, c => {
  const person = getPersonById(c.req.param('id'));
  if (!person) return c.json({ error: 'Not found' }, 404);
  return c.json(person);
});
