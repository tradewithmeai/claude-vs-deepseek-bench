#!/usr/bin/env sh
set -eu
mkdir -p tasks

mkdir -p tasks/tier1-check-code/workspace/src tasks/tier1-check-code/grading/hidden_tests
cat > tasks/tier1-check-code/PROMPT.md <<'EOT'
# Task: Implement `normaliseCheckCode`

The file `src/normaliseCheckCode.js` exports a function `normaliseCheckCode(input)` that is currently a stub.

Implement it so it converts a supplier check-code into the canonical form used by the warehouse desk.

Rules:

- Accept only strings. Non-string input returns `null`.
- Trim leading and trailing whitespace.
- Remove spaces, hyphens, underscores, and periods from the remaining text.
- Convert letters to uppercase.
- The cleaned code must contain exactly 8 characters.
- The cleaned code must contain only uppercase letters `A-Z` and digits `0-9`.
- The final character is a check digit.
- Compute the expected check digit from the first 7 characters:
  - For each of the first 7 characters, convert digits to their numeric value and letters to `A=10`, `B=11`, ..., `Z=35`.
  - Multiply those values by weights `[3, 7, 1, 3, 7, 1, 3]` in order.
  - Sum the products.
  - Expected check digit is `sum % 10` as a string.
- Return the cleaned 8-character code only if the supplied final character equals the expected check digit.
- Otherwise return `null`.

Do not change the export signature. When you are done, the project's tests should pass.
EOT
cat > tasks/tier1-check-code/meta.json <<'EOT'
{"id":"tier1-check-code","tier":1,"title":"Implement supplier check-code normalisation","language":"node","time_cap_min":10,"turn_cap":25,"setup_cmd":"","grade_cmd":"node --test \"_grading/**/*.test.js\"","public_tests":false}
EOT
cat > tasks/tier1-check-code/workspace/src/normaliseCheckCode.js <<'EOT'
function normaliseCheckCode(input) {
  return input;
}
module.exports = { normaliseCheckCode };
EOT
cat > tasks/tier1-check-code/grading/hidden_tests/normaliseCheckCode.test.js <<'EOT'
const test = require('node:test');
const assert = require('node:assert/strict');
const { normaliseCheckCode } = require('../src/normaliseCheckCode.js');
test('normalises separators and validates correct check digits', () => {
  assert.equal(normaliseCheckCode(' ab-12.cd5 '), 'AB12CD5');
  assert.equal(normaliseCheckCode('q9_x7_zm5'), 'Q9X7ZM5');
});
test('rejects bad check digits, bad characters, wrong length, and non-strings', () => {
  assert.equal(normaliseCheckCode('AB12CD6'), null);
  assert.equal(normaliseCheckCode('AB12C@D5'), null);
  assert.equal(normaliseCheckCode('AB12CD55'), null);
  assert.equal(normaliseCheckCode(null), null);
  assert.equal(normaliseCheckCode(12345678), null);
});
EOT
cat > tasks/tier1-check-code/grading/rubric.md <<'EOT'
# Quality rubric

- 3: Complete implementation; handles type checks, separator removal, validation, and check digit exactly.
- 2: Mostly correct but misses one edge case such as non-string input or one separator type.
- 1: Partial cleaning or partial check-digit logic, but rejects/accepts several valid cases incorrectly.
- 0: Stub, hard-coded outputs, syntax errors, or behaviour unrelated to the prompt.
EOT
cat > tasks/tier1-check-code/grading/solution_notes.md <<'EOT'
# Reference solution notes

Check the input type, trim, remove `[ ._-]`, uppercase, validate `/^[A-Z0-9]{8}$/`, map the first seven characters to values, apply weights `[3,7,1,3,7,1,3]`, and compare `String(sum % 10)` with the final character.

The starting workspace was verified to fail the hidden tests. Applying the reference approach makes the hidden tests pass.
EOT

mkdir -p tasks/tier2-stock-snapshot/workspace/src tasks/tier2-stock-snapshot/grading/hidden_tests
cat > tasks/tier2-stock-snapshot/PROMPT.md <<'EOT'
# Task: Fix stock snapshot reporting

This workspace contains a tiny stock movement reporter.

Update the implementation so `buildStockSnapshot(movements)` in `src/report.js` returns a deterministic stock snapshot grouped by SKU.

Movement records have this shape:

```js
{ sku: 'A-100', type: 'receive' | 'ship' | 'return' | 'adjust', qty: number, reason?: string }
```

Rules:

- Ignore records with `qty` equal to `0`.
- `receive` increases on-hand quantity.
- `ship` decreases on-hand quantity.
- `return` increases on-hand quantity unless `reason === 'damaged'`.
- A damaged return does not increase on-hand quantity, but it must increase `damagedReturns` for that SKU.
- `adjust` adds `qty` directly. Adjustments may be positive or negative.
- Each SKU summary must be `{ sku, onHand, damagedReturns }`.
- Return an array sorted by SKU ascending.
- Do not mutate the input movement objects.

Keep the public API names unchanged. When you are done, the project's tests should pass.
EOT
cat > tasks/tier2-stock-snapshot/meta.json <<'EOT'
{"id":"tier2-stock-snapshot","tier":2,"title":"Fix stock snapshot reporting","language":"node","time_cap_min":15,"turn_cap":30,"setup_cmd":"","grade_cmd":"node --test \"_grading/**/*.test.js\"","public_tests":false}
EOT
cat > tasks/tier2-stock-snapshot/workspace/src/movements.js <<'EOT'
function applyMovement(current, movement) {
  if (movement.type === 'receive') return current + movement.qty;
  if (movement.type === 'ship') return current - movement.qty;
  if (movement.type === 'return') return current + movement.qty;
  return current;
}
module.exports = { applyMovement };
EOT
cat > tasks/tier2-stock-snapshot/workspace/src/report.js <<'EOT'
const { applyMovement } = require('./movements.js');
function buildStockSnapshot(movements) {
  const bySku = new Map();
  for (const movement of movements) {
    const current = bySku.get(movement.sku) || { sku: movement.sku, onHand: 0 };
    current.onHand = applyMovement(current.onHand, movement);
    bySku.set(movement.sku, current);
  }
  return Array.from(bySku.values());
}
module.exports = { buildStockSnapshot };
EOT
cat > tasks/tier2-stock-snapshot/grading/hidden_tests/stockSnapshot.test.js <<'EOT'
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildStockSnapshot } = require('../src/report.js');
test('builds sorted summaries with all movement types', () => {
  assert.deepEqual(buildStockSnapshot([
    { sku: 'B-200', type: 'receive', qty: 5 },
    { sku: 'A-100', type: 'receive', qty: 10 },
    { sku: 'A-100', type: 'ship', qty: 3 },
    { sku: 'A-100', type: 'return', qty: 2 },
    { sku: 'A-100', type: 'return', qty: 4, reason: 'damaged' },
    { sku: 'B-200', type: 'adjust', qty: -2 },
    { sku: 'C-300', type: 'adjust', qty: 7 }
  ]), [
    { sku: 'A-100', onHand: 9, damagedReturns: 4 },
    { sku: 'B-200', onHand: 3, damagedReturns: 0 },
    { sku: 'C-300', onHand: 7, damagedReturns: 0 }
  ]);
});
test('ignores zero quantity and does not mutate input records', () => {
  const movements = [
    { sku: 'Z-900', type: 'receive', qty: 1 },
    { sku: 'Z-900', type: 'ship', qty: 0 },
    { sku: 'Z-900', type: 'return', qty: 0, reason: 'damaged' }
  ];
  const before = JSON.stringify(movements);
  assert.deepEqual(buildStockSnapshot(movements), [{ sku: 'Z-900', onHand: 1, damagedReturns: 0 }]);
  assert.equal(JSON.stringify(movements), before);
});
EOT
cat > tasks/tier2-stock-snapshot/grading/rubric.md <<'EOT'
# Quality rubric

- 3: Correct grouped snapshot; supports all movement types, zero-quantity filtering, damaged return accounting, sorting, and no mutation.
- 2: Correct core quantity logic but misses sorting, zero-quantity handling, or damaged return totals.
- 1: Handles only receives/ships or produces unstable/incomplete summary objects.
- 0: Broken API, syntax errors, hard-coded output, or no meaningful implementation.
EOT
cat > tasks/tier2-stock-snapshot/grading/solution_notes.md <<'EOT'
# Reference solution notes

Initialise each SKU as `{ sku, onHand: 0, damagedReturns: 0 }`; skip zero-quantity movements; damaged returns add only to `damagedReturns`; adjustments add `qty`; final values are sorted by SKU.

The starting workspace was verified to fail the hidden tests. Applying the reference approach makes the hidden tests pass.
EOT

mkdir -p tasks/tier3-rate-policy/workspace/src tasks/tier3-rate-policy/grading/hidden_tests
cat > tasks/tier3-rate-policy/PROMPT.md <<'EOT'
# Task: Add centralised rate policy support

This workspace contains a small quote engine used by two call sites: basket checkout and renewal previews.

Add support for account-specific rate policies while preserving the existing module exports.

A policy object has this shape:

```js
{
  accountType: 'standard' | 'partner' | 'staff',
  handlingOverridePence?: number
}
```

Required behaviour:

- Add a central policy-aware rate calculation used by both `checkoutQuote` and `renewalPreview`.
- Existing callers without a policy must behave as `standard` accounts.
- Base item subtotal remains the sum of `unitPence * qty`.
- Base handling remains the current handling calculation unless `handlingOverridePence` is a finite number, in which case use that value exactly.
- Discounts apply to the item subtotal only, never to handling:
  - `standard`: no discount.
  - `partner`: 8% discount.
  - `staff`: 20% discount.
- Discounts are rounded down to whole pence.
- Totals must remain integers in pence.
- `checkoutQuote(items, policy)` must return `{ subtotalPence, discountPence, handlingPence, totalPence }`.
- `renewalPreview(plan, months, policy)` must return `{ subtotalPence, discountPence, handlingPence, totalPence, months }`.

Do not add external dependencies. Keep the project CommonJS-based. When you are done, the project's tests should pass.
EOT
cat > tasks/tier3-rate-policy/meta.json <<'EOT'
{"id":"tier3-rate-policy","tier":3,"title":"Add centralised account rate policy support","language":"node","time_cap_min":20,"turn_cap":35,"setup_cmd":"","grade_cmd":"node --test \"_grading/**/*.test.js\"","public_tests":false}
EOT
cat > tasks/tier3-rate-policy/workspace/src/rates.js <<'EOT'
function itemSubtotal(items) {
  return items.reduce((sum, item) => sum + item.unitPence * item.qty, 0);
}
function handlingForSubtotal(subtotalPence) {
  if (subtotalPence >= 10000) return 0;
  if (subtotalPence >= 5000) return 299;
  return 499;
}
module.exports = { itemSubtotal, handlingForSubtotal };
EOT
cat > tasks/tier3-rate-policy/workspace/src/checkout.js <<'EOT'
const { itemSubtotal, handlingForSubtotal } = require('./rates.js');
function checkoutQuote(items) {
  const subtotalPence = itemSubtotal(items);
  const handlingPence = handlingForSubtotal(subtotalPence);
  return { subtotalPence, discountPence: 0, handlingPence, totalPence: subtotalPence + handlingPence };
}
module.exports = { checkoutQuote };
EOT
cat > tasks/tier3-rate-policy/workspace/src/renewal.js <<'EOT'
const { itemSubtotal, handlingForSubtotal } = require('./rates.js');
function renewalPreview(plan, months) {
  const subtotalPence = itemSubtotal([{ unitPence: plan.monthlyPence, qty: months }]);
  const handlingPence = handlingForSubtotal(subtotalPence);
  return { subtotalPence, discountPence: 0, handlingPence, totalPence: subtotalPence + handlingPence, months };
}
module.exports = { renewalPreview };
EOT
cat > tasks/tier3-rate-policy/grading/hidden_tests/ratePolicy.test.js <<'EOT'
const test = require('node:test');
const assert = require('node:assert/strict');
const { checkoutQuote } = require('../src/checkout.js');
const { renewalPreview } = require('../src/renewal.js');
test('checkoutQuote applies partner discounts to subtotal only', () => {
  assert.deepEqual(checkoutQuote([{ sku: 'INK', unitPence: 1299, qty: 3 }, { sku: 'PAPER', unitPence: 550, qty: 2 }], { accountType: 'partner' }), {
    subtotalPence: 4997, discountPence: 399, handlingPence: 499, totalPence: 5097
  });
});
test('renewalPreview uses the same staff policy and supports handling override', () => {
  assert.deepEqual(renewalPreview({ code: 'CARE', monthlyPence: 2500 }, 5, { accountType: 'staff', handlingOverridePence: 123 }), {
    subtotalPence: 12500, discountPence: 2500, handlingPence: 123, totalPence: 10123, months: 5
  });
});
test('missing policy behaves as standard and invalid override is ignored', () => {
  assert.deepEqual(checkoutQuote([{ sku: 'BOX', unitPence: 5000, qty: 1 }]), { subtotalPence: 5000, discountPence: 0, handlingPence: 299, totalPence: 5299 });
  assert.deepEqual(renewalPreview({ monthlyPence: 3000 }, 1, { accountType: 'standard', handlingOverridePence: Number.NaN }), { subtotalPence: 3000, discountPence: 0, handlingPence: 499, totalPence: 3499, months: 1 });
});
EOT
cat > tasks/tier3-rate-policy/grading/rubric.md <<'EOT'
# Quality rubric

- 3: Centralised policy calculation used by both call sites; preserves old behaviour; handles discounts, rounding, and overrides exactly.
- 2: Correct in both call sites but with duplicated policy logic or a minor edge-case issue.
- 1: Implements policy in only one call site or applies discounts to the wrong base.
- 0: Broken exports, syntax errors, hard-coded outputs, or no meaningful policy support.
EOT
cat > tasks/tier3-rate-policy/grading/solution_notes.md <<'EOT'
# Reference solution notes

Add a `calculateRate(items, policy = {})` helper in `rates.js`. Derive subtotal, choose discount rate from `policy.accountType`, calculate `Math.floor(subtotalPence * rate)`, choose handling from a finite override or `handlingForSubtotal`, and return the four common fields. Both call sites should use it.

The starting workspace was verified to fail the hidden tests. Applying the reference approach makes the hidden tests pass.
EOT

mkdir -p tasks/tier4-cooldown-calendar/workspace/src tasks/tier4-cooldown-calendar/grading/hidden_tests
cat > tasks/tier4-cooldown-calendar/PROMPT.md <<'EOT'
# Task: Diagnose and fix cooldown calendar blocking

This workspace contains a small maintenance scheduler. It converts job records into minute-based blocked windows for a given engineer and day.

A production bug has been reported: some blocked windows are wrong when the same engineer is queried across multiple days, especially for jobs that cross midnight. The issue is in the implementation, not in the input data.

Fix the scheduler so `blockedWindowsForDay(jobs, engineerId, day)` returns the correct blocked windows.

Definitions:

- `day` is a string in `YYYY-MM-DD` format.
- Job times are local ISO-like strings in `YYYY-MM-DDTHH:mm` format.
- A job belongs to exactly one engineer via `engineerId`.
- A job blocks time from `start` until `end`, plus a cooldown after `end`.
- Cooldown minutes come from `cooldownMinutes` on the job, or `15` when missing.
- The returned windows are clipped to the requested day.
- Minutes are measured from the start of the requested day, so midnight is `0` and the end of the day is `1440`.
- End minute is exclusive.
- Touching or overlapping windows must be merged.
- Return windows as `{ startMinute, endMinute }` sorted ascending.
- Repeated calls with the same inputs must be independent of call order.

Do not add dependencies. Keep the public API unchanged. When you are done, the project's tests should pass.
EOT
cat > tasks/tier4-cooldown-calendar/meta.json <<'EOT'
{"id":"tier4-cooldown-calendar","tier":4,"title":"Diagnose cooldown calendar blocking across days","language":"node","time_cap_min":30,"turn_cap":40,"setup_cmd":"","grade_cmd":"node --test \"_grading/**/*.test.js\"","public_tests":false}
EOT
cat > tasks/tier4-cooldown-calendar/workspace/src/time.js <<'EOT'
function parseStamp(stamp) {
  const [date, time] = stamp.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return { year, month, day, hour, minute };
}
function dayIndex(date) {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}
function minuteOffsetFromDay(stamp, day) {
  const p = parseStamp(stamp);
  const stampDay = Date.UTC(p.year, p.month - 1, p.day) / 86400000;
  return (stampDay - dayIndex(day)) * 1440 + p.hour * 60 + p.minute;
}
module.exports = { minuteOffsetFromDay };
EOT
cat > tasks/tier4-cooldown-calendar/workspace/src/windows.js <<'EOT'
function clipWindow(window) {
  window.startMinute = Math.max(0, window.startMinute);
  window.endMinute = Math.min(1440, window.endMinute);
  if (window.startMinute > window.endMinute) return null;
  return window;
}
function mergeWindows(windows) {
  const clipped = windows.map(clipWindow).filter(Boolean).sort((a, b) => a.startMinute - b.startMinute);
  const merged = [];
  for (const window of clipped) {
    const last = merged[merged.length - 1];
    if (last && window.startMinute <= last.endMinute) last.endMinute = Math.max(last.endMinute, window.endMinute);
    else merged.push(window);
  }
  return merged;
}
module.exports = { mergeWindows };
EOT
cat > tasks/tier4-cooldown-calendar/workspace/src/scheduler.js <<'EOT'
const { minuteOffsetFromDay } = require('./time.js');
const { mergeWindows } = require('./windows.js');
const memo = new Map();
function blockedWindowsForDay(jobs, engineerId, day) {
  const cacheKey = engineerId;
  if (memo.has(cacheKey)) return memo.get(cacheKey);
  const raw = [];
  for (const job of jobs) {
    if (job.engineerId !== engineerId) continue;
    const startMinute = minuteOffsetFromDay(job.start, day);
    const endMinute = minuteOffsetFromDay(job.end, day) + (job.cooldownMinutes || 15);
    raw.push({ startMinute, endMinute });
  }
  const merged = mergeWindows(raw);
  memo.set(cacheKey, merged);
  return merged;
}
module.exports = { blockedWindowsForDay };
EOT
cat > tasks/tier4-cooldown-calendar/grading/hidden_tests/cooldownCalendar.test.js <<'EOT'
const test = require('node:test');
const assert = require('node:assert/strict');
const { blockedWindowsForDay } = require('../src/scheduler.js');
const jobs = [
  { id: 'alpha', engineerId: 'eng-1', start: '2026-03-04T23:30', end: '2026-03-05T00:20', cooldownMinutes: 20 },
  { id: 'bravo', engineerId: 'eng-1', start: '2026-03-05T09:00', end: '2026-03-05T09:30' },
  { id: 'charlie', engineerId: 'eng-1', start: '2026-03-05T09:45', end: '2026-03-05T10:00', cooldownMinutes: 0 },
  { id: 'delta', engineerId: 'eng-2', start: '2026-03-05T08:00', end: '2026-03-05T18:00', cooldownMinutes: 60 },
  { id: 'echo', engineerId: 'eng-1', start: '2026-03-06T00:00', end: '2026-03-06T00:10', cooldownMinutes: 5 }
];
test('clips cross-midnight jobs and merges touching cooldown windows', () => {
  assert.deepEqual(blockedWindowsForDay(jobs, 'eng-1', '2026-03-05'), [{ startMinute: 0, endMinute: 40 }, { startMinute: 540, endMinute: 600 }]);
});
test('query order must not change results for the same engineer on different days', () => {
  assert.deepEqual(blockedWindowsForDay(jobs, 'eng-1', '2026-03-04'), [{ startMinute: 1410, endMinute: 1440 }]);
  assert.deepEqual(blockedWindowsForDay(jobs, 'eng-1', '2026-03-06'), [{ startMinute: 0, endMinute: 15 }]);
});
test('excludes zero-length clipped windows and preserves engineer filtering', () => {
  assert.deepEqual(blockedWindowsForDay(jobs, 'eng-2', '2026-03-05'), [{ startMinute: 480, endMinute: 1140 }]);
  assert.deepEqual(blockedWindowsForDay(jobs, 'missing', '2026-03-05'), []);
});
EOT
cat > tasks/tier4-cooldown-calendar/grading/rubric.md <<'EOT'
# Quality rubric

- 3: Correctly fixes day-sensitive caching/order dependence, midnight clipping, cooldown defaults including zero, empty clipped windows, merging, sorting, and engineer filtering.
- 2: Correct primary bug and cross-midnight behaviour, with one minor edge-case miss.
- 1: Fixes only obvious clipping or only the cache issue, leaving important failures.
- 0: Hard-coded output, broken API, syntax errors, or no meaningful investigation.
EOT
cat > tasks/tier4-cooldown-calendar/grading/solution_notes.md <<'EOT'
# Reference solution notes

There are three intended traps. First, `scheduler.js` caches by engineer only, so querying one day poisons later calls for another day. Remove memoisation, or include day and job data in the key and return defensive copies. Second, `job.cooldownMinutes || 15` treats explicit `0` as missing; use `job.cooldownMinutes ?? 15`. Third, `clipWindow` mutates objects and keeps zero-length or fully outside windows because it checks `start > end`; create a new clipped object and reject `start >= end`.

The starting workspace was verified to fail the hidden tests. Applying the reference approach makes the hidden tests pass.
EOT

printf '%s\n' 'Generated 4 benchmark tasks under tasks/.'
