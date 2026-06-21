# Revision request — fix task drift before we run the benchmark

Paste this to ChatGPT (the task author) along with the repo URL. It explains what failed independent verification and the **exact, non-negotiable requirements** for the corrected task set.

---

We ran an **independent RED→GREEN verification** of your `tasks/generate_tasks.sh` (we implemented each task's reference solution and executed your exact hidden-test assertions). Results:

| Task | Result |
|---|---|
| `tier1-check-code` | ❌ **REJECTED — spec/test contradiction** |
| `tier2-stock-snapshot` | ✅ passes |
| `tier3-rate-policy` | ✅ passes |
| `tier4-cooldown-calendar` | ✅ passes (well constructed) |

Your `solution_notes.md` files each claim "verified to fail/pass", but nothing was executed — that's the root problem. **Tiers 2–4 happen to be correct; Tier 1 is not.**

## The Tier 1 defect (concrete)

`PROMPT.md` states the canonical code is **"exactly 8 characters"** with the check digit computed from **"the first 7 characters"**. But your hidden tests are inconsistent with that:

- `' ab-12.cd5 '` cleans to `AB12CD5` — **7 characters** — yet the test expects it returned as valid.
- `'q9_x7_zm5'` cleans to `Q9X7ZM5` — **7 characters** — also expected valid.
- `'AB12CD55'` is **8 characters** — yet the test expects `null` and labels it "wrong length".

So a solution that follows `PROMPT.md` (require 8 chars) returns `null` for your "valid" inputs and fails. The only way to pass your tests is to ignore the spec — which is the exact drift this benchmark must not contain. (For the record, the check-digit arithmetic in the prose also does not reproduce `5` as the final digit of `AB12CD5` under any consistent reading.)

**Fix:** make the spec and the tests agree on a single, self-consistent rule set — pick a length (e.g. 7 *or* 8), state precisely which leading characters feed the check digit, and ensure the weight vector length matches. Then derive the test expected values by *running* the reference solution, not by hand.

## Exact requirements for the corrected task set (ALL tasks)

1. **Ship a runnable reference solution as code** in `grading/reference/` for every task — the corrected source files, at the same relative paths as `workspace/`. Prose in `solution_notes.md` is a companion, not a substitute.
2. **Derive every expected test value by executing `grading/reference/`** on the input. Do not hand-author expected values. In your reply, for each test case, show the step-by-step trace from input → reference behaviour → expected output.
3. **Spec ↔ test consistency:** every literal in a test must satisfy *every* rule in that task's `PROMPT.md`. For each test case, name the rule(s) it exercises. No rule may contradict any test.
4. **Pass the mechanical gate:** each task must make `node runner/verify-task.mjs --task tasks/<id>` print `OK` — meaning the starting `workspace/` FAILS the hidden tests (RED) and `workspace/` + `grading/reference/` PASSES them (GREEN). We will run `node runner/verify-task.mjs --all`; any `BAD` is rejected. We trust the tool, not the claim.
5. **Module system:** these tasks use CommonJS (`require`/`module.exports`) with no `package.json` in the workspace. Keep that consistent — do not add `"type":"module"`. Hidden tests and stub must load under the same system.
6. **Keep tiers 2–4 logic as-is** (they verified clean) but add the now-required `grading/reference/` directory to each so they also pass `verify-task.mjs`.

## Deliverable

An updated `tasks/generate_tasks.sh` that (a) fixes Tier 1 into a self-consistent task, and (b) adds `grading/reference/` to all four tasks. Plus the per-test traces from requirement #2. We will run `verify-task.mjs --all` and only proceed when every task reports `OK`.
