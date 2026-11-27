---
name: browser-access
description: "Pick the browser tool before driving a web page: Playwright CLI by default (its own browser, or attached to the user's real Chrome for logged-in sites), Chrome DevTools MCP for performance traces, Lighthouse audits, network bodies and console stacks. Use when a task needs a browser, the user's logged-in session, a specific Chrome profile, or a page checked in a browser."
---

# Browser access

## Pick the tool

| Need | Use |
|---|---|
| Local or test site, flows, screenshots | **Playwright CLI**, its own browser |
| A site the user is already logged into, or a specific Chrome profile | **Playwright CLI** attached to the user's Chrome |
| Why a page is slow, broken or inaccessible | **Chrome DevTools MCP**: trace, Lighthouse, network, console |
| The user's Chrome when remote debugging isn't set up, or a GIF of a flow (`gif_creator`) | Claude in Chrome |

Skip Playwright MCP when the CLI is there: most actions return the whole page snapshot, which costs the most tokens.

## Playwright CLI

Load the `playwright-cli` skill for the commands. Not installed? `playwright-cli --help` and `playwright-cli <command> --help` list them. On top of it:

- **Name the session**: `playwright-cli -s=<name> ...`, one per site or role.
- **Save tokens**: snapshots go to files. Search them with `find "<text>"` instead of reading the whole page.
- **Stay logged in on your own browser**: log in once, `state-save ~/.cache/playwright-state/<site>.json`, and `state-load` the same file in later sessions. `--persistent` alone can lose the session cookie on close. The state file holds session cookies: keep it in that folder, outside every workspace, and never post it.
- **The user's real Chrome**: `attach --cdp=ws://127.0.0.1:9222/devtools/browser` (needs no Full Disk Access, unlike `--cdp=chrome`). It uses every login the user has, and it sees every tab, mail included.
  - The attach saves a snapshot of the user's current tab. Delete it unread.
  - Open new tabs (`tab-new`). Never `goto` in a tab the user opened.
  - End with `detach`. **Never `close` an attached browser**: it can quit the user's Chrome.
  - Close only tabs you opened, by index, after `tab-list`.

## Another Chrome profile

Attached tools see tabs from every profile in one list, and a plain new tab opens in whichever profile Chrome picks. To work in a named profile (for example a client's), open the page from a tab already in that profile:

```bash
playwright-cli -s=real run-code "async page => { const p = page.context().pages(); \
  const t = await Promise.all(p.map(x => x.title())); \
  const i = t.findIndex(x => x.includes('<text only that profile shows>')); \
  if (i < 0) throw new Error('No open tab matches that profile'); \
  await p[i].evaluate(u => window.open(u, '_blank'), '<url>'); }"
```

A popup opens in its opener's profile (verified: Chrome reports the same `browserContextId` for both). Then check the new tab's account (title, user menu) before you act. If it throws, no tab of that profile is open: ask the user to open one.

## Chrome DevTools MCP

- Connects to the running Chrome through `--wsEndpoint` (see setup); Chrome asks the user to click Allow once per session.
- `list_pages` / `select_page` reach any open tab. Prefer `new_page` over navigating the user's tabs.
- Save snapshots with `take_snapshot` `filePath` and search the file. The path must be inside the workspace; delete it afterwards.
- Traces and `lighthouse_audit` come back as short summaries: one call beats clicking through a page.

## Before you say done

Name the tool, the session or tab you used, and what you left open. If you attached to the user's Chrome, say that you detached.

Setup, first-run errors and flags: [references/setup.md](references/setup.md).
