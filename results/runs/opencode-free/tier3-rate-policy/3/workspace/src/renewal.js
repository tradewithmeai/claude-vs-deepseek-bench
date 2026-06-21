const { calculateRate } = require('./rates.js');
function renewalPreview(plan, months, policy) {
  return { ...calculateRate([{ unitPence: plan.monthlyPence, qty: months }], policy), months };
}
module.exports = { renewalPreview };
