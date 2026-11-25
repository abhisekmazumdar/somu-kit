# somu-kit

"Somu" is what my childhood friends call me.

My Claude Code skills in 1 repo, in 3 layers.

| Layer | What | How it's installed |
|---|---|---|
| `core` | Writing voice, skateboard planning, working principles | Claude Code plugin, user level, every laptop |
| `drupal` | Any Drupal project: coding standards, DDEV, impact map, tests | npx installer, per workspace |
| `drupal-contrib` | drupal.org + GitLab contribution: issues, MRs, reviews, agents | npx installer, per workspace |

Rule: a layer only uses layers below it. `drupal-contrib` → `drupal` → `core`. `core` never mentions Drupal.

## core

| Skill | Use |
|---|---|
| `somu` | Not sure which skill fits? `/core:somu <task>` names them and the order |
| `write-like-abhisek` | Anything I post or send as myself |
| `skateboard-mvp` | Plan a feature as thin usable slices |
| `reuse-first` | Check existing code, issues and MRs before building |
| `fix-root-causes` | Fix the fault, not the symptom |
| `long-term-maintainability` | Pick what the next maintainer can live with |
| `prove-it-works` | Verify the real thing, attach proof |
| `community-first` | Open source decisions |

Skills are namespaced by plugin: `/core:skateboard-mvp`.

## Install (once per laptop)

In Claude Code:

```
/plugin marketplace add abhisekmazumdar/somu-kit
/plugin install core@somu-kit
```

Then turn on auto-update: `/plugin` → Marketplaces → `somu-kit` → Enable auto-update. It's off by default for third-party marketplaces.


Or from a shell:

```sh
claude plugin marketplace add abhisekmazumdar/somu-kit
claude plugin install core@somu-kit --scope user
```

Don't also keep a `~/.claude/skills/write-like-abhisek` symlink, or the skill loads twice.

## Drupal workspaces (drupal, drupal-contrib)

Run from the Drupal workspace:

```sh
npx github:abhisekmazumdar/somu-kit --target both
```

It installs both layers' skills, the agents, a git guard hook and the drupalorg-cli MCP config, for Claude Code and Codex. Details: [drupal-contrib/README.md](drupal-contrib/README.md).

These 2 layers aren't plugins yet. The installer sets up things a plugin can't (permissions, `CLAUDE.md` block, Codex config), so it stays the way in for now.

## Editing

1. Edit `<layer>/skills/<skill>/SKILL.md`.
2. `claude plugin validate .` and `node --test installer/tests/*.test.js`.
3. Push. There's no `version` field, so every commit is an update. Laptops pick it up on the next auto-update, or `/plugin marketplace update somu-kit`. Drupal workspaces: re-run the npx command.

To test local changes before pushing: `claude --plugin-dir ./core`.

## Copies in other repos (cloud runs)

Cloud runs only see skills committed to their own repo. These keep a copy:

- `abhisekmazumdar/abhisek-xyz-astro`: `write-like-abhisek`

Refresh after a change:

```sh
scripts/sync-to-project.sh core/write-like-abhisek ~/Code/abhisek-xyz-astro
```

## Credits

See [CREDITS.md](CREDITS.md).
