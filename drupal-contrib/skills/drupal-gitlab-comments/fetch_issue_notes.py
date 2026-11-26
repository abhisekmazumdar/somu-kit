#!/usr/bin/env python3
"""
Fetch and display top-level comments (notes) on a GitLab issue / work item
on git.drupalcode.org. Used for Drupal.org projects whose issue queue has
migrated to GitLab work items (e.g. `project/ai`).

Usage:
    python3 fetch_issue_notes.py <URL_OR_REF>

Accepted inputs:
    - Work item URL:   https://git.drupalcode.org/project/<name>/-/work_items/<nid>
    - Legacy URL:      https://git.drupalcode.org/project/<name>/-/issues/<nid>
    - Shorthand ref:   project/<name>#<nid>          (e.g. project/ai#3577170)

Auth:
    Calls `glab api`, so it uses your `glab auth login -h git.drupalcode.org`
    (or GITLAB_TOKEN). Issue notes need auth even on public projects.

Output: chronological list of non-system notes. System notes (assignments,
label changes, status updates) are filtered out.
"""

import json
import re
import subprocess
import sys

HOST = "git.drupalcode.org"


def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def fetch(endpoint):
    """GET an API endpoint through `glab api`, which owns auth (keyring,
    OAuth refresh, GITLAB_TOKEN). Same pattern as drupal-gitlab/create_mr.py."""
    cmd = ["glab", "api", "--hostname", HOST, endpoint]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
    except FileNotFoundError:
        die("glab not found: install it and run `glab auth login -h git.drupalcode.org`.")
    if result.returncode != 0:
        err = (result.stderr or result.stdout).strip()
        if "401" in err:
            die("401 Unauthorized: run `glab auth login -h git.drupalcode.org`.")
        if "404" in err:
            die(f"404 Not Found: check the project name and ID ({endpoint}).")
        die(f"glab api {endpoint} failed: {err[:300]}")
    return json.loads(result.stdout)


def parse_input(arg):
    """Return (encoded_project_path, iid) from a URL or shorthand ref."""
    # Shorthand: project/<name>#<iid>
    m = re.match(r"([\w./-]+)#(\d+)$", arg.strip())
    if m:
        return m.group(1).replace("/", "%2F"), m.group(2)

    # URL: /-/work_items/<iid> or /-/issues/<iid>
    m = re.match(
        r"https?://git\.drupalcode\.org/(.+?)/-/(?:work_items|issues)/(\d+)",
        arg.rstrip("/"),
    )
    if not m:
        die(
            "Cannot parse input.\n"
            "Expected one of:\n"
            "  https://git.drupalcode.org/<project>/-/work_items/<nid>\n"
            "  https://git.drupalcode.org/<project>/-/issues/<nid>\n"
            "  project/<name>#<nid>"
        )
    return m.group(1).replace("/", "%2F"), m.group(2)

def fetch_all_notes(project, iid):
    notes = []
    page = 1
    while True:
        batch = fetch(f"projects/{project}/issues/{iid}/notes?per_page=100&page={page}&sort=asc")
        if not isinstance(batch, list):
            die(f"Unexpected response: {batch}")
        notes.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return notes


def print_note(n):
    created = (n.get("created_at") or "")[:10] or "?"
    print(f"#{n['id']} @{n['author']['username']} ({created})")
    body = (n.get("body") or "").rstrip()
    if not body:
        print("  <empty>")
    else:
        for line in body.splitlines():
            print(f"  {line}")
    print()


def main():
    if len(sys.argv) < 2:
        die("Usage: python3 fetch_issue_notes.py <URL_OR_REF>")

    project, iid = parse_input(sys.argv[1])
    all_notes = fetch_all_notes(project, iid)

    real = [n for n in all_notes if not n.get("system")]
    system_count = len(all_notes) - len(real)

    print(
        f"{len(real)} comments ({system_count} system notes filtered) — "
        f"project={project.replace('%2F', '/')} issue={iid}\n"
    )
    for n in real:
        print_note(n)


if __name__ == "__main__":
    main()
