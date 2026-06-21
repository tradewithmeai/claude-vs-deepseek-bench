const { minuteOffsetFromDay } = require('./time.js');
const { mergeWindows } = require('./windows.js');
const memo = new Map();
function blockedWindowsForDay(jobs, engineerId, day) {
  const cacheKey = `${engineerId}::${day}`;
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
