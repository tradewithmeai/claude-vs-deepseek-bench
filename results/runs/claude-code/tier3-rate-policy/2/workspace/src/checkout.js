const { itemSubtotal, handlingForSubtotal, quoteForItems } = require('./rates.js');
function checkoutQuote(items, policy) {
  return quoteForItems(items, policy);
}
module.exports = { checkoutQuote };
