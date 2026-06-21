const { itemSubtotal, quoteFromSubtotal } = require('./rates.js');
function renewalPreview(plan, months, policy) {
  const subtotalPence = itemSubtotal([{ unitPence: plan.monthlyPence, qty: months }]);
  const quote = quoteFromSubtotal(subtotalPence, policy);
  return { ...quote, months };
}
module.exports = { renewalPreview };
