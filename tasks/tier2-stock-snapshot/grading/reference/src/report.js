const { applyMovement } = require('./movements.js');
function buildStockSnapshot(movements) {
  const bySku = new Map();
  for (const movement of movements) {
    if (movement.qty === 0) continue;
    const current = bySku.get(movement.sku) || { sku: movement.sku, onHand: 0, damagedReturns: 0 };
    if (movement.type === 'return' && movement.reason === 'damaged') current.damagedReturns += movement.qty;
    current.onHand = applyMovement(current.onHand, movement);
    bySku.set(movement.sku, current);
  }
  return Array.from(bySku.values()).sort((a, b) => a.sku.localeCompare(b.sku));
}
module.exports = { buildStockSnapshot };
