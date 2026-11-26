# somu-kit

"Somu" is what my childhood friends call me.

My Claude Code skills in 1 repo, in 3 layers.

| Layer | What | How it's installed |
|---|---|---|
| `core` | Writing voice, skateboard planning, working principles | Claude Code plugin, user level, every laptop |
| `drupal` | Any Drupal project: coding standards, DDEV, impact map, PHPUnit | Claude Code plugin, on per workspace; npx for Codex |
| `drupal-contrib` | drupal.org + GitLab contribution: issues, MRs, reviews, agents | Claude Code plugin, on per workspace; npx for Codex |

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

The plugins hold the skills and agents. The npx installer still sets up what a plugin can't: permissions, the git guard hook, the `CLAUDE.md` block with the site table, the drupalorg-cli MCP config, and everything for Codex.

Once per laptop, install both plugins and turn them off everywhere:

```sh
claude plugin install drupal-contrib@somu-kit --scope user   # also installs drupal
claude plugin disable drupal-contrib@somu-kit --scope user
claude plugin disable drupal@somu-kit --scope user
```

Then in each Drupal workspace:

```sh
claude plugin enable drupal@somu-kit --scope local
claude plugin enable drupal-contrib@somu-kit --scope local
npx github:abhisekmazumdar/somu-kit --plugins
```

`--scope local` writes to the git-ignored `.claude/settings.local.json`. `--plugins` removes the copied skills and agents and approves the plugins' scripts. The setting is remembered, so later runs need no flag. `--no-plugins` goes back to copies.

Codex, or no plugins: `npx github:abhisekmazumdar/somu-kit --target both` copies the skills and agents into the workspace. Details: [drupal-contrib/README.md](drupal-contrib/README.md).

## Editing

1. Edit `<layer>/skills/<skill>/SKILL.md`.
2. `claude plugin validate .` and `node --test tests/*.test.js installer/tests/*.test.js`.
3. Push. There's no `version` field, so every commit is an update. Laptops pick it up on the next auto-update, or `/plugin marketplace update somu-kit`. Copy-mode workspaces: re-run the npx command.

To test local changes before pushing: `claude --plugin-dir ./core --plugin-dir ./drupal --plugin-dir ./drupal-contrib`.

Paths to a plugin's own files use `${CLAUDE_PLUGIN_ROOT}` (unquoted, so permission rules match). The installer rewrites them for copies. `tests/skills.test.js` checks names, paths, layers and retired names.

## Evals: does the right skill fire?

`core/evals/` has 10 cases: 7 check that a realistic prompt loads the right skill, 3 check that unrelated prompts load none. Run them after changing a skill's description:

```sh
claude plugin eval ./core --trust-plugin --ablation none --no-publish -j 4 --max-cost-usd 5
```

Last run (2026-11-26): 10 of 10 cases passed, 2 runs each, $1.57. Results stay local in `core/evals/results/`.

## Copies in other repos (cloud runs)

Cloud runs only see skills committed to their own repo. These keep a copy:

- `abhisekmazumdar/abhisek-xyz-astro`: `write-like-abhisek`

Refresh after a change:

```sh
scripts/sync-to-project.sh core/write-like-abhisek ~/Code/abhisek-xyz-astro
```

## Credits

See [CREDITS.md](CREDITS.md).
