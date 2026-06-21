// Reference solution. Overlaying grading/reference/ onto workspace/ must make
// the hidden tests pass (the GREEN half of runner/verify-task.mjs).
export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
