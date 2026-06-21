# Prompt: ChatGPT as independent TASK & TEST author

Copy everything below the line into ChatGPT. Replace `{REPO_URL}`, `{STACK}`, and `{N_PER_TIER}` first.

- `{REPO_URL}` — the public GitHub repo URL (e.g. `https://github.com/<you>/coding-agent-benchmark`).
- `{STACK}` — one language for ALL tasks: `node` (built-in `node:test`, zero deps — recommended) or `python` (`pytest`).
- `{N_PER_TIER}` — tasks per tier. `1` for the pilot (4 tasks total), `3` for the full run (12 tasks).

---

You are an **independent task author** for a benchmark that compares AI coding agents. You are **not** a contestant — agents (Claude Code, and OpenCode running various models) will solve the tasks you write. Your job is to produce a fair, contamination-resistant, objectively-gradable task set. Neutrality is paramount: write tasks that a competent agent of any brand could solve; never tune them toward or against any tool.

## Step 1 — Read the framework

Read this repository, top to bottom, so your output matches its conventions exactly:

{REPO_URL}

Pay special attention to:
- `README.md` — the arms, the tier definitions (Tier 1 Trivial → Tier 4 Complex), and the hypotheses being tested.
- `tasks/README.md` — the **exact directory layout, the meta.json schema, and the public/hidden test rule**.
- `tasks/EXAMPLE-tier1-slugify/` — a complete worked example. Mirror its structure (PROMPT.md, meta.json, workspace/, grading/{hidden_tests,rubric.md,solution_notes.md}).
- `PROTOCOL.md` — how runs are executed and graded, so your `grade_cmd` and caps are realistic.

## Step 2 — Author the tasks

Produce **{N_PER_TIER} task(s) per tier**, tiers 1–4, all in `{STACK}`. For each task create the full directory per `tasks/README.md`:

- `PROMPT.md` — agent-facing. Unambiguous goal; **no solution hints; no reference to the hidden tests.** Harness-neutral wording.
- `meta.json` — per schema (`id` = `tier<N>-<slug>`, correct `tier`, `language`, caps, `setup_cmd`, `grade_cmd`).
- `workspace/` — a clean, runnable starting state the agent edits.
- `grading/hidden_tests/` — deterministic, offline, fast (< 60s) tests that decide pass/fail.
- `grading/rubric.md` — a 0–3 quality rubric.
- `grading/solution_notes.md` — a reference solution + rationale.

### Tier requirements (must genuinely differ in difficulty)

- **Tier 1 — Trivial:** one well-specified function, greenfield.
- **Tier 2 — Simple:** a small feature touching 1–2 existing files; clear spec.
- **Tier 3 — Moderate:** multi-file change requiring the agent to read and understand existing code (e.g. a refactor that must keep behaviour, or adding a layer that several call sites use).
- **Tier 4 — Complex:** requires real investigation — e.g. a **subtle bug planted across multiple files** producing a wrong/intermittent result, where the fix is non-obvious and naive guesses fail. Not "more typing"; genuine reasoning.

### Hard constraints

1. **Anti-contamination:** original, novel code and problems. Do **not** reuse famous OSS files, classic interview questions verbatim, or public benchmark issues. Invent domain details.
2. **Determinism:** no network, no clocks/randomness in test outcomes, stable across machines.
3. **Red → green:** the starting `workspace/` MUST FAIL the hidden tests; your `solution_notes.md` solution MUST make them pass. State that you verified this.
4. **Hidden tests stay hidden:** they live only in `grading/hidden_tests/`, never in `workspace/`. If you also write `public_tests`, keep a separate held-out set in `hidden_tests` that truly scores the run.
5. **Uniform stack:** every task in `{STACK}`, zero (or minimal, pinned) external dependencies.
6. **Self-contained:** solvable from `workspace/` + `PROMPT.md` alone.

## Step 3 — Deliver

Output a single POSIX shell script named `tasks/generate_tasks.sh` that, when run from the repo root, creates **every** file for every task you authored (use heredocs). After it, give a short markdown table: `task_id | tier | one-line summary | grade_cmd`.

The operator will run your script, then `node runner/grade.mjs --task tasks/<id> --attempt tasks/<id>/workspace` to confirm each starts RED, apply your reference solution, and confirm it turns GREEN — before any contestant runs.

## Self-check before answering

- [ ] Each tier's difficulty matches its definition (Tier 4 needs investigation, not volume).
- [ ] Every task: starting workspace fails hidden tests; reference solution passes them.
- [ ] No solution hints in PROMPT.md; no hidden tests inside workspace/.
- [ ] All tasks in `{STACK}`; deterministic; offline; < 60s.
- [ ] File layout and meta.json exactly match `tasks/README.md`.
