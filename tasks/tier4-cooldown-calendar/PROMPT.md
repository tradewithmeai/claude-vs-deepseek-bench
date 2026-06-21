# Task: Diagnose and fix cooldown calendar blocking

This workspace contains a small maintenance scheduler. It converts job records into minute-based blocked windows for a given engineer and day.

A production bug has been reported: some blocked windows are wrong when the same engineer is queried across multiple days, especially for jobs that cross midnight. The issue is in the implementation, not in the input data.

Fix the scheduler so `blockedWindowsForDay(jobs, engineerId, day)` returns the correct blocked windows.

Definitions:

- `day` is a string in `YYYY-MM-DD` format.
- Job times are local ISO-like strings in `YYYY-MM-DDTHH:mm` format.
- A job belongs to exactly one engineer via `engineerId`.
- A job blocks time from `start` until `end`, plus a cooldown after `end`.
- Cooldown minutes come from `cooldownMinutes` on the job, or `15` when missing.
- The returned windows are clipped to the requested day.
- Minutes are measured from the start of the requested day, so midnight is `0` and the end of the day is `1440`.
- End minute is exclusive.
- Touching or overlapping windows must be merged.
- Return windows as `{ startMinute, endMinute }` sorted ascending.
- Repeated calls with the same inputs must be independent of call order.

Do not add dependencies. Keep the public API unchanged. When you are done, the project's tests should pass.
