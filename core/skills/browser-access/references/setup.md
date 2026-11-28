# Browser access: setup

Once per machine. The same steps work on Linux and macOS.

## 1. Install

```bash
npm install -g @playwright/cli@latest              # 0.1.25 or newer
<skill dir>/agent-chrome.sh install                # copies it to ~/.local/bin/agent-chrome
```

`~/.local/bin` must be on `PATH`. The copy keeps one fixed path, so the allow rules below keep matching after a plugin update; re-run `install` to pick up a new version of the script. Installing a Playwright browser (`npx playwright install`) downloads one: ask first.

## 2. Allow the commands

In `~/.claude/settings.json`, or Claude Code asks before every browser command and work stops while the user is away:

```json
"permissions": { "allow": ["Bash(agent-chrome *)", "Bash(playwright-cli *)", "mcp__chrome-devtools"] }
```

## 3. Add Chrome DevTools MCP

```bash
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest \
  --browserUrl http://127.0.0.1:9223 --no-usage-statistics --no-performance-crux
```

The two `--no-` flags keep usage data and page URLs from going to Google.

## 4. Log in

`agent-chrome start`, then log in once to each site in the window that opens. Logins stay until the site expires them.

Only log in to sites you'd let Claude use unsupervised: test and staging sites, low-privilege accounts. Never mail, banking, password managers or production admin accounts. The profile folder (`~/.cache/agent-chrome`) holds those logins: never copy it into a workspace or share it.

## How it works

`agent-chrome start` runs Chrome with its own profile (`--user-data-dir=~/.cache/agent-chrome`) and a debugging port (`--remote-debugging-port=9223`) on 127.0.0.1 only. Chrome asks for Allow only on the user's own profile, so this one never prompts. The port has no password, so the script never opens it to the network. `stop` asks Chrome to close itself, which saves its cookies; a kill can lose the last 30 seconds of logins.

Overrides: `AGENT_CHROME_PORT`, `AGENT_CHROME_DIR`, `AGENT_CHROME_BIN`.

Tested on Linux (Chrome 158, playwright-cli 0.1.25, chrome-devtools-mcp 1.14.0) on 2026-11-28. On macOS the script uses `/Applications/Google Chrome.app`; not yet run there.

## Your own Chrome

Only when the user asks and is there: every new connection shows an Allow dialog they must click. It sees every tab and login, mail included.

1. In Chrome, open `chrome://inspect/#remote-debugging` and turn remote debugging on.
2. `playwright-cli -s=real attach --cdp=ws://127.0.0.1:9222/devtools/browser`. The user clicks Allow.
3. The attach saves a snapshot of the user's current tab to `.playwright-cli/`. Delete it unread.
4. Open new tabs; never navigate one the user opened. End with `detach`, never `close` (it can quit their Chrome).
5. Tell the user remote debugging is still on; they turn it off on the same page.

Use this address, not `--cdp=chrome`: on macOS, `--cdp=chrome` reads Chrome's profile folder and fails with `EPERM` unless the terminal has Full Disk Access.

**A specific profile** (for example a client's): every profile's tabs show up in one list, and a new tab opens in whichever profile Chrome picks. Open the page from a tab already in that profile, since a popup opens in its opener's profile:

```bash
playwright-cli -s=real run-code "async page => { const p = page.context().pages(); \
  const t = await Promise.all(p.map(x => x.title())); \
  const i = t.findIndex(x => x.includes('<text only that profile shows>')); \
  if (i < 0) throw new Error('No open tab matches that profile'); \
  await p[i].evaluate(u => window.open(u, '_blank'), '<url>'); }"
```

Check the new tab's account before you act. If it throws, ask the user to open a tab in that profile.
