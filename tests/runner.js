/**
 * judgmental.io custom micro test-runner
 * Pure JavaScript, no external dependencies.
 * Run with: node --experimental-vm-modules tests/runner.js
 */

let _passed = 0;
let _failed = 0;
const _failures = [];

let _beforeEachFn = null;
let _afterEachFn = null;
let _currentSuite = '';
let _testQueue = Promise.resolve();

/**
 * @param {string} name
 * @param {() => void} fn
 */
export function describe(name, fn) {
  const prev = _currentSuite;
  _currentSuite = name;
  try { fn(); } finally { _currentSuite = prev; }
}

/**
 * @param {string} name
 * @param {() => void | Promise<void>} fn
 */
export async function it(name, fn) {
  const label = _currentSuite ? `${_currentSuite} > ${name}` : name;
  const beforeEachFn = _beforeEachFn;
  const afterEachFn = _afterEachFn;

  _testQueue = _testQueue.then(async () => {
    try {
      if (beforeEachFn) await beforeEachFn();
      await fn();
      if (afterEachFn) await afterEachFn();
      _passed++;
      console.log(`  ✓ ${label}`);
    } catch (err) {
      _failed++;
      _failures.push({ label, err });
      console.error(`  ✗ ${label}`);
      console.error(`    ${err.message}`);
    }
  });

  return _testQueue;
}

/** @param {() => void | Promise<void>} fn */
export function beforeEach(fn) { _beforeEachFn = fn; }

/** @param {() => void | Promise<void>} fn */
export function afterEach(fn) { _afterEachFn = fn; }

/**
 * Minimal expect implementation.
 * @param {*} actual
 */
export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    },
    toEqual(expected) {
      const a = JSON.stringify(actual), b = JSON.stringify(expected);
      if (a !== b) throw new Error(`Expected ${a} to equal ${b}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
    },
    toBeNull() {
      if (actual !== null) throw new Error(`Expected value to be null, got ${JSON.stringify(actual)}`);
    },
    toContain(item) {
      if (!actual.includes(item))
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
    },
    toThrow(msg) {
      if (typeof actual !== 'function') throw new Error('toThrow requires a function');
      try { actual(); throw new Error('__no_throw__'); }
      catch (e) {
        if (e.message === '__no_throw__') throw new Error('Expected function to throw');
        if (msg && !e.message.includes(msg))
          throw new Error(`Expected error "${e.message}" to include "${msg}"`);
      }
    },
    not: {
      toBe(expected) {
        if (actual === expected)
          throw new Error(`Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`);
      },
      toBeNull() {
        if (actual === null) throw new Error('Expected value NOT to be null');
      },
    },
  };
}

/** Print summary and exit with appropriate code. */
export async function summary() {
  await _testQueue;
  console.log(`\n${_passed + _failed} tests: ${_passed} passed, ${_failed} failed`);
  if (_failures.length) {
    console.error('\nFailed tests:');
    for (const { label, err } of _failures) {
      console.error(`  ✗ ${label}: ${err.message}`);
    }
    process.exit(1);
  }
}
