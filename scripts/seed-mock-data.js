// REMOVED — This script seeded localStorage for the Truthbook GitHub Issues PoC.
// Truthbook uses src/mock/seed-data.js and db/migrations/ for seeding.
// Run: git rm scripts/seed-mock-data.js

// seed-mock-data.js
// (placeholder — can be deleted)
 *
 * USAGE
 * -----
 * Two ways to run this:
 *
 * 1. Browser console — load the app in mock mode, then paste the contents of
 *    this file into the DevTools console after the page has loaded.
 *    (The app will reload automatically when done.)
 *
 * 2. Node.js pre-generation — generates a JSON fixture file that the app
 *    can load directly:
 *
 *      node scripts/seed-mock-data.js [--reset] [--user alice]
 *
 *    Options:
 *      --reset       Wipe existing mock data in localStorage (browser) or
 *                    delete the generated fixture file.
 *      --user <login>  Set the active mock user login (default: alice).
 *      --out <path>  Path to write the generated JSON (default: src/mock/fixture.json).
 *
 * MOCK USERS
 * ----------
 *  alice  (id 1001)  — default signed-in user
 *  bob    (id 1002)
 *  carol  (id 1003)
 *  dave   (id 1004)
 *  eve    (id 1005)
 *  frank  (id 1006)
 *
 * SEEDED SCENARIOS
 * ----------------
 *  A. Active, interrogatory, multi-round Q&A   (dispute #301, alice vs bob)
 *  B. Active, objection on a factual claim     (dispute #302, carol vs dave)
 *  C. Resolved via accepted offer              (dispute #303, eve vs frank)
 *  D. Crickets — no response from defender     (dispute #304, alice vs dave)
 *  E. Counter-challenge full loop               (dispute #305, carol vs bob — objection → answer+counter → answer)
 *  F. Agreement (no dispute)                   (assertion #7, frank)
 *  G. Fresh standalone assertions (feed variety)
 */

// ---------------------------------------------------------------------------
// Node.js entry point
// ---------------------------------------------------------------------------

// When running under Node, dynamically import seed-data.js (ESM) then write
// the fixture JSON file.

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Parse CLI args
const args    = process.argv.slice(2);
const reset   = args.includes('--reset');
const userIdx = args.indexOf('--user');
const outIdx  = args.indexOf('--out');
const mockUser = userIdx !== -1 ? args[userIdx + 1] : 'alice';
const outPath  = outIdx  !== -1
  ? path.resolve(args[outIdx + 1])
  : path.join(root, 'src', 'mock', 'fixture.json');

if (reset && existsSync(outPath)) {
  unlinkSync(outPath);
  console.log(`Removed ${outPath}`);
}

// Dynamically import the ESM seed-data module.
const { SEED_ISSUES, MOCK_USERS } = await import('../src/mock/seed-data.js');

const user = MOCK_USERS.find(u => u.login === mockUser) ?? MOCK_USERS[0];

const fixture = {
  mockUser:   user,
  issues:     SEED_ISSUES,
  generatedAt: new Date().toISOString(),
};

writeFileSync(outPath, JSON.stringify(fixture, null, 2), 'utf8');
console.log(`Mock fixture written → ${outPath}`);
console.log(`Active user: ${user.login} (id ${user.id})`);
console.log(`Issues seeded: ${SEED_ISSUES.length}`);
console.log('');
console.log('To enable mock mode, set in src/config.js:');
console.log('  mockMode: true,');
console.log(`  mockUser: '${user.login}',`);

// ---------------------------------------------------------------------------
// Browser snippet (copy-paste into DevTools console)
// ---------------------------------------------------------------------------
//
// If you prefer to seed directly from the browser console without running the
// Node script, paste the following after importing seed-data from DevTools:
//
//   import('/src/mock/seed-data.js').then(({ SEED_ISSUES, MOCK_USERS }) => {
//     localStorage.setItem('dsp:mock:issues', JSON.stringify(SEED_ISSUES));
//     const user = MOCK_USERS[0]; // change index to switch user
//     sessionStorage.setItem('dsp:auth:token', 'mock-token');
//     localStorage.setItem('dsp:auth:login',  user.login);
//     localStorage.setItem('dsp:auth:userId', String(user.id));
//     location.reload();
//   });
