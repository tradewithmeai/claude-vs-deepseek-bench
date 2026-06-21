function charValue(ch) {
  if (/\d/.test(ch)) return Number(ch);
  return ch.charCodeAt(0) - 55;
}

function normaliseCheckCode(input) {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim().replace(/[\s._-]+/g, '').toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(cleaned)) return null;
  const weights = [3, 7, 1, 3, 7, 1, 3];
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += charValue(cleaned[i]) * weights[i];
  return cleaned[7] === String(sum % 10) ? cleaned : null;
}

module.exports = { normaliseCheckCode };
