const { applyMovement, isDamagedReturn } = require('./movements.js');

function buildStockSnapshot(movements) {
  const bySku = new Map();
  for (const movement of movements) {
    if (movement.qty === 0) continue;
    const current =
      bySku.get(movement.sku) || { sku: movement.sku, onHand: 0, damagedReturns: 0 };
    current.onHand = applyMovement(current.onHand, movement);
    if (isDamagedReturn(movement)) {
      current.damagedReturns += movement.qty;
    }
    bySku.set(movement.sku, current);
  }
  return Array.from(bySku.values()).sort((a, b) =>
    a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0
  );
}

module.exports = { buildStockSnapshot };
