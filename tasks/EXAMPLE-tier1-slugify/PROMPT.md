# Task: Implement `slugify`

The file `src/slugify.js` exports a function `slugify(input)` that is currently a stub. Implement it so it converts an arbitrary string into a URL-friendly slug.

Rules:

- Lower-case the result.
- Trim leading/trailing whitespace.
- Replace any run of non-alphanumeric characters with a single hyphen `-`.
- Collapse multiple hyphens into one.
- No leading or trailing hyphens in the result.
- An input with no alphanumeric characters returns an empty string `""`.

Example: `slugify("  Hello,   World!! ")` → `"hello-world"`.

Do not change the export signature. When you are done, the project's tests should pass.

> _This is an EXAMPLE task that ships with the framework as a plumbing self-test. It is authored by the framework, not by the independent task author, and is **excluded from scoring**._
