---
name: drupalorg-writing
description: >
  Write any text that will be posted on drupal.org or git.drupalcode.org: issue comments, review replies, new issues, issue summaries, proposed resolutions, MR descriptions and MR inline replies. Picks the right markup (classic Drupal.org HTML or GitLab Markdown), adds the AI disclosure, applies the voice rules and saves a draft in issues/<nid>/drafts/. Use when drafting, formatting or rewriting anything for a Drupal issue queue or merge request. Not for commit messages (drupal-gitlab) or posts outside drupal.org such as LinkedIn or blogs (write-like-abhisek).
---

# Writing for drupal.org

Everything posted on drupal.org or its GitLab goes through this skill. It
never posts: it writes a draft the human reads, edits and posts.

## What are you writing?

| Text | Markup | Structure |
|---|---|---|
| Comment on a classic issue | Drupal.org HTML: `references/classic-html.md` | Comments and replies, below |
| Comment on a migrated issue | GitLab Markdown | Comments and replies, below |
| New issue or issue summary | HTML (classic) or Markdown (migrated) | `references/issue-summary.md` |
| MR description | GitLab Markdown | The project's MR template; `drupal-gitlab` opens the MR |
| MR inline reply | GitLab Markdown | 1 point per reply, 1-3 sentences |

Every row ends with the AI disclosure and follows the voice rules.

**Classic or migrated?** Migrated when the URL has `/work_items/` or the body
says "Migrated from Drupal.org". Migrated queues and all MRs use GitLab
Markdown: fenced code blocks, `**bold**`, `- ` lists, `## ` headings, `>`
quotes, `#NID` for issues and `!NID` for MRs.

## AI disclosure — every issue, MR, and comment

Follows Drupal.org's [AI policy disclosure rules](https://www.drupal.org/docs/develop/issues/issue-procedures-and-etiquette/policy-on-the-use-of-ai-when-contributing-to-drupal#s-disclosure): if the project's issue or MR template has a designated AI disclosure section, put the statement there; otherwise append it to the end of the issue summary, comment, or MR description, after a blank line. A footnote, not a section: on GitLab it collapses under a visible "AI disclosure" toggle so it doesn't take space; on classic Drupal.org it stays one italic line (`<details>` isn't verified to survive Drupal.org's text filter). The policy link sits in the text, never in `<summary>` — clicking there toggles instead of following it; the wording after it mirrors the policy's own example ("Used … to help generate …").

Markdown (migrated queues, MR descriptions) — keep the blank lines inside `<details>`, or GitLab renders the italics and link as raw text:
```
<details><summary>AI disclosure</summary>

_Used AI to help with <uses> (<what it did>). The reasoning and positions are my own, and I reviewed everything before posting. ([Drupal.org AI policy](https://www.drupal.org/docs/develop/issues/issue-procedures-and-etiquette/policy-on-the-use-of-ai-when-contributing-to-drupal#s-disclosure))_

</details>
```

HTML (non-migrated queues):
```
<em><a href="https://www.drupal.org/docs/develop/issues/issue-procedures-and-etiquette/policy-on-the-use-of-ai-when-contributing-to-drupal#s-disclosure">AI disclosure</a>: Used AI to help with <uses> (<what it did>). The reasoning and positions are my own, and I reviewed everything before posting.</em>
```

- `<uses>` — only the ones that apply, always in this order: `research` (reading code, diffs, or threads; finding a root cause; analysing tests), `writing` (drafting this text or the issue/MR body), `code` (writing or changing code, tests, or patches). Join as "research and writing" or "research, writing and code".
- `<what it did>` — up to three concrete actions as gerunds, e.g. "reviewing the MR diff, analysing the tests, summarising the thread". Count AI work recorded earlier in `issues/<nid>/` if it shaped this post.
- Never name a tool, model, or vendor — always just "AI".
- Never repeat or expand the statement into a paragraph.
- Disclose on every post, even for minor AI help. The policy only requires it for a "significant portion" of the code or text; this toolkit is deliberately stricter.
- The policy asks for a "clear, human-written statement": the line is part of a draft the human reads and edits in `issues/<nid>/drafts/`, like the rest of the post. Never post it.

Example (review comment, migrated queue):
```
<details><summary>AI disclosure</summary>

_Used AI to help with research and writing (reviewing the MR diff, analysing the tests, summarising the thread). The reasoning and positions are my own, and I reviewed everything before posting. ([Drupal.org AI policy](https://www.drupal.org/docs/develop/issues/issue-procedures-and-etiquette/policy-on-the-use-of-ai-when-contributing-to-drupal#s-disclosure))_

</details>
```

## Voice and Tone

When the `write-like-abhisek` skill is available, all drupal.org text follows
its technical register: it's the canonical source, so apply it rather than
restating its rules. Constraints specific to issue-queue content:

- No greeting, no opener — start with the fact, status, or problem.
- Status updates are one line: "The MR functions correctly. I'm marking this as RTBC."
- When responding to reviewer feedback: be candid about position changes. If the reviewer was right, say so plainly. "You are right. I removed it." beats hedged corporate acknowledgement every time.
- A light, honest self-awareness is fine in informal review threads. "After a long back-and-forth with AI on it, I came around to agreeing with you" reads as human and direct. Don't sanitize it into bland acceptance. Mentioning AI is fine; naming a tool or model never is. The decision stays the human's ("I came around").
- No em dashes (—) anywhere in a draft. Use a period, comma or colon. Readers spot them as AI text.

## Comments and replies

For any comment, MR reply or review:

1. Be concise and specific. Reference the relevant code, function, or line.
2. Cross-reference issues the queue's way: `[#NID]` on classic queues (see `references/classic-html.md`), `#NID` and `!MR` on GitLab.
3. Code goes in code markup for that surface (`<code>`/`<pre><code>` or backticks).
4. Quote an earlier comment as a blockquote instead of pasting it.
5. Bold sparingly.
6. State clearly what action you are taking or recommending.
7. If attaching a patch or MR, mention it explicitly at the end.
8. Write for any reader of the queue, not just the issue author — plain,
   high-level language, not internal jargon or a raw diff-review dump.
9. **If code changes were made, say what changed and why** — not just a list
   of fixes. Surface any non-obvious reasoning or tradeoff a reviewer would
   otherwise have to reconstruct from the diff (e.g. "used a Kernel test
   instead of Unit here because the fix touches the entity storage layer").
10. **The recommendation states its confidence, not just its verdict.**
    Needs Work / RTBC / Looks good to me always comes with a one-clause
    reason and a confidence level tied to how much evidence backs it — e.g.
    "RTBC, high confidence: pipeline green, no open threads, manual steps
    verified" or "Needs work, moderate confidence: the fix addresses the
    reported bug but the edge case on empty input wasn't re-tested."

## Before saving: cut and scan

Check the draft against rule 8 and the Voice and Tone rules: short
sentences, concrete claims, no filler.

**If `write-like-abhisek` is available:** follow its "Applying This Skill"
steps on the draft: cut it by about a third, then run its `scan.py` and fix
every error. That skill is the only style authority; don't also suggest the
external writing skills below.

**Otherwise,** add 1 line below the draft reminding the human of the 2
writing skills they can run before posting: `technical-writing` (structure,
a plain register any queue reader can follow) and `unslop` (leftover AI
writing patterns):

> **You run:** `/technical-writing` then `/unslop` on this draft before posting (Codex: `$technical-writing`, `$unslop`).

Both are reserved for explicit user invocation: never run them, read their
files, or imitate them yourself.

---

## Save to a draft file, no chat preview

Whatever you're writing, save it to a file in the issue directory. Do not also print a preview, rendered version, or HTML snippet in chat. The
file is the deliverable.

```
issues/<nid>/drafts/YYYY-MM-DD-HHmmss-<label>.md
```

- Create the directory if it does not exist: `mkdir -p issues/<nid>/drafts`
- `<label>`: a 2-4 word slug for the purpose, e.g. `review-feedback`, `issue-summary`, `mr-description`, `rtbc`
- File always uses `.md` extension
- GitLab (migrated) queues: file content is GitLab Flavored Markdown, pasted as-is.
- Drupal.org (non-migrated) queues: file content is the HTML source, pasted as-is.

---

## After saving: open in the editor

After the file is written, try to open it in the user's editor so they can
review/paste from it directly:

1. If running inside VS Code (or a VS Code-family editor: Cursor, Windsurf) —
   detected via `TERM_PROGRAM=vscode` or the `code` CLI being on `PATH` — run
   `code <path-to-file>`.
2. Otherwise, if a `.git` editor or `$EDITOR`/`$VISUAL` env var is set and
   resolves to a GUI editor with a CLI launcher (e.g. `subl`, `idea`, `zed`),
   use that command instead.
3. If no supported editor can be detected, skip silently — do not print an
   error, just report the file path.

Then tell the user only:
```
Draft saved to issues/<nid>/drafts/<filename>.md
```
