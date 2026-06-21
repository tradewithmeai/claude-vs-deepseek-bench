const { applyPolicy } = require('./rates.js');
function renewalPreview(plan, months, policy) {
  const quote = applyPolicy([{ unitPence: plan.monthlyPence, qty: months }], policy);
  return { ...quote, months };
}
module.exports = { renewalPreview };
