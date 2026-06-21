# Reference solution notes

The executable reference solution is in `grading/reference/src/`.

It adds `calculateRate(items, policy = {})` in `rates.js`. It derives subtotal, chooses discount rate from `policy.accountType`, calculates `Math.floor(subtotalPence * rate)`, chooses handling from a finite override or `handlingForSubtotal`, and returns the four common fields. Both call sites use it.
