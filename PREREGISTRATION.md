# Pre-registration

**Locked on:** _fill date when the first run starts_
**Do not edit any threshold below after the first attempt is recorded.** Changes after that invalidate the experiment; instead, append a dated note under "Amendments".

## Operator's stated priors (the beliefs under test)

The operator predicted, before building this benchmark:

1. The free model will succeed at **most simple tasks with little difference** vs Claude Code.
2. OpenCode arms will be **slower**.
3. The free model will **struggle as soon as it hits something complex**.

## Falsifiable hypotheses

| ID | Statement | Supported if | Disproved if |
|---|---|---|---|
| **H1** Parity on simple | `opencode-free` matches `claude-code` on Tier 1–2 | pass-rate gap ≤ 10 percentage points | gap > 10pp |
| **H2** Slower | OpenCode arms take longer | median wall-clock(OpenCode arms) ≥ 1.3 × median(claude-code) on shared tasks | ratio < 1.3 |
| **H3** Complexity cliff | free degrades sharply with complexity | `opencode-free` Tier-4 pass rate < 50% of its own Tier-1 pass rate **AND** (claude-code − free) gap increases monotonically across tiers 1→4 | either condition fails |
| **H4** Paid lift | paying for DeepSeek helps, mostly when hard | `opencode-deepseek-chat` pass rate ≥ `opencode-free` + 15pp, with the largest lift at Tier 3–4 | lift < 15pp or no tier concentration |

## Decision rules

- **pass** is binary, set by the task's hidden tests via `runner/grade.mjs`. No partial credit toward `pass`.
- A run that hits the time cap or turn cap **before declaring done** = `pass = 0`.
- Quality rubric (0–3) is **secondary**; it never overrides the test-based `pass`.
- Flaky test → re-run the grader up to 3×; majority decides.
- "Monotonic" in H3 tolerates ties (non-decreasing gap counts as monotonic).

## Inconclusive conditions

A hypothesis is **inconclusive** (not supported, not disproved) if the relevant cell has < 2 successful *or* < 2 failed runs total to compare, i.e. not enough signal. Report it as such; do not force a verdict.

## Amendments

_(append dated notes here only; never edit the tables above after start)_
