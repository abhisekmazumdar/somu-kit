---
name: long-term-maintainability
description: "Apply when choosing between approaches or designing a change. Prefer the option the next maintainer can read, test and change in a year, over the quickest patch."
---

# Long-Term Maintainability

Pick the change someone else can maintain a year from now.

- Follow the project's own conventions and coding standards, even where you'd do it differently.
- Prefer the smaller public surface: fewer new options, hooks and config keys. Each one is a promise to keep.
- Add a test for the behaviour you changed, so the next refactor can't break it silently.
- If the quick fix and the right fix differ, name both in 1 line each and say which you picked and why.
