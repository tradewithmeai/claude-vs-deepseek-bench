const test = require('node:test');
const assert = require('node:assert/strict');
const { normaliseCheckCode } = require('../src/normaliseCheckCode.js');
test('normalises separators and validates correct 8-character check codes', () => {
  assert.equal(normaliseCheckCode(' ab-12.cd01 '), 'AB12CD01');
  assert.equal(normaliseCheckCode('q9_x7_zm57'), 'Q9X7ZM57');
});
test('rejects bad check digits, bad characters, wrong length, and non-strings', () => {
  assert.equal(normaliseCheckCode('AB12CD02'), null);
  assert.equal(normaliseCheckCode('AB12C@D5'), null);
  assert.equal(normaliseCheckCode('AB12CD5'), null);
  assert.equal(normaliseCheckCode(null), null);
  assert.equal(normaliseCheckCode(12345678), null);
});
