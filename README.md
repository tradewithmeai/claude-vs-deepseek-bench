# coding-agent-benchmark

A neutral, **test-gated** benchmark to answer one practical question:

> Is **OpenCode + a cheap/free model** a viable low-cost alternative to **Claude Code** for real coding work — and where (if anywhere) does paying for **DeepSeek** earn its keep?

## Why this repo exists / who does what

The integrity of the comparison depends on **the contestants not setting or grading their own exam**.

| Role | Who | Why |
|---|---|---|
| **Framework author** | (this repo) | Neutral plumbing only — no tasks, no tests, no grading logic that favours anyone. |
| **Task & test author** | **ChatGPT** (independent) | Writes the actual tasks + hidden tests. Not a contestant. See [`prompts/TASK_AUTHOR_PROMPT.md`](prompts/TASK_AUTHOR_PROMPT.md). |
| **Judge** | **ChatGPT** (independent) | Runs hidden tests, scores quality, fills the scorecard, rules on the hypotheses. See [`prompts/JUDGE_PROMPT.md`](prompts/JUDGE_PROMPT.md). |
| **Contestants** | Claude Code · OpenCode+free · OpenCode+DeepSeek | Solve tasks. Never author or grade. |
| **Operator** | You (the human) | Drives each contestant on each task, records metrics, commits results. |

Everything lives on `main` of a public GitHub repo so ChatGPT can read the whole thing from a URL.

## The arms (conditions compared)

All OpenCode arms use the **official** OpenCode (`sst/opencode`, npm `opencode-ai`) — **not** the meme fork — so the catalog and harness are stock. Select the model per run with `opencode run --model <id> "<prompt>"` or `/models` in the TUI.

| Arm id | Stack | OpenCode model id | Cost |
|---|---|---|---|
| `claude-code` | Claude Code (reference) | — | paid |
| `opencode-free` | OpenCode + free model | `opencode/deepseek-v4-flash-free` | $0 |
| `opencode-deepseek-chat` | OpenCode + DeepSeek (paid) | `deepseek/deepseek-chat` | cheap |
| `opencode-deepseek-reasoner` | OpenCode + DeepSeek reasoner (optional) | `deepseek/deepseek-reasoner` | cheap+ |
| `opencode-claude` | OpenCode + Claude via API key (**optional isolation arm**) | `anthropic/claude-*` | paid |

Pick **one** free model for the `opencode-free` arm and keep it fixed across all runs. Other free options in the catalog: `opencode/mimo-v2.5-free`, `opencode/north-mini-code-free`, `opencode/nemotron-3-ultra-free`. Credentials: `opencode auth login` → DeepSeek (paste key) for the paid arm; `opencode auth login` → opencode for the free gateway models.

> **Confound note:** `claude-code` vs `opencode-*` mixes *harness* and *model*. The optional `opencode-claude` arm isolates the harness: comparing it to `claude-code` shows the harness gap; comparing it to `opencode-deepseek-*` shows the model gap. Without it, this is a **product** comparison (still valid), not a clean *model* comparison.

## The independent variable: a task ladder

Complexity is what we vary. Every task is gated by a hidden test suite that must go **red → green**.

| Tier | Definition |
|---|---|
| **1 Trivial** | Single function, fully specified, greenfield. |
| **2 Simple** | One–two files, clear spec, touches existing code. |
| **3 Moderate** | Multi-file; must read/understand existing code; refactor. |
| **4 Complex** | Non-obvious debugging or cross-cutting feature in unfamiliar code (planted subtle bug). |

Task layout and the public/hidden-test convention: [`tasks/README.md`](tasks/README.md).
A fully-worked, harness-self-test example: [`tasks/EXAMPLE-tier1-slugify/`](tasks/EXAMPLE-tier1-slugify) (authored by the framework as a plumbing test — **excluded from scoring**; delete or ignore once real tasks exist).

## Pre-registered hypotheses

Locked **before** any runs — see [`PREREGISTRATION.md`](PREREGISTRATION.md). Summary:

- **H1 — Parity on simple:** free ≈ Claude Code on Tier 1–2 (gap ≤ 10pp).
- **H2 — Slower:** OpenCode arms median wall-clock ≥ 1.3× Claude Code.
- **H3 — Complexity cliff:** free Tier-4 pass rate < 50% of its own Tier-1 rate, and the free-vs-Claude gap widens with tier.
- **H4 — Paid lift:** DeepSeek-chat beats free by ≥ 15pp, concentrated at Tier 3–4.

## Metrics (one row per run → `results/scorecard.csv`)

`task_id, tier, arm, rep, pass, wall_clock_s, input_tokens, output_tokens, cost_usd, turns, interventions, notes`

- **pass** — decided by hidden tests (`runner/grade.mjs`), not opinion.
- **cost_usd** — recorded from each tool's own reporting (Claude Code `/cost`; OpenCode `opencode stats`; DeepSeek dashboard). Free = 0.
- Headline output: **cost-per-success** = total $ ÷ tasks passed, per tier.

## Workflow end to end

1. **Framework** committed to `main` (this repo). ✅
2. **ChatGPT authors tasks**: give it [`prompts/TASK_AUTHOR_PROMPT.md`](prompts/TASK_AUTHOR_PROMPT.md) + the repo URL. It returns a generator script; you run it and commit the tasks.
3. **Operator runs attempts**: for each (task × arm × rep), follow [`PROTOCOL.md`](PROTOCOL.md). Reset workspace, run the agent autonomously under the time/turn cap, save its final `workspace/` and a `metrics.json` under `results/runs/<arm>/<task_id>/<rep>/`, commit.
4. **Grade**: `node runner/grade.mjs --task tasks/<id> --attempt results/runs/<arm>/<id>/<rep>/workspace` → writes `grade.json`. Commit.
5. **ChatGPT judges**: give it [`prompts/JUDGE_PROMPT.md`](prompts/JUDGE_PROMPT.md) + the repo URL. It fills the scorecard, writes rationales, and rules each hypothesis supported/disproved/inconclusive.
6. **Analyze**: `node runner/analyze.mjs` prints pass-rate-by-tier, cost-per-success, and the cliff table.

## Running an attempt (operator checklist)

See [`PROTOCOL.md`](PROTOCOL.md) for the binding rules. The short version:

- Same verbatim `PROMPT.md` to every arm. No hints, no per-model tuning.
- Hand the agent **only** the task's `workspace/` (never `grading/`).
- Match autonomy across tools (both auto-approve edits, or both ask).
- Primary metric = fully autonomous, **zero nudges**; stop at the time/turn cap (cap hit = fail).
- ≥ 3 reps on Tier 3 (highest variance); 1–2 elsewhere for the pilot.

## Scope

- **Pilot:** 4 tiers × 1 task × 3 arms × 1 rep = 12 runs (~1–2 h). Usually already shows the cliff.
- **Full:** add tasks and reps where arms are close.
