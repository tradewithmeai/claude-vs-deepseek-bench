function itemSubtotal(items) {
  return items.reduce((sum, item) => sum + item.unitPence * item.qty, 0);
}
function handlingForSubtotal(subtotalPence) {
  if (subtotalPence >= 10000) return 0;
  if (subtotalPence >= 5000) return 299;
  return 499;
}

const DISCOUNT_RATES = {
  standard: 0,
  partner: 0.08,
  staff: 0.2,
};

function discountForSubtotal(subtotalPence, accountType) {
  const rate = DISCOUNT_RATES[accountType] || 0;
  return Math.floor(subtotalPence * rate);
}

// Central policy-aware rate calculation used by both checkout and renewal.
function quoteForItems(items, policy) {
  const accountType = (policy && policy.accountType) || 'standard';
  const subtotalPence = itemSubtotal(items);

  const override = policy && policy.handlingOverridePence;
  const handlingPence = Number.isFinite(override)
    ? override
    : handlingForSubtotal(subtotalPence);

  const discountPence = discountForSubtotal(subtotalPence, accountType);
  const totalPence = subtotalPence - discountPence + handlingPence;

  return { subtotalPence, discountPence, handlingPence, totalPence };
}

module.exports = { itemSubtotal, handlingForSubtotal, discountForSubtotal, quoteForItems };
