/**
 * Mock API interceptor — patches window.fetch to simulate the backend REST API.
 * Active only when isMockMode() is true.
 *
 * Routes handled:
 *   GET  /api/claims              → paginated claims
 *   POST /api/claims              → create claim
 *   GET  /api/cases/:id           → case with duels + records
 *   POST /api/cases               → open a new case
 *   GET  /api/duels/:id           → duel with associated records
 *   POST /api/duels/:id/turns     → submit a turn record
 *   GET  /api/persons/:id         → person profile
 *   GET  /api/persons/:id/records → person's records
 */

import { SEED_RECORDS, SEED_CASES, SEED_DUELS, SEED_PERSONS } from './seed-data.js';

// In-memory mutable store (copy seed data so writes persist for the session)
let _records = SEED_RECORDS.map(r => ({ ...r }));
let _cases   = SEED_CASES.map(c => ({ ...c }));
let _duels   = SEED_DUELS.map(d => ({ ...d }));
let _persons = SEED_PERSONS.map(p => ({ ...p }));

let _installed = false;

// ---------------------------------------------------------------------------
// Route table
// ---------------------------------------------------------------------------

function route(method, pathname, body, mockUser) {
  const parts = pathname.split('/').filter(Boolean); // ['api', 'claims', ...]

  // GET /api/claims
  if (method === 'GET' && parts[1] === 'claims' && !parts[2]) {
    const url = new URL('http://x' + pathname + (body ? '' : ''));
    return null; // handled separately with original URL
  }

  // GET /api/cases/:id
  if (method === 'GET' && parts[1] === 'cases' && parts[2]) {
    const caseObj = _cases.find(c => c.id === parts[2]);
    if (!caseObj) return err(404, 'Case not found');
    const duels = _duels.filter(d => caseObj.duels.includes(d.id)).map(d => {
      return {
        ...d,
        records: _records.filter(r => r.case_id === d.case_id &&
          [d.challenge_record_id, d.answer_record_id, d.disposition_record_id].includes(r.id)),
      };
    });
    const claim = _records.find(r => r.id === caseObj.claim_id) ?? null;
    return ok({ ...caseObj, claim, duels });
  }

  // GET /api/duels/:id
  if (method === 'GET' && parts[1] === 'duels' && parts[2] && !parts[3]) {
    const duel = _duels.find(d => d.id === parts[2]);
    if (!duel) return err(404, 'Duel not found');
    const ids = [duel.challenge_record_id, duel.answer_record_id, duel.disposition_record_id].filter(Boolean);
    const records = _records.filter(r => ids.includes(r.id));
    return ok({ ...duel, records });
  }

  // POST /api/duels/:id/turns
  if (method === 'POST' && parts[1] === 'duels' && parts[3] === 'turns') {
    const duelId = parts[2];
    const duel   = _duels.find(d => d.id === duelId);
    if (!duel) return err(404, 'Duel not found');
    const person = _getPersonByHandle(mockUser);
    if (!person) return err(401, 'Not authenticated');
    const type = body?.type ?? 'answer';
    const rec  = _makeRecord(type, person, duel.case_id, body?.text ?? '');
    if (type === 'answer')  duel.answer_record_id      = rec.id;
    if (type === 'judgment') duel.disposition_record_id = rec.id;
    _records.push(rec);
    return ok(rec);
  }

  // POST /api/cases
  if (method === 'POST' && parts[1] === 'cases' && !parts[2]) {
    const person = _getPersonByHandle(mockUser);
    if (!person) return err(401, 'Not authenticated');
    const claim = _records.find(r => r.id === body?.claimId);
    if (!claim) return err(404, 'Claim not found');
    const challengeRec = _makeRecord('challenge', person, null, body?.challengeText ?? '');
    const caseId = `case-${Date.now()}`;
    challengeRec.case_id = caseId;
    const duelId = `duel-${Date.now()}`;
    const duel = {
      id: duelId, case_id: caseId, status: 'active', round: 1,
      challenge_record_id: challengeRec.id, answer_record_id: null,
      disposition_record_id: null,
      started_at: new Date().toISOString(), ended_at: null,
    };
    const newCase = {
      id: caseId, claim_id: claim.id,
      challenger_id: person.id, challenger_handle: person.linked_identities[0]?.handle,
      respondent_id: claim.author_id, respondent_handle: claim.author_handle,
      status: 'open',
      opened_at: new Date().toISOString(), closed_at: null,
      duels: [duelId],
    };
    claim.open_case_count = (claim.open_case_count ?? 0) + 1;
    _records.push(challengeRec);
    _duels.push(duel);
    _cases.push(newCase);
    return ok(newCase);
  }

  // POST /api/claims
  if (method === 'POST' && parts[1] === 'claims' && !parts[2]) {
    const person = _getPersonByHandle(mockUser);
    if (!person) return err(401, 'Not authenticated');
    const rec = _makeRecord('claim', person, null, body?.text ?? '');
    _records.push(rec);
    return ok(rec);
  }

  // GET /api/persons/:id
  if (method === 'GET' && parts[1] === 'persons' && parts[2] && !parts[3]) {
    const person = _persons.find(p => p.id === parts[2]);
    if (!person) return err(404, 'Person not found');
    return ok(person);
  }

  // GET /api/persons/:id/records
  if (method === 'GET' && parts[1] === 'persons' && parts[3] === 'records') {
    const personId = parts[2];
    const recs = _records.filter(r => r.author_id === personId);
    return ok({ records: recs, total: recs.length });
  }

  return null; // not matched — fall through to real fetch
}

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

export function installMockInterceptor() {
  if (_installed) return;
  _installed = true;

  const _realFetch = window.fetch.bind(window);

  window.fetch = async function mockFetch(input, init = {}) {
    const req    = typeof input === 'string' ? new Request(input, init) : input;
    const url    = new URL(req.url, window.location.href);
    const path   = url.pathname + url.search;
    const method = (req.method ?? 'GET').toUpperCase();
    const mockUser = req.headers?.get('X-Mock-User') ?? (init?.headers?.['X-Mock-User']) ?? null;

    // Only intercept /api/* paths
    if (!url.pathname.startsWith('/api/')) {
      return _realFetch(input, init);
    }

    let bodyData = null;
    if (init?.body) {
      try { bodyData = JSON.parse(init.body); } catch (_) { /* ignore */ }
    }

    // Special case: GET /api/claims with query params
    if (method === 'GET' && url.pathname === '/api/claims') {
      const limit  = parseInt(url.searchParams.get('limit')  ?? '30', 10);
      const offset = parseInt(url.searchParams.get('offset') ?? '0',  10);
      const claims = _records.filter(r => r.type === 'claim');
      const page   = claims.slice(offset, offset + limit);
      return _jsonResponse({ claims: page, total: claims.length, offset, limit });
    }

    const result = route(method, url.pathname, bodyData, mockUser);
    if (result) return result;

    // Not matched — pass through (will likely 404 in dev, but not crash)
    return _realFetch(input, init);
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function ok(data)          { return _jsonResponse(data, 200); }
function err(code, msg)    { return _jsonResponse({ error: msg }, code); }

function _getPersonByHandle(handle) {
  if (!handle) return null;
  return _persons.find(p => p.linked_identities.some(i => i.handle === handle)) ?? null;
}

let _idCounter = Date.now();
function _makeRecord(type, person, caseId, text) {
  const id = `rec-${++_idCounter}`;
  const identity = person.linked_identities[0] ?? {};
  return {
    id, type, text, case_id: caseId,
    author_id: person.id,
    author_handle: identity.handle ?? person.display_name,
    author_platform: identity.platform ?? 'unknown',
    author_profile_pic_url: identity.profile_pic_url ?? '',
    is_ai: person.is_ai ?? 0,
    ai_model: person.ai_model ?? null,
    open_case_count: 0, accord_count: 0,
    status: 'open',
    created_at: new Date().toISOString(),
  };
}
