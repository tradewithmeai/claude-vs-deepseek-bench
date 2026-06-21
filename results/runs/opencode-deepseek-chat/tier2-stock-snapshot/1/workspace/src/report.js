const { applyMovement } = require('./movements.js');
function buildStockSnapshot(movements) {
  const bySku = new Map();
  for (const movement of movements) {
    if (!bySku.has(movement.sku)) {
      bySku.set(movement.sku, { sku: movement.sku, onHand: 0, damagedReturns: 0 });
    }
    const current = bySku.get(movement.sku);
    current.onHand = applyMovement(current.onHand, movement);
    if (movement.type === 'return' && movement.reason === 'damaged' && movement.qty !== 0) {
      current.damagedReturns += movement.qty;
    }
  }
  return Array.from(bySku.values()).sort((a, b) => a.sku.localeCompare(b.sku));
}
module.exports = { buildStockSnapshot };
