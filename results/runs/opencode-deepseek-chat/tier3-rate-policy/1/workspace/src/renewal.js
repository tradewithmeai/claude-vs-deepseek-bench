const { itemSubtotal, handlingForSubtotal } = require('./rates.js');
const { discountFor } = require('./policy.js');
function renewalPreview(plan, months, options) {
  const accountType = options && options.accountType;
  const subtotalPence = itemSubtotal([{ unitPence: plan.monthlyPence, qty: months }]);
  const discountPence = discountFor(subtotalPence, accountType);
  let handlingPence = handlingForSubtotal(subtotalPence);
  if (options && typeof options.handlingOverridePence === 'number' && !Number.isNaN(options.handlingOverridePence)) {
    handlingPence = options.handlingOverridePence;
  }
  return { subtotalPence, discountPence, handlingPence, totalPence: subtotalPence - discountPence + handlingPence, months };
}
module.exports = { renewalPreview };
