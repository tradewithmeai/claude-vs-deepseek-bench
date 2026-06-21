const HANDLING_RATE_POLICY = [
  { threshold: 10000, fee: 0 },
  { threshold: 5000, fee: 299 },
  { threshold: 0, fee: 499 },
];

function itemSubtotal(items) {
  return items.reduce((sum, item) => sum + item.unitPence * item.qty, 0);
}
function handlingForSubtotal(subtotalPence) {
  const tier = HANDLING_RATE_POLICY.find(t => subtotalPence >= t.threshold);
  return tier ? tier.fee : 499;
}
module.exports = { HANDLING_RATE_POLICY, itemSubtotal, handlingForSubtotal };
