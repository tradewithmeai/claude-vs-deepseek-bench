const ACCOUNT_RATES = {
  partner: { discountFraction: 0.08 },
  staff: { discountFraction: 0.20 },
};

function discountFor(subtotalPence, accountType) {
  const rate = ACCOUNT_RATES[accountType];
  if (!rate) return 0;
  return Math.floor(subtotalPence * rate.discountFraction);
}

module.exports = { ACCOUNT_RATES, discountFor };
