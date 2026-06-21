// Hidden tests — authoritative pass/fail gate.
// Placed into the attempt workspace under ./_grading by runner/grade.mjs,
// so this relative import resolves to <workspace>/src/slugify.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/slugify.js";

test("basic lowercasing and hyphenation", () => {
  assert.equal(slugify("Hello World"), "hello-world");
});

test("trims and collapses whitespace/punctuation", () => {
  assert.equal(slugify("  Hello,   World!! "), "hello-world");
});

test("collapses multiple separators into one hyphen", () => {
  assert.equal(slugify("a---b___c   d"), "a-b-c-d");
});

test("no leading or trailing hyphens", () => {
  assert.equal(slugify("!!!wrapped!!!"), "wrapped");
});

test("keeps alphanumerics", () => {
  assert.equal(slugify("Node 22 rocks"), "node-22-rocks");
});

test("empty when no alphanumerics", () => {
  assert.equal(slugify("---  !!! ---"), "");
});

test("already-clean slug is unchanged", () => {
  assert.equal(slugify("already-clean-slug"), "already-clean-slug");
});
