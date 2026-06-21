function applyMovement(current, movement) {
  if (movement.qty === 0) return current;
  if (movement.type === 'receive') return current + movement.qty;
  if (movement.type === 'ship') return current - movement.qty;
  if (movement.type === 'return' && movement.reason === 'damaged') return current;
  if (movement.type === 'return') return current + movement.qty;
  if (movement.type === 'adjust') return current + movement.qty;
  return current;
}
module.exports = { applyMovement };
