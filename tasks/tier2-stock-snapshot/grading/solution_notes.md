# Reference solution notes

The executable reference solution is in `grading/reference/src/`.

It initialises each SKU as `{ sku, onHand: 0, damagedReturns: 0 }`; skips zero-quantity movements; adds damaged returns only to `damagedReturns`; applies adjustments directly; and sorts final values by SKU.
