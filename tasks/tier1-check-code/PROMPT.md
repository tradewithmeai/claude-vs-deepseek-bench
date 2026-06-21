# Task: Implement `normaliseCheckCode`

The file `src/normaliseCheckCode.js` exports a function `normaliseCheckCode(input)` that is currently a stub.

Implement it so it converts a supplier check-code into the canonical form used by the warehouse desk.

Rules:

- Accept only strings. Non-string input returns `null`.
- Trim leading and trailing whitespace.
- Remove spaces, hyphens, underscores, and periods from the remaining text.
- Convert letters to uppercase.
- The cleaned code must contain exactly 8 characters.
- The cleaned code must contain only uppercase letters `A-Z` and digits `0-9`.
- The final character is a check digit.
- Compute the expected check digit from the first 7 characters:
  - For each of the first 7 characters, convert digits to their numeric value and letters to `A=10`, `B=11`, ..., `Z=35`.
  - Multiply those values by weights `[3, 7, 1, 3, 7, 1, 3]` in order.
  - Sum the products.
  - Expected check digit is `sum % 10` as a string.
- Return the cleaned 8-character code only if the supplied final character equals the expected check digit.
- Otherwise return `null`.

Do not change the export signature. When you are done, the project's tests should pass.
