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
