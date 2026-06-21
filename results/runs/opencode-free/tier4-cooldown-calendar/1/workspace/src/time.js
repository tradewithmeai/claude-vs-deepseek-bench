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
