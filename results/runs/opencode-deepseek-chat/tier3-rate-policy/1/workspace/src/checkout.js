const { itemSubtotal, handlingForSubtotal } = require('./rates.js');
const { discountFor } = require('./policy.js');
function checkoutQuote(items, options) {
  const accountType = options && options.accountType;
  const subtotalPence = itemSubtotal(items);
  const discountPence = discountFor(subtotalPence, accountType);
  const handlingPence = handlingForSubtotal(subtotalPence);
  return { subtotalPence, discountPence, handlingPence, totalPence: subtotalPence - discountPence + handlingPence };
}
module.exports = { checkoutQuote };
