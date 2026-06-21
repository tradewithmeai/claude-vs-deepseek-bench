function applyMovement(current, movement) {
  if (movement.type === 'receive') return current + movement.qty;
  if (movement.type === 'ship') return current - movement.qty;
  if (movement.type === 'return') {
    if (movement.reason === 'damaged') return current;
    return current + movement.qty;
  }
  if (movement.type === 'adjust') return current + movement.qty;
  return current;
}

function isDamagedReturn(movement) {
  return movement.type === 'return' && movement.reason === 'damaged';
}

module.exports = { applyMovement, isDamagedReturn };
