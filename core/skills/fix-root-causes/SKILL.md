---
name: fix-root-causes
description: "Apply when debugging or fixing a bug. Trace the symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate."
---

# Fix Root Causes

Fix the fault, not the place where it surfaced. The root cause is the first place the system did something it should not do, or failed to handle a state it should handle.

- Reproduce first. Ask "why" until the answer is a wrong decision in the code. When stuck, add logging and read the actual state.
- Ask whether the state that triggered the symptom is legitimate. If it is, handle it where the code broke. If it should never exist, a check there hides the bug, so find what produced it. Guards, retries, swallowed errors and clamped values are the usual ways to hide a bug.
- Fix the pattern, not the instance. Find every place with the same fault.
