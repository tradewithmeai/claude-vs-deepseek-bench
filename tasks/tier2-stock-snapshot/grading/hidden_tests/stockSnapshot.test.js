const test = require('node:test');
const assert = require('node:assert/strict');
const { buildStockSnapshot } = require('../src/report.js');
test('builds sorted summaries with all movement types', () => {
  assert.deepEqual(buildStockSnapshot([
    { sku: 'B-200', type: 'receive', qty: 5 },
    { sku: 'A-100', type: 'receive', qty: 10 },
    { sku: 'A-100', type: 'ship', qty: 3 },
    { sku: 'A-100', type: 'return', qty: 2 },
    { sku: 'A-100', type: 'return', qty: 4, reason: 'damaged' },
    { sku: 'B-200', type: 'adjust', qty: -2 },
    { sku: 'C-300', type: 'adjust', qty: 7 }
  ]), [
    { sku: 'A-100', onHand: 9, damagedReturns: 4 },
    { sku: 'B-200', onHand: 3, damagedReturns: 0 },
    { sku: 'C-300', onHand: 7, damagedReturns: 0 }
  ]);
});
test('ignores zero quantity and does not mutate input records', () => {
  const movements = [
    { sku: 'Z-900', type: 'receive', qty: 1 },
    { sku: 'Z-900', type: 'ship', qty: 0 },
    { sku: 'Z-900', type: 'return', qty: 0, reason: 'damaged' }
  ];
  const before = JSON.stringify(movements);
  assert.deepEqual(buildStockSnapshot(movements), [{ sku: 'Z-900', onHand: 1, damagedReturns: 0 }]);
  assert.equal(JSON.stringify(movements), before);
});
