# Quality rubric

- 3: Correctly fixes day-sensitive caching/order dependence, midnight clipping, cooldown defaults including zero, empty clipped windows, merging, sorting, and engineer filtering.
- 2: Correct primary bug and cross-midnight behaviour, with one minor edge-case miss.
- 1: Fixes only obvious clipping or only the cache issue, leaving important failures.
- 0: Hard-coded output, broken API, syntax errors, or no meaningful investigation.
