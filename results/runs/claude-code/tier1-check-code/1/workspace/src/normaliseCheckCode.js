function normaliseCheckCode(input) {
  if (typeof input !== "string") return null;

  const cleaned = input.trim().replace(/[ \-_.]/g, "").toUpperCase();

  if (cleaned.length !== 8) return null;
  if (!/^[A-Z0-9]{8}$/.test(cleaned)) return null;

  const weights = [3, 7, 1, 3, 7, 1, 3];
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const ch = cleaned[i];
    const value = ch >= "0" && ch <= "9"
      ? ch.charCodeAt(0) - "0".charCodeAt(0)
      : ch.charCodeAt(0) - "A".charCodeAt(0) + 10;
    sum += value * weights[i];
  }

  const expected = String(sum % 10);
  return cleaned[7] === expected ? cleaned : null;
}
module.exports = { normaliseCheckCode };
