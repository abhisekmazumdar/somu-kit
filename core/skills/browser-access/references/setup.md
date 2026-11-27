# Browser access: setup

## Playwright CLI

```bash
npm install -g @playwright/cli@latest
playwright-cli --version     # `detach` and `find` need a recent version (0.1.25 has both)
```

Installing a browser (`npx playwright install`) downloads one: ask first.

## Attach to the user's Chrome

Both tools below attach the same way:

1. Chrome 144 or newer, already running.
2. In Chrome, open `chrome://inspect/#remote-debugging` and turn remote debugging on.
3. The first connection shows an Allow dialog in Chrome. The user clicks it.

Remote debugging stays on until the user turns it off on the same page. The Allow dialog guards each new connection, so leaving it on is the user's call. Tell them it's on when you're done.

**Connect by address, not by profile folder.** Chrome serves the toggle's endpoint on `127.0.0.1:9222` and accepts `ws://127.0.0.1:9222/devtools/browser` without the per-launch id (verified on macOS, playwright-cli 0.1.25, 2026-11-27). That needs no Full Disk Access, so nothing to re-grant after a Claude Code update:

```bash
nc -z 127.0.0.1 9222 || echo "remote debugging is off"   # /json/version returns 404 here; that's expected
playwright-cli -s=real attach --cdp=ws://127.0.0.1:9222/devtools/browser
```

Tabs from every Chrome profile come back in one `tab-list`. Playwright puts them all in 1 context; Chrome's own `Target.getTargets` gives each profile a separate `browserContextId`, which is how to check a tab's profile.

The first `attach` saves a snapshot of the user's current tab to `.playwright-cli/`. That may be their mail: delete it unread.

Only `--cdp=chrome` and DevTools MCP's `--autoConnect` read the profile folder, and only those hit the error below.

**macOS `EPERM` on `DevToolsActivePort`:** macOS blocks reading Chrome's profile folder. Test with `ls "$HOME/Library/Application Support/Google/Chrome/"`. The user grants Full Disk Access (System Settings → Privacy & Security) to the app macOS holds responsible, then restarts it. Only the user can do this. If Claude Code runs as a background process (its shell's parent chain ends at `claude`, not the terminal app), the terminal's access doesn't apply: grant it to the `claude` binary itself (`readlink -f "$(which claude)"`; press Cmd+Shift+G in the file picker to paste the path). Find that app by walking up the process tree (`ps -o ppid=,command= -p <pid>` from `$$`):

- Ends in Terminal, iTerm, Warp or an IDE: grant that app.
- Ends in `claude daemon run` with parent pid 1 (background and spare sessions): launchd started it, so no terminal's grant applies. Grant the `claude` binary itself (`readlink -f "$(which claude)"`), or run the session from a terminal that has the grant.

Chrome still listens on 9222 without that access, but `/json/version` returns 404: the connection needs the browser path stored in `DevToolsActivePort`.

**Extension mode** (`attach --extension=chrome --session=<name> --session-color=<color>`) puts the agent's tabs in a named, colored tab group. It needs the Playwright Extension from the Chrome Web Store. Failure modes seen on playwright-cli 0.1.25:

- It reads the same profile folder first. Without access, it says "Playwright Extension not found" even when the extension is installed, because the read error is swallowed.
- `PLAYWRIGHT_MCP_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` skips that check and opens the extension's connect page through the Chrome binary.
- If the extension never answers (not installed, or the page opened in a profile without it), `attach` waits forever and prints nothing. Wrap it in `timeout 60`. `DEBUG='pw:mcp:*'` writes "Waiting for incoming extension connection" to `<session>.err` in the playwright daemon cache folder.

Not yet verified end to end. Prefer the `ws://` address above until it is.

## Chrome DevTools MCP

User or local scope, so a project's shared `.mcp.json` stays unchanged:

```bash
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest \
  --wsEndpoint ws://127.0.0.1:9222/devtools/browser --no-usage-statistics --no-performance-crux
```

- `--wsEndpoint` with the id-less address skips the profile folder, like Playwright above. The MCP side isn't tested yet; if it fails, `--autoConnect` works once the app has Full Disk Access.

- `--no-usage-statistics`: no usage data to Google.
- `--no-performance-crux`: traces don't send page URLs to the CrUX API. Keep it for client and local sites.
- `--isolated` uses a throwaway profile with no logins. Leave it off when the point is the user's session.
- Extra tool groups are off by default: `--memoryDebugging` (heap snapshots), `--categoryNetworkMocks`.

## Separate browser instead

When attaching to the user's Chrome is too much access, start a Chrome just for the agent:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir="$HOME/.cache/agent-chrome"
playwright-cli -s=agent attach --cdp=http://localhost:9222
```

The user logs in there once per site. It never sees their own tabs.
