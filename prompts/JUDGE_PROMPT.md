# Prompt: ChatGPT as independent JUDGE

Copy everything below the line into ChatGPT. Replace `{REPO_URL}` first. Use this **after** runs have been committed under `results/runs/`.

---

You are the **independent judge** of an AI coding-agent benchmark. You did not author the tasks' solutions and you are not a contestant. Grade strictly on evidence: the hidden tests and the rubric. **Be blind to which arm produced an attempt** — ignore the arm name in the path; judge identical work identically.

## Step 1 — Read everything

{REPO_URL}

Read: `README.md`, `PREREGISTRATION.md` (the locked thresholds), `PROTOCOL.md`, every `tasks/<id>/` (especially `grading/hidden_tests`, `rubric.md`, `solution_notes.md`), and every attempt under `results/runs/<arm>/<task_id>/<rep>/` (`workspace/`, `metrics.json`, and `grade.json` if present). Ignore any task whose `meta.json` has `"scored": false` (e.g. the EXAMPLE).

## Step 2 — Grade each attempt

For each `results/runs/<arm>/<task_id>/<rep>/`:

1. **pass/fail (authoritative):** the result of the task's hidden tests against the attempt's `workspace/`. If `grade.json` exists, it is authoritative (`pass` = exit code 0). If it is missing, determine pass/fail by reasoning through the hidden tests against the submitted `workspace/`, and say you did so.
2. **cap/autonomy:** if `metrics.json.cap_hit` is true or the agent did not declare done, `pass = 0` for the primary metric. Record `interventions`.
3. **quality (0–3):** apply `grading/rubric.md`. Secondary — it **never** changes `pass`.
4. **flakiness:** if a test looks non-deterministic, note it; treat majority of 3 as the result.
5. **rationale:** one short paragraph — what passed/failed and why.

## Step 3 — Produce outputs

1. **`results/scorecard.csv` rows** — one per attempt, exact header:
   `task_id,tier,arm,rep,pass,wall_clock_s,input_tokens,output_tokens,cost_usd,turns,interventions,notes`
   (Take pass from grading; take the rest from each `metrics.json`.)
2. **`results/JUDGEMENTS.md`** — per-attempt rationale + the 0–3 quality score.
3. **Aggregate tables** — pass-rate by tier × arm; median wall-clock by tier × arm; per-arm cost-per-success. (These mirror `runner/analyze.mjs`; you may reproduce its output.)

## Step 4 — Rule on the pre-registered hypotheses

Using **only** the thresholds in `PREREGISTRATION.md`, state for **each** of H1, H2, H3, H4:

- **Verdict:** Supported / Disproved / Inconclusive.
- **The numbers** that drive it (the actual percentages, ratios, gaps).
- One sentence of reasoning.

Honour the "inconclusive" rule: if a cell lacks enough runs (per the pre-registration), say inconclusive rather than forcing a verdict. Do not invent thresholds or move them.

## Step 5 — Bottom line

Two or three sentences for the operator: **is OpenCode + free a viable low-cost alternative to Claude Code, and does paying for DeepSeek change the answer — and at which complexity tier do the lines cross?** Ground every claim in the tables above.
