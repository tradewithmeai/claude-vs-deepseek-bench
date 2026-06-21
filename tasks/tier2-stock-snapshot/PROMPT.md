# Task: Fix stock snapshot reporting

This workspace contains a tiny stock movement reporter.

Update the implementation so `buildStockSnapshot(movements)` in `src/report.js` returns a deterministic stock snapshot grouped by SKU.

Movement records have this shape:

```js
{ sku: 'A-100', type: 'receive' | 'ship' | 'return' | 'adjust', qty: number, reason?: string }
```

Rules:

- Ignore records with `qty` equal to `0`.
- `receive` increases on-hand quantity.
- `ship` decreases on-hand quantity.
- `return` increases on-hand quantity unless `reason === 'damaged'`.
- A damaged return does not increase on-hand quantity, but it must increase `damagedReturns` for that SKU.
- `adjust` adds `qty` directly. Adjustments may be positive or negative.
- Each SKU summary must be `{ sku, onHand, damagedReturns }`.
- Return an array sorted by SKU ascending.
- Do not mutate the input movement objects.

Keep the public API names unchanged. When you are done, the project's tests should pass.
