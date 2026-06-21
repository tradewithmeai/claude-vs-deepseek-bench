function clipWindow(window) {
  const startMinute = Math.max(0, window.startMinute);
  const endMinute = Math.min(1440, window.endMinute);
  if (startMinute >= endMinute) return null;
  return { startMinute, endMinute };
}
function mergeWindows(windows) {
  const clipped = windows.map(clipWindow).filter(Boolean).sort((a, b) => a.startMinute - b.startMinute);
  const merged = [];
  for (const window of clipped) {
    const last = merged[merged.length - 1];
    if (last && window.startMinute <= last.endMinute) last.endMinute = Math.max(last.endMinute, window.endMinute);
    else merged.push({ ...window });
  }
  return merged;
}
module.exports = { mergeWindows };
