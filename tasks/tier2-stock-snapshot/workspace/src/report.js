const { applyMovement } = require('./movements.js');
function buildStockSnapshot(movements) {
  const bySku = new Map();
  for (const movement of movements) {
    const current = bySku.get(movement.sku) || { sku: movement.sku, onHand: 0 };
    current.onHand = applyMovement(current.onHand, movement);
    bySku.set(movement.sku, current);
  }
  return Array.from(bySku.values());
}
module.exports = { buildStockSnapshot };
