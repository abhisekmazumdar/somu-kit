---
name: drupal-issue-plan
description: >
  Plan a Drupal feature request, meta issue or roadmap item as thin, usable
  slices and turn them into drupal.org child issues ready to paste: title,
  issue summary, parent, and what each one is postponed on. Use when asked to
  plan, scope, break down or roadmap a feature or meta issue for a Drupal
  module ("plan this meta", "split this into child issues", "how should we
  build X in the AI module"). Use drupal-issue-start instead to work on a
  single existing issue.
---

# Plan a Drupal issue into child issues

Produces drafts only. Nothing is created or posted on drupal.org: the human
reads the plan, edits it and creates the issues.

Input: an issue URL or nid (usually a meta or feature request), or a plain
description of the feature plus the project name.

## Step 1: Load the issue and what exists

1. If there's an issue, read it and its comments. Read `issues/<nid>/README.md`
   too if it exists.
   - Classic queue: `drupalorg issue:show <nid> --with-comments --format=llm`
   - Migrated queue (URL has `/work_items/`, the drupal.org URL redirects to
     git.drupalcode.org, or `issue:show` comes back empty):
     ```bash
     GITLAB_HOST=git.drupalcode.org glab issue view <nid> --repo project/<project> --comments
     python3 "<skills-root>/drupal-gitlab-inline-comments/fetch_issue_notes.py" project/<project>#<nid>
     ```
   If you can't read the issue, stop and say what failed. Never plan from a
   guess at its contents.
2. Check for work that already covers part of it, and write down what you find:
   - Existing child issues of the meta, and issues on the same topic:
     `drupalorg issue:search <project> "<keywords>" --status=open --format=llm`
     (try 2 or 3 keyword sets).
   - Open MRs for those issues: `drupalorg mr:list <nid>` (classic) or
     `GITLAB_HOST=git.drupalcode.org glab mr list --repo project/<project> --search "<keywords>"` (migrated).
   - Backlinks in local issue records: the `drupal-related-issues` skill.
   - Other contrib modules that already do it (search drupal.org projects by
     keyword). Extending or reusing one beats building new.
   - Decisions in the thread: approaches a maintainer accepted or rejected.

## Step 2: Ask what would change the plan

Ask only the questions whose answers change the slices. Ask them in 1
numbered round, each with your recommended answer, so the human can reply
"ok to all" or correct 1 or 2:

```
1. Which branch does this target? Recommended: 1.x, since 2.x isn't open yet.
2. Is a new submodule OK, or must this live in the main module? Recommended: submodule, so it can ship as experimental.
```

Typical questions: target branch and Drupal core versions, who the first user
is, BC limits, whether maintainers have already agreed the direction, and the
appetite. Stop asking when the remaining unknowns wouldn't change the slices.
State any assumption you make in 1 line.

## Step 3: Slice it

Load the `skateboard-mvp` skill and follow it, passing in what Step 1 found as
its "what exists". Use its ticket hand-off format for the slices.

If `skateboard-mvp` isn't available: slice into end-to-end pieces a real user
or site builder can try, smallest first, each with Scope, Out, Done when and
Blocked by. Never slice by layer ("schema", "API", "UI").

Drupal checks on the slices:
- Each child issue is 1 MR a reviewer can review in 1 sitting.
- A slice that changes an API, schema or config needs its update path and, if
  public, a change record in its Remaining tasks.
- Experimental first: a new feature can start as a submodule or behind a
  setting, so it can land before it's complete.

## Step 4: Write the child issues

Map each ticket to a drupal.org issue. Use the `drupalorg-writing` skill for
markup (classic HTML or GitLab Markdown) and the AI disclosure, and its
`references/issue-summary.md` template for each body:

| Ticket field | drupal.org issue |
|---|---|
| Slice name | Title: short, starts with a verb ("Add …", "Allow …") |
| Scope | Problem/Motivation + Proposed resolution |
| Out | Proposed resolution, as "Not in this issue: …" |
| Done when | Remaining tasks, as checkable items (tests, screenshot, change record) |
| Blocked by | "Postponed on #<nid>" line at the top; status Postponed until it lands |
| Parent | Parent issue field: the meta's nid |

Also fill: Category (Feature request or Task), Component and Version, copied
from the meta unless a slice needs something else. Child issues not yet
created are named "Child 1", "Child 2" so the human can swap in real numbers.

Then draft the meta's update: a "Child issues" list in build order, each
with its title, what it's postponed on, and 1 line on what it delivers.

## Step 5: Save the drafts

Save 1 file with the full plan, through `drupalorg-writing`'s save rules:

```
issues/<nid>/drafts/YYYY-MM-DD-HHmmss-plan.md
```

Contents, in order: what exists (Step 1), assumptions (Step 2), the slices,
each child issue ready to paste, the meta summary update. Every pasteable
block ends with the AI disclosure.

Then update the issue record with `issue-record-update` (plan drafted, file
path, open questions), and tell the human only:

```
Plan saved to issues/<nid>/drafts/<file>. <N> child issues, <M> postponed. Review, then create them in order.
```
