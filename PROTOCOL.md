# Protocol (binding rules for the operator)

The validity of the experiment depends on these being followed identically for every arm.

## 1. Identical inputs

- Each arm gets the **exact same `PROMPT.md`**, verbatim. No rephrasing, no extra hints, no per-model coaching.
- Hand the agent **only the task's `workspace/`** directory. The `grading/` directory (hidden tests, rubric, solution notes) must never be in the agent's working directory or context.

## 2. Clean slate

- Before every run (and every rep), the agent starts from a pristine copy of `workspace/`.
- Copy it out: `cp -r tasks/<id>/workspace results/runs/<arm>/<id>/<rep>/workspace` and point the agent at that copy. Never let the agent edit the canonical `tasks/<id>/workspace`.

## 3. Matched autonomy

- Configure both tools to the **same permission posture**. Recommended: both auto-approve file edits and shell commands so neither is throttled by a human clicking "approve". If you prefer manual approval, apply it to both equally.
- Disable any tool one arm has and the other lacks if it would skew the task (e.g. web access) — keep tasks self-contained so this doesn't arise.

## 4. Intervention policy

- **Primary metric — autonomous, zero nudges.** Give the prompt once. Do not answer questions, correct mistakes, or steer. Score whatever it produces when it declares done or hits a cap.
- **Secondary (optional) — assisted.** A separate pass may allow up to **2** corrective nudges; record `interventions` = count. Keep assisted runs in separate reps; don't mix into the autonomous number.

## 5. Caps (failure if exceeded before "done")

- Use the per-task caps in `meta.json` (`time_cap_min`, `turn_cap`). Defaults if absent: Tier 1 = 10 min, Tier 2 = 15, Tier 3 = 20, Tier 4 = 30; turn cap 25–40.
- Hitting a cap before the agent declares completion ⇒ `pass = 0`, note `cap_hit`.

## 6. Replication

- LLMs are stochastic. Minimum **3 reps** on Tier 3 (where the cliff is most likely and variance highest). 1–2 reps elsewhere for the pilot; add reps to any cell where arms are within ~15pp.

## 7. Recording a run

After each attempt, create `results/runs/<arm>/<task_id>/<rep>/` containing:

- `workspace/` — the agent's final state (what it produced).
- `metrics.json` — see schema below.
- (after grading) `grade.json` — written by `runner/grade.mjs`.

`metrics.json` schema:

```json
{
  "task_id": "tier1-slugify",
  "tier": 1,
  "arm": "opencode-free",
  "rep": 1,
  "wall_clock_s": 142,
  "input_tokens": 18234,
  "output_tokens": 3120,
  "cost_usd": 0,
  "turns": 7,
  "interventions": 0,
  "cap_hit": false,
  "notes": "free model; declared done on its own"
}
```

Where to read each field:
- **wall_clock_s** — wall time from first prompt to the agent declaring done (use a stopwatch or shell `time`).
- **input/output_tokens, cost_usd** — Claude Code: `/cost`. OpenCode: `opencode stats`. DeepSeek paid: provider dashboard. Free arm cost = 0 (still record tokens if available).
- **turns** — count of agent ⇄ tool round-trips (approx is fine; be consistent).

Then append the same data to the scorecard:

```
node runner/record.mjs --from results/runs/<arm>/<task_id>/<rep>/metrics.json --grade results/runs/<arm>/<task_id>/<rep>/grade.json
```

## 8. Grading (objective gate)

```
node runner/grade.mjs --task tasks/<task_id> --attempt results/runs/<arm>/<task_id>/<rep>/workspace
```

This copies the task's **hidden tests** against the agent's workspace, runs the task's `grade_cmd`, and writes `grade.json` with `pass` (exit code 0) + output tail. The judge (ChatGPT) reviews these plus the quality rubric.

## 9. Commit discipline

Commit after authoring tasks, after each batch of runs, and after grading — so ChatGPT (author/judge) always reads a consistent `main`. Keep secrets (API keys) out of every commit.
