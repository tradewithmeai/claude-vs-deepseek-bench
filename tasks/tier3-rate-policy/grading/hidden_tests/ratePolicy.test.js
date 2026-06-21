const test = require('node:test');
const assert = require('node:assert/strict');
const { checkoutQuote } = require('../src/checkout.js');
const { renewalPreview } = require('../src/renewal.js');
test('checkoutQuote applies partner discounts to subtotal only', () => {
  assert.deepEqual(checkoutQuote([{ sku: 'INK', unitPence: 1299, qty: 3 }, { sku: 'PAPER', unitPence: 550, qty: 2 }], { accountType: 'partner' }), {
    subtotalPence: 4997, discountPence: 399, handlingPence: 499, totalPence: 5097
  });
});
test('renewalPreview uses the same staff policy and supports handling override', () => {
  assert.deepEqual(renewalPreview({ code: 'CARE', monthlyPence: 2500 }, 5, { accountType: 'staff', handlingOverridePence: 123 }), {
    subtotalPence: 12500, discountPence: 2500, handlingPence: 123, totalPence: 10123, months: 5
  });
});
test('missing policy behaves as standard and invalid override is ignored', () => {
  assert.deepEqual(checkoutQuote([{ sku: 'BOX', unitPence: 5000, qty: 1 }]), { subtotalPence: 5000, discountPence: 0, handlingPence: 299, totalPence: 5299 });
  assert.deepEqual(renewalPreview({ monthlyPence: 3000 }, 1, { accountType: 'standard', handlingOverridePence: Number.NaN }), { subtotalPence: 3000, discountPence: 0, handlingPence: 499, totalPence: 3499, months: 1 });
});
