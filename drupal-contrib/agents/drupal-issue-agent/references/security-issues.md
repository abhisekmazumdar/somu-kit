# Security issues (`is_security=true`)

Read this before A2/B4 when `is_security=true`. These rules override every
step that clones, adds a remote, pushes, or opens an MR. The short rules in
the agent's "Security issues" section still apply.

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
