const RATE_TIERS = [
  { minPence: 10000, handlingPence: 0 },
  { minPence: 5000, handlingPence: 299 },
  { minPence: 0, handlingPence: 499 },
];

function itemSubtotal(items) {
  return items.reduce((sum, item) => sum + item.unitPence * item.qty, 0);
}
function handlingForSubtotal(subtotalPence) {
  const tier = RATE_TIERS.find(t => subtotalPence >= t.minPence);
  return tier ? tier.handlingPence : RATE_TIERS[RATE_TIERS.length - 1].handlingPence;
}
module.exports = { RATE_TIERS, itemSubtotal, handlingForSubtotal };
