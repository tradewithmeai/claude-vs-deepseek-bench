# Task: Add centralised rate policy support

This workspace contains a small quote engine used by two call sites: basket checkout and renewal previews.

Add support for account-specific rate policies while preserving the existing module exports.

A policy object has this shape:

```js
{
  accountType: 'standard' | 'partner' | 'staff',
  handlingOverridePence?: number
}
```

Required behaviour:

- Add a central policy-aware rate calculation used by both `checkoutQuote` and `renewalPreview`.
- Existing callers without a policy must behave as `standard` accounts.
- Base item subtotal remains the sum of `unitPence * qty`.
- Base handling remains the current handling calculation unless `handlingOverridePence` is a finite number, in which case use that value exactly.
- Discounts apply to the item subtotal only, never to handling:
  - `standard`: no discount.
  - `partner`: 8% discount.
  - `staff`: 20% discount.
- Discounts are rounded down to whole pence.
- Totals must remain integers in pence.
- `checkoutQuote(items, policy)` must return `{ subtotalPence, discountPence, handlingPence, totalPence }`.
- `renewalPreview(plan, months, policy)` must return `{ subtotalPence, discountPence, handlingPence, totalPence, months }`.

Do not add external dependencies. Keep the project CommonJS-based. When you are done, the project's tests should pass.
