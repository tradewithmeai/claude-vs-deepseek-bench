#!/usr/bin/env node
// Resumability + usage-limit recovery. Compares the planned run matrix against
// what's actually committed under results/runs/, and prints DONE vs PENDING so a
// run interrupted by a usage limit can resume exactly where it stopped.
//
//   node runner/status.mjs                      # uses results/RUNPLAN.json
//   node runner/status.mjs --plan <file.json>
//
// RUNPLAN.json shape:
//   { "arms": ["claude-code","opencode-free","opencode-deepseek-chat"],
//     "tasks": ["tier1-...","tier2-...","tier3-...","tier4-..."],
//     "reps":  { "_default": 1, "tier3-...": 3 } }
//
// An attempt counts as DONE when results/runs/<arm>/<task>/<rep>/metrics.json exists.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? def : process.argv[i + 1];
}

const planPath = arg("plan", "results/RUNPLAN.json");
if (!existsSync(planPath)) {
  console.error(`No run plan at ${planPath}. Create it (see runner/status.mjs header).`);
  process.exit(1);
}
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const reps = (task) => plan.reps?.[task] ?? plan.reps?._default ?? 1;
const done = (arm, task, rep) => existsSync(join("results", "runs", arm, task, String(rep), "metrics.json"));

let total = 0, complete = 0;
const pending = [];
for (const arm of plan.arms) {
  for (const task of plan.tasks) {
    for (let rep = 1; rep <= reps(task); rep++) {
      total++;
      if (done(arm, task, rep)) complete++;
      else pending.push(`${arm}  ${task}  rep ${rep}`);
    }
  }
}

console.log(`\nProgress: ${complete}/${total} attempts committed  (${total - complete} pending)\n`);
if (pending.length) {
  console.log("PENDING (resume from here):");
  for (const p of pending) console.log(`  - ${p}`);
} else {
  console.log("All planned attempts are committed. Ready to analyze + judge.");
}
console.log("");
