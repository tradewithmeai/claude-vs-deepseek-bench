const { itemSubtotal, handlingForSubtotal } = require('./rates.js');
function checkoutQuote(items) {
  const subtotalPence = itemSubtotal(items);
  const handlingPence = handlingForSubtotal(subtotalPence);
  return { subtotalPence, discountPence: 0, handlingPence, totalPence: subtotalPence + handlingPence };
}
module.exports = { checkoutQuote };
