const { itemSubtotal, handlingForSubtotal, quoteForItems } = require('./rates.js');
function renewalPreview(plan, months, policy) {
  const quote = quoteForItems([{ unitPence: plan.monthlyPence, qty: months }], policy);
  return { ...quote, months };
}
module.exports = { renewalPreview };
