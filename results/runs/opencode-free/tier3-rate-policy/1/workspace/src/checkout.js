const { calculateRate } = require('./rates.js');
function checkoutQuote(items, policy) {
  return calculateRate(items, policy);
}
module.exports = { checkoutQuote };
