#!/usr/bin/env node
// Append one row to results/scorecard.csv from a metrics.json (+ optional grade.json).
//
// Usage:
//   node runner/record.mjs --from <metrics.json> [--grade <grade.json>] [--csv results/scorecard.csv]

import { readFileSync, appendFileSync, existsSync, writeFileSync } from "node:fs";

function arg(name, def = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const HEADER =
  "task_id,tier,arm,rep,pass,wall_clock_s,input_tokens,output_tokens,cost_usd,turns,interventions,notes";

const fromPath = arg("from");
if (!fromPath) {
  console.error("Usage: node runner/record.mjs --from <metrics.json> [--grade <grade.json>] [--csv <file>]");
  process.exit(2);
}

const m = JSON.parse(readFileSync(fromPath, "utf8"));
let pass = m.pass;
const gradePath = arg("grade");
if (gradePath && existsSync(gradePath)) {
  pass = JSON.parse(readFileSync(gradePath, "utf8")).pass;
}
if (pass === undefined) {
  console.error("No pass value (provide --grade <grade.json> or include pass in metrics.json)");
  process.exit(2);
}

function esc(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const row = [
  m.task_id, m.tier, m.arm, m.rep, pass ? 1 : 0,
  m.wall_clock_s ?? "", m.input_tokens ?? "", m.output_tokens ?? "",
  m.cost_usd ?? "", m.turns ?? "", m.interventions ?? "",
  m.cap_hit ? `cap_hit; ${m.notes ?? ""}` : (m.notes ?? ""),
].map(esc).join(",");

const csv = typeof arg("csv") === "string" ? arg("csv") : "results/scorecard.csv";
if (!existsSync(csv)) writeFileSync(csv, HEADER + "\n");
appendFileSync(csv, row + "\n");
console.log(`recorded: ${m.arm} / ${m.task_id} / rep ${m.rep} -> ${csv}`);
