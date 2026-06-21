const { itemSubtotal, quoteFromSubtotal } = require('./rates.js');
function checkoutQuote(items, policy) {
  const subtotalPence = itemSubtotal(items);
  return quoteFromSubtotal(subtotalPence, policy);
}
module.exports = { checkoutQuote };
