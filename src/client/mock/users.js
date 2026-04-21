/**
 * Mock users — client-accessible ES module.
 * Mirrors the MOCK_USERS list from src/mock/seed-rows.js.
 * Kept in sync manually; used by the mock toolbar picker.
 */
export const MOCK_USERS = [
  { handle: 'alice',  person_id: 'person-alice',  is_super_admin: 0 },
  { handle: 'bob',    person_id: 'person-bob',    is_super_admin: 0 },
  { handle: 'carol',  person_id: 'person-carol',  is_super_admin: 0 },
  { handle: 'dave',   person_id: 'person-dave',   is_super_admin: 0 },
  { handle: 'eve',    person_id: 'person-eve',    is_super_admin: 0 },
  { handle: 'frank',  person_id: 'person-frank',  is_super_admin: 0 },
  { handle: 'admin',  person_id: 'person-admin',  is_super_admin: 1 },
];
