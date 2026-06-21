const { itemSubtotal, handlingForSubtotal } = require('./rates.js');
function renewalPreview(plan, months) {
  const subtotalPence = itemSubtotal([{ unitPence: plan.monthlyPence, qty: months }]);
  const handlingPence = handlingForSubtotal(subtotalPence);
  return { subtotalPence, discountPence: 0, handlingPence, totalPence: subtotalPence + handlingPence, months };
}
module.exports = { renewalPreview };
