const { minuteOffsetFromDay } = require('./time.js');
const { mergeWindows } = require('./windows.js');

function blockedWindowsForDay(jobs, engineerId, day) {
  const raw = [];
  for (const job of jobs) {
    if (job.engineerId !== engineerId) continue;
    const cooldown = job.cooldownMinutes == null ? 15 : job.cooldownMinutes;
    const startMinute = minuteOffsetFromDay(job.start, day);
    const endMinute = minuteOffsetFromDay(job.end, day) + cooldown;
    raw.push({ startMinute, endMinute });
  }
  return mergeWindows(raw);
}

module.exports = { blockedWindowsForDay };
