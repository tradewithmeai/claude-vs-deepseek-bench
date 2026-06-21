# Reference solution notes

The executable reference solution is in `grading/reference/src/normaliseCheckCode.js`.

It checks the input type, trims, removes whitespace/dot/underscore/hyphen separators, uppercases, validates `/^[A-Z0-9]{8}$/`, maps the first seven characters to numeric values, applies weights `[3,7,1,3,7,1,3]`, and compares `String(sum % 10)` with the eighth character.
