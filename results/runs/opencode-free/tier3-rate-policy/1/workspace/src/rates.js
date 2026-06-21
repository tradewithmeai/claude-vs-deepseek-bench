function itemSubtotal(items) {
  return items.reduce((sum, item) => sum + item.unitPence * item.qty, 0);
}
function handlingForSubtotal(subtotalPence) {
  if (subtotalPence >= 10000) return 0;
  if (subtotalPence >= 5000) return 299;
  return 499;
}
function discountRateFor(accountType) {
  if (accountType === 'partner') return 0.08;
  if (accountType === 'staff') return 0.20;
  return 0;
}
function calculateRate(items, policy = {}) {
  const subtotalPence = itemSubtotal(items);
  const discountPence = Math.floor(subtotalPence * discountRateFor(policy.accountType));
  const handlingPence = Number.isFinite(policy.handlingOverridePence) ? policy.handlingOverridePence : handlingForSubtotal(subtotalPence);
  return { subtotalPence, discountPence, handlingPence, totalPence: subtotalPence - discountPence + handlingPence };
}
module.exports = { itemSubtotal, handlingForSubtotal, calculateRate };
