# Quality rubric

- 3: Centralised policy calculation used by both call sites; preserves old behaviour; handles discounts, rounding, and overrides exactly.
- 2: Correct in both call sites but with duplicated policy logic or a minor edge-case issue.
- 1: Implements policy in only one call site or applies discounts to the wrong base.
- 0: Broken exports, syntax errors, hard-coded outputs, or no meaningful policy support.
