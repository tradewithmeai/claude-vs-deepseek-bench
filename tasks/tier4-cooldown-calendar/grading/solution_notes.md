# Reference solution notes

The executable reference solution is in `grading/reference/src/`.

There are three intended traps. First, `scheduler.js` caches by engineer only, so querying one day poisons later calls for another day. Remove memoisation, or include day and job data in the key and return defensive copies. Second, `job.cooldownMinutes || 15` treats explicit `0` as missing; use `job.cooldownMinutes ?? 15`. Third, `clipWindow` mutates objects and keeps zero-length or fully outside windows because it checks `start > end`; create a new clipped object and reject `start >= end`.
