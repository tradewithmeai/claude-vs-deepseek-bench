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
