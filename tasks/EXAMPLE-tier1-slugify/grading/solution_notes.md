# Reference solution — EXAMPLE task

A correct, minimal implementation that passes all hidden tests:

```js
export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // any run of non-alphanumerics -> single hyphen
    .replace(/^-+|-+$/g, "");     // strip leading/trailing hyphens
}
```

Why it satisfies the rules:
- `toLowerCase()` — lower-cases.
- `[^a-z0-9]+` with the `+` quantifier collapses runs (whitespace, punctuation, multiple hyphens) into one `-`.
- The trailing `replace` removes edge hyphens, which also yields `""` for all-separator input.

Acceptance: `node --test` against `grading/hidden_tests` exits 0.
