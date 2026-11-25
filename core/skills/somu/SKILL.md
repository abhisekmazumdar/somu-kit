---
name: somu
description: Pick the right skills for a task and the order to use them, from the skills available in this session. Use when the user asks which skill or workflow fits, where to start, "how should I approach this", or types /somu with a task. Not needed when the task already clearly matches 1 skill.
---

# somu: which skill, in what order

Given a task, name the 1-3 skills that fit and the order to use them. Don't
do the task yet unless the user said to go.

## Step 1: See what's available

Use the skill list already in this session (names and descriptions). Project
and plugin skills count too: a project's own skill for a platform beats a
generic one. Don't open skill files just to choose.

## Step 2: Match the task to a flow

| Task | Flow |
|---|---|
| Build something new (feature, module, tool) | `reuse-first` → `skateboard-mvp` (or a project planning skill built on it) → build → `prove-it-works` |
| Plan or break down work into issues | the project's planning skill if there is one, else `skateboard-mvp` and its ticket hand-off |
| Bug or failing test | `fix-root-causes` → `prove-it-works` |
| Review someone's change | the project's review flow if there is one, then `prove-it-works` for each finding |
| Choose between approaches | `long-term-maintainability`, plus `community-first` in open source |
| Write anything posted as the user | the project's writing skill for that platform if there is one, then `write-like-abhisek` |
| Open source decision (scope, release, who does what) | `community-first` |

No row fits? Match on skill descriptions. Nothing fits? Say so; don't force a
pick.

## Step 3: Answer

```
1. /<skill>: <why it fits this task, 1 line>
2. /<skill>: <why, and what it needs from step 1>
You run: /<skill>   ← only for skills the session marks as user-only
```

Then: "Start with 1?" If the user already said to go, load the first skill
and follow it.

## Principles, 1 line each

- `reuse-first`: look for existing code, issues and MRs before building.
- `fix-root-causes`: fix where it first went wrong, not where it showed up.
- `long-term-maintainability`: pick what the next maintainer can live with.
- `prove-it-works`: check the real thing and attach proof.
- `community-first`: in shared projects, the project's health comes first.
