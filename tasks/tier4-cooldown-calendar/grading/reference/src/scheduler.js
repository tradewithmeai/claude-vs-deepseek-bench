const { minuteOffsetFromDay } = require('./time.js');
const { mergeWindows } = require('./windows.js');
function blockedWindowsForDay(jobs, engineerId, day) {
  const raw = [];
  for (const job of jobs) {
    if (job.engineerId !== engineerId) continue;
    const startMinute = minuteOffsetFromDay(job.start, day);
    const endMinute = minuteOffsetFromDay(job.end, day) + (job.cooldownMinutes ?? 15);
    raw.push({ startMinute, endMinute });
  }
  return mergeWindows(raw);
}
module.exports = { blockedWindowsForDay };
