# Task specification (for the task author)

Every task is a self-contained directory under `tasks/<task_id>/`. `task_id` convention: `tier<N>-<slug>` (e.g. `tier3-extract-cache`).

## Directory layout

```
tasks/<task_id>/
  PROMPT.md            # AGENT-FACING. The only thing the contestant sees. No solution hints, no test leakage.
  meta.json            # machine-readable config (schema below)
  workspace/           # the code the agent edits. A clean, runnable starting state. GIVEN to the agent.
  grading/             # JUDGE-ONLY. Never shown to the agent.
    hidden_tests/      # deterministic tests that decide pass/fail. Authoritative.
    reference/         # REQUIRED. The correct source files (same relative paths as workspace/).
                       #   Overlaying these on workspace/ MUST make hidden_tests pass. Enables mechanical GREEN proof.
    public_tests/      # (optional) acceptance tests the agent MAY be shown as part of the spec.
    rubric.md          # 0–3 quality rubric for the judge (secondary metric).
    solution_notes.md  # prose explanation of the fix (companion to grading/reference/).
```

## Anti-drift requirements (MANDATORY — these are how tasks get rejected)

The benchmark is worthless if `PROMPT.md` and the hidden tests disagree. An author that hand-writes expected test values without executing them WILL drift. To prevent it:

1. **Ship a real reference solution as code** in `grading/reference/`, not just prose. Prose cannot be executed; code can.
2. **Every expected value in a test must be derivable by running `grading/reference/`** on that input. Do not invent expected values — compute them from the reference behaviour.
3. **Spec ↔ test consistency invariant:** every literal used in the tests must satisfy *every* rule stated in `PROMPT.md`. (Real failure caught in review: a spec said "exactly 8 characters" while the test's valid inputs were 8→7 chars after cleaning and the "wrong length" case was 8 chars — mutually contradictory.) For each test case, the author must be able to point to the rule(s) it exercises.
4. **Mechanical RED→GREEN gate:** the task is only accepted if `node runner/verify-task.mjs --task tasks/<id>` reports `OK` — i.e. the starting `workspace/` fails the hidden tests (RED) and `workspace/` + `grading/reference/` passes them (GREEN). Author claims of "verified" are ignored; only this command counts.
5. **One language, declared runtime:** keep all tasks in the same stack. If using CommonJS (`require`/`module.exports`), do not also add a `package.json` with `"type":"module"` (and vice-versa) — the hidden tests must load the workspace under the same module system the stub uses.

## The public / hidden test rule

- **Hidden tests are kept out of `workspace/`** so the agent cannot read them and hard-code outputs. The grader (`runner/grade.mjs`) copies them in *after* the agent finishes.
- If you want the agent to see acceptance criteria, put those in `grading/public_tests/` and reference them from `PROMPT.md` — but keep a **separate** held-out set in `hidden_tests/` that actually scores the run.
- `red → green` requirement: the **starting `workspace/` must FAIL** the hidden tests, and the reference solution in `solution_notes.md` must make them PASS.

## meta.json schema

```json
{
  "id": "tier1-slugify",
  "tier": 1,
  "title": "Implement a URL slugifier",
  "language": "node",
  "time_cap_min": 10,
  "turn_cap": 25,
  "setup_cmd": "",
  "grade_cmd": "node --test \"_grading/**/*.test.js\"",
  "public_tests": false
}
```

- **language** — keep ONE stack across all tasks for uniform grading (default: `node` with the built-in `node:test`; or `python` with `pytest`). Zero external dependencies preferred so grading is fast and hermetic.
- **setup_cmd** — optional, run once in the attempt copy before grading (e.g. `npm install`). Leave empty if no deps.
- **grade_cmd** — run by the grader after hidden tests are placed in `_grading/` inside the attempt workspace. Must exit 0 iff the task is solved. For `node`, use the glob form `node --test "_grading/**/*.test.js"` (passing a bare directory to `node --test` is not portable across Node versions). For `python`, e.g. `python -m pytest _grading -q`.

## Authoring constraints (anti-contamination & fairness)

- Use **novel, original** code. Do not lift well-known OSS files, famous interview problems verbatim, or public benchmark issues — contestants may have memorised them.
- Tests must be **deterministic**, offline, and fast (< 60s total per task).
- `PROMPT.md` states the goal unambiguously but reveals neither the solution nor the hidden tests.
- Difficulty must match the tier definition (see top-level `README.md`). Tier 4 must require genuine investigation (e.g. a subtle planted bug spanning multiple files), not just more typing.
