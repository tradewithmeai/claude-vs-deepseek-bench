#!/usr/bin/env node
// Mechanical drift-check for a task. Proves RED then GREEN automatically — so we
// never rely on an author's unverifiable "I checked it" claim.
//
//   RED   : the starting workspace/ must FAIL the hidden tests.
//   GREEN : workspace/ + grading/reference/ overlaid must PASS the hidden tests.
//
// Requires each task to ship grading/reference/ (the correct source files,
// same relative paths as workspace/). Usage:
//   node runner/verify-task.mjs --task tasks/<id>
//   node runner/verify-task.mjs --all

import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

function runHiddenTests(taskDir, sourceDir) {
  const meta = JSON.parse(readFileSync(join(taskDir, "meta.json"), "utf8"));
  const work = mkdtempSync(join(tmpdir(), "cab-verify-"));
  try {
    cpSync(resolve(sourceDir), work, { recursive: true });
    cpSync(join(taskDir, "grading", "hidden_tests"), join(work, "_grading"), { recursive: true });
    if (meta.setup_cmd) execSync(meta.setup_cmd, { cwd: work, stdio: "pipe" });
    try {
      execSync(meta.grade_cmd, { cwd: work, stdio: "pipe", encoding: "utf8" });
      return { pass: true };
    } catch (e) {
      return { pass: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}`.split("\n").slice(-6).join("\n") };
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function overlay(base, over, dest) {
  cpSync(base, dest, { recursive: true });
  if (existsSync(over)) cpSync(over, dest, { recursive: true });
}

function verify(taskDir) {
  const id = JSON.parse(readFileSync(join(taskDir, "meta.json"), "utf8")).id;
  const ws = join(taskDir, "workspace");
  const ref = join(taskDir, "grading", "reference");
  const problems = [];

  const red = runHiddenTests(taskDir, ws);
  if (red.pass) problems.push("RED FAILED: starting workspace already passes hidden tests (no real task).");

  if (!existsSync(ref)) {
    problems.push("MISSING grading/reference/ — cannot prove GREEN. Author must ship the reference solution as code.");
  } else {
    const tmp = mkdtempSync(join(tmpdir(), "cab-overlay-"));
    try {
      overlay(ws, ref, tmp);
      const green = runHiddenTests(taskDir, tmp);
      if (!green.pass) problems.push(`GREEN FAILED: workspace + reference still fails hidden tests.\n      ${green.out}`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  const ok = problems.length === 0;
  console.log(`${ok ? "OK  " : "BAD "} ${id}`);
  for (const p of problems) console.log(`      - ${p}`);
  return ok;
}

const tasksRoot = "tasks";
let targets = [];
if (arg("all")) {
  targets = readdirSync(tasksRoot)
    .map((d) => join(tasksRoot, d))
    .filter((d) => statSync(d).isDirectory() && existsSync(join(d, "meta.json")))
    .filter((d) => {
      try { return JSON.parse(readFileSync(join(d, "meta.json"), "utf8")).scored !== false; } catch { return true; }
    });
} else if (arg("task")) {
  targets = [arg("task")];
} else {
  console.error("Usage: node runner/verify-task.mjs --task tasks/<id>   |   --all");
  process.exit(2);
}

let allOk = true;
for (const t of targets) allOk = verify(t) && allOk;
process.exit(allOk ? 0 : 1);
