#!/usr/bin/env node
// Aggregate results/scorecard.csv into the tables that decide the hypotheses.
//
// Usage: node runner/analyze.mjs [--csv results/scorecard.csv]

import { readFileSync, existsSync } from "node:fs";

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? def : process.argv[i + 1];
}

const csv = arg("csv", "results/scorecard.csv");
if (!existsSync(csv)) {
  console.error(`No scorecard at ${csv}. Record some runs first.`);
  process.exit(1);
}

// Minimal CSV parse (handles quoted fields).
const lines = readFileSync(csv, "utf8").trim().split("\n");
const header = lines.shift().split(",");
const rows = lines.filter(Boolean).map((line) => {
  const cells = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { cells.push(cur); cur = ""; }
    else cur += c;
  }
  cells.push(cur);
  return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
});

const arms = [...new Set(rows.map((r) => r.arm))].sort();
const tiers = [...new Set(rows.map((r) => Number(r.tier)))].sort((a, b) => a - b);
const num = (v) => (v === "" || v == null ? null : Number(v));
const pct = (x) => (x == null ? "  -  " : `${(x * 100).toFixed(0)}%`.padStart(5));

function cell(filter) {
  const subset = rows.filter(filter);
  if (!subset.length) return { n: 0 };
  const passes = subset.filter((r) => r.pass === "1").length;
  const walls = subset.map((r) => num(r.wall_clock_s)).filter((v) => v != null);
  const cost = subset.map((r) => num(r.cost_usd) ?? 0).reduce((a, b) => a + b, 0);
  return {
    n: subset.length,
    passRate: passes / subset.length,
    passes,
    medWall: median(walls),
    cost,
  };
}
function median(a) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

console.log("\n=== Pass rate by tier × arm  (n) ===\n");
process.stdout.write("tier ".padEnd(6));
arms.forEach((a) => process.stdout.write(a.padEnd(28)));
console.log();
for (const t of tiers) {
  process.stdout.write(`  ${t}  `.padEnd(6));
  for (const a of arms) {
    const c = cell((r) => Number(r.tier) === t && r.arm === a);
    process.stdout.write(`${pct(c.passRate)} (${c.n})`.padEnd(28));
  }
  console.log();
}

console.log("\n=== Median wall-clock (s) by tier × arm ===\n");
process.stdout.write("tier ".padEnd(6));
arms.forEach((a) => process.stdout.write(a.padEnd(28)));
console.log();
for (const t of tiers) {
  process.stdout.write(`  ${t}  `.padEnd(6));
  for (const a of arms) {
    const c = cell((r) => Number(r.tier) === t && r.arm === a);
    process.stdout.write(`${c.medWall ?? "-"}`.toString().padEnd(28));
  }
  console.log();
}

console.log("\n=== Overall per arm: pass rate · total cost · cost-per-success ===\n");
for (const a of arms) {
  const c = cell((r) => r.arm === a);
  const cps = c.passes ? `$${(c.cost / c.passes).toFixed(4)}` : "n/a";
  console.log(
    `  ${a.padEnd(28)} pass ${pct(c.passRate)}  (${c.passes}/${c.n})   cost $${c.cost.toFixed(4)}   cost/success ${cps}`
  );
}

console.log("\nFeed these tables to the judge (prompts/JUDGE_PROMPT.md) to rule on H1–H4.\n");
