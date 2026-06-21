function applyMovement(current, movement) {
  if (movement.type === 'receive') return current + movement.qty;
  if (movement.type === 'ship') return current - movement.qty;
  if (movement.type === 'return') return current + movement.qty;
  return current;
}
module.exports = { applyMovement };
