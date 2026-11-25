# somu-kit

"Somu" is what my childhood friends call me.

My Claude Code skills, as 1 plugin marketplace with layered plugins.

| Plugin | What | Where it's on |
|---|---|---|
| `core` | Writing voice, skateboard planning, working principles | User level, every laptop |
| `drupal` | Any Drupal project (planned) | Per project |
| `drupal-contrib` | drupal.org + GitLab contribution (planned) | Per project |

Rule: a layer only uses layers below it. `drupal-contrib` → `drupal` → `core`. `core` never mentions Drupal.

## core

| Skill | Use |
|---|---|
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

The repo is private. Installing needs git access to GitHub (SSH key or `gh auth login`). Background auto-update also needs `GITHUB_TOKEN` set in your shell, for example `export GITHUB_TOKEN=$(gh auth token)`.

Or from a shell:

```sh
claude plugin marketplace add abhisekmazumdar/somu-kit
claude plugin install core@somu-kit --scope user
```

Don't also keep a `~/.claude/skills/write-like-abhisek` symlink, or the skill loads twice.

## Per project (drupal, drupal-contrib)

Commit this to the project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "somu-kit": {
      "source": { "source": "github", "repo": "abhisekmazumdar/somu-kit" }
    }
  },
  "enabledPlugins": {
    "drupal@somu-kit": true
  }
}
```

Or run `claude plugin install drupal@somu-kit --scope project`.

## Editing

1. Edit `<plugin>/skills/<skill>/SKILL.md`.
2. Bump `version` in `<plugin>/.claude-plugin/plugin.json`. Installs only update when it changes.
3. `claude plugin validate .`
4. Push. Other laptops pick it up on the next auto-update, or `/plugin marketplace update somu-kit`.

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
