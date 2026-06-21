const RATE_TIERS = [
  { min: 10000, handling: 0 },
  { min: 5000, handling: 299 },
  { min: 0, handling: 499 },
];

function itemSubtotal(items) {
  return items.reduce((sum, item) => sum + item.unitPence * item.qty, 0);
}
function handlingForSubtotal(subtotalPence) {
  const tier = RATE_TIERS.find(t => subtotalPence >= t.min);
  return tier ? tier.handling : RATE_TIERS[RATE_TIERS.length - 1].handling;
}
module.exports = { RATE_TIERS, itemSubtotal, handlingForSubtotal };
