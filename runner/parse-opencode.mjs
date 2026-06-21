#!/usr/bin/env node
// Turn an OpenCode run's raw JSON events (run.jsonl) + rawmeta.json into a
// metrics.json matching PROTOCOL.md §7. Sums cost and output tokens across all
// step_finish events; input_tokens = max per-step input (context size); turns =
// count of step_finish events.
//
//   node runner/parse-opencode.mjs --dir results/runs/<arm>/<task>/<rep>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

const dir = arg("dir");
if (!dir) { console.error("Usage: node runner/parse-opencode.mjs --dir <attemptDir>"); process.exit(2); }

const raw = JSON.parse(readFileSync(join(dir, "rawmeta.json"), "utf8"));
const jsonlPath = join(dir, "run.jsonl");

let cost = 0, outTok = 0, inTokMax = 0, totTok = 0, steps = 0, sawAny = false;
if (existsSync(jsonlPath)) {
  for (const line of readFileSync(jsonlPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let ev;
    try { ev = JSON.parse(t); } catch { continue; }
    sawAny = true;
    if (ev.type === "step_finish" && ev.part) {
      steps++;
      if (typeof ev.part.cost === "number") cost += ev.part.cost;
      const tk = ev.part.tokens;
      if (tk) {
        outTok += tk.output ?? 0;
        totTok += tk.total ?? 0;
        if ((tk.input ?? 0) > inTokMax) inTokMax = tk.input;
      }
    }
  }
}

const metrics = {
  task_id: raw.task,
  tier: raw.tier,
  arm: raw.arm,
  rep: raw.rep,
  wall_clock_s: raw.wall_clock_s,
  input_tokens: inTokMax,
  output_tokens: outTok,
  cost_usd: Number(cost.toFixed(6)),
  turns: steps,
  interventions: 0,
  cap_hit: !!raw.cap_hit,
  notes: `opencode arm; model=${raw.model}; total_tokens=${totTok}; ${sawAny ? "" : "NO JSON EVENTS (run produced no output) "}${raw.cap_hit ? "cap_hit " : ""}`.trim(),
};

writeFileSync(join(dir, "metrics.json"), JSON.stringify(metrics, null, 2));
console.log(`parsed ${raw.arm}/${raw.task}/${raw.rep}: cost $${metrics.cost_usd}, out ${outTok} tok, ${steps} steps, wall ${raw.wall_clock_s}s${raw.cap_hit ? " [CAP HIT]" : ""}`);
