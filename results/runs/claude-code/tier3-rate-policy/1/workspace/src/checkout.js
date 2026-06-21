const { applyPolicy } = require('./rates.js');
function checkoutQuote(items, policy) {
  return applyPolicy(items, policy);
}
module.exports = { checkoutQuote };
