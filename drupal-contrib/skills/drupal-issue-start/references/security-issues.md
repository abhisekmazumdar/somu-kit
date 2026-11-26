# Security issues (`is_security=true`)

Read this only for a security work item. Phases 0 to 4 are for
`drupal-issue-start`; the last section is for `drupal-issue-agent`. A security fix stays
private until the advisory is released. The non-negotiable rule in SKILL.md
still applies to every step here.

## Phase 0: record key

`<nid>` is the record key `security-<sec-nid>-<iid>`: item numbers restart at 1
in every security repo, so the bare `<iid>` would collide. Use it for
`issues/<nid>/` and nowhere else, never as a drupal.org nid, an issue-fork
name, or a branch name. `<project>` is the module's machine name; take it from
the issue or repo description in Phase 2, and ask if it isn't stated.

## Phase 2: fetch

Run only these. No `drupalorg` commands, no issue-fork or `project/` lookups:

```bash
GITLAB_HOST=git.drupalcode.org glab issue view <iid> --repo <security_repo> --comments
GITLAB_HOST=git.drupalcode.org glab mr list --repo <security_repo>
GITLAB_HOST=git.drupalcode.org glab ci status -b <branch> -R <security_repo>   # per open MR
```

Keep only the MRs that reference this issue (`#<iid>` or its title). A 403/404
on `glab issue view` means no access: stop and tell the human, naming
`<security_repo>`. Then continue with the backlink scan in SKILL.md.

## Phase 2.5: no recon checkout

No `drupal-repo-setup` call. Review the picked MR from its diff instead
(`GITLAB_HOST=git.drupalcode.org glab mr diff <mr-iid> --repo <security_repo>`),
or skip to the "no review" case if it has none. The checkout happens on go,
inside `drupal-issue-agent` (its "Security issues" section).

## Phase 4: go checklist

Replace the fork/push/`glab` checklist lines with
"<✅|❌> Read access to `<security_repo>`" and "<✅|❌> Module checkout at
`<webroot>/modules/contrib/<project>`", and end the list at "Commit locally on
`security-<iid>`: not pushed; you move it to `<security_repo>`". Never list a
push or an MR.

## drupal-issue-agent

Read before A2/B4. These rules override every step that clones, adds a
remote, pushes, or opens an MR. The short rules in the agent's "Security
issues" section still apply.

- **Checkout (A2/B4):** work in the module's existing checkout at
  `<webroot>/modules/contrib/<project>`. If it's missing or has uncommitted
  changes, `[PAUSE]` and ask. Don't clone it. For Path A, add `<security_repo>`
  as a remote named `security` (`git@git.drupal.org:<security_repo>.git`),
  fetch the MR branch, and check it out as `security-<iid>`. For Path B, branch
  `security-<iid>` from the default branch.
- **Stop at the commit (A10 step 7, B5):** run the preflight, commit locally,
  and stop. The final report gives the branch, the commit, and the push
  command for the human to run themselves.
- **Drafts:** start every file in `issues/<nid>/drafts/` with
  `<!-- PRIVATE: security issue, post only in <security_repo> -->`.
- **The rest is unchanged:** review, fix list, preflight, record update. The
  issue record and the work-log `--did` text describe the work, never the
  vulnerability.
