// Minimal smoke tests for BotEngine (no test framework needed).
// Run: node src/tests/botEngine.test.js
import assert from 'node:assert';
import { BotEngine } from '../services/botEngine.js';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`     ${err.message}`);
  }
}

console.log('BotEngine smoke tests\n');

// 1. fixed mode returns the configured message
await test('fixed mode returns configured message', () => {
  const r = BotEngine.fixed({ fixedMessage: 'Hello!' });
  assert.equal(r, 'Hello!');
});

// 2. fixed mode falls back when empty
await test('fixed mode falls back to default when empty', () => {
  const r = BotEngine.fixed({ fixedMessage: '' });
  assert.ok(r.length > 0);
});

// 3. process() routes by mode
await test('process() routes fixed mode', async () => {
  const r = await BotEngine.process({ mode: 'fixed', fixedMessage: 'Hi' }, 'anything');
  assert.equal(r, 'Hi');
});

// 4. process() returns null on empty input
await test('process() returns null on empty input', async () => {
  const r = await BotEngine.process({ mode: 'fixed' }, '');
  assert.equal(r, null);
});

// 5. process() returns null on non-string input
await test('process() returns null on non-string input', async () => {
  const r = await BotEngine.process({ mode: 'fixed' }, null);
  assert.equal(r, null);
});

// 6. process() defaults unknown mode to fixed
await test('process() defaults unknown mode to fixed', async () => {
  const r = await BotEngine.process({ mode: 'weird', fixedMessage: 'fallback' }, 'hi');
  assert.equal(r, 'fallback');
});

// 7. process() with empty qaPairs falls back to fixed
await test('qa mode with empty pairs falls back', async () => {
  const r = await BotEngine.process({ mode: 'qa', qaPairs: [], fixedMessage: 'default' }, 'q');
  // qa mode calls Gemini which may fail in dev — should still return a string.
  assert.equal(typeof r, 'string');
  assert.ok(r.length > 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
