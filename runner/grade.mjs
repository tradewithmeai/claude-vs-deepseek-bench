#!/usr/bin/env node
// Objective pass/fail gate.
// Copies a task's hidden tests against an agent's attempt workspace, runs the
// task's grade_cmd, and writes grade.json (pass = exit code 0).
//
// Usage:
//   node runner/grade.mjs --task tasks/<id> --attempt results/runs/<arm>/<id>/<rep>/workspace
//   node runner/grade.mjs --task tasks/EXAMPLE-tier1-slugify --attempt <dir> [--out grade.json] [--keep]

import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

function arg(name, def = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const taskDir = arg("task");
const attemptDir = arg("attempt");
if (!taskDir || !attemptDir) {
  console.error("Usage: node runner/grade.mjs --task <taskDir> --attempt <attemptWorkspace> [--out file] [--keep]");
  process.exit(2);
}

const meta = JSON.parse(readFileSync(join(taskDir, "meta.json"), "utf8"));
const hiddenTests = join(taskDir, "grading", "hidden_tests");
if (!existsSync(hiddenTests)) {
  console.error(`No hidden_tests at ${hiddenTests}`);
  process.exit(2);
}

const work = mkdtempSync(join(tmpdir(), "cab-grade-"));
let pass = false, exitCode = -1, output = "", durationMs = 0;
try {
  // Stage: attempt workspace + hidden tests under ./_grading
  cpSync(resolve(attemptDir), work, { recursive: true });
  cpSync(resolve(hiddenTests), join(work, "_grading"), { recursive: true });

  if (meta.setup_cmd) {
    execSync(meta.setup_cmd, { cwd: work, stdio: "pipe" });
  }

  const start = Date.now();
  try {
    output = execSync(meta.grade_cmd, { cwd: work, stdio: "pipe", encoding: "utf8" });
    exitCode = 0;
    pass = true;
  } catch (e) {
    exitCode = typeof e.status === "number" ? e.status : 1;
    output = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    pass = false;
  }
  durationMs = Date.now() - start;
} finally {
  if (!arg("keep")) rmSync(work, { recursive: true, force: true });
}

const result = {
  task_id: meta.id,
  tier: meta.tier,
  attempt: resolve(attemptDir),
  pass,
  exit_code: exitCode,
  grade_cmd: meta.grade_cmd,
  duration_ms: durationMs,
  output_tail: output.split("\n").slice(-40).join("\n"),
  graded_at: new Date().toISOString(),
};

const outPath = typeof arg("out") === "string" ? arg("out") : join(attemptDir, "..", "grade.json");
writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`${pass ? "PASS" : "FAIL"}  ${meta.id}  (exit ${exitCode}, ${durationMs}ms)  -> ${outPath}`);
process.exit(pass ? 0 : 1);
