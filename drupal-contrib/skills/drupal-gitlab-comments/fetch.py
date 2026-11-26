#!/usr/bin/env python3
"""
Fetch and display review comments from a Drupal GitLab MR — both inline diff
threads and general (non-inline) comments posted on the MR overview tab.

Usage:
    python3 fetch.py <MR_URL>

Example:
    python3 fetch.py https://git.drupalcode.org/project/ai/-/merge_requests/899

Auth:
    Calls `glab api`, so it uses your `glab auth login -h git.drupalcode.org`
    (or GITLAB_TOKEN).
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


def parse_url(url):
    """Extract URL-encoded project path and MR IID from a GitLab MR URL."""
    m = re.match(
        r"https://git\.drupalcode\.org/(.+?)/-/merge_requests/(\d+)", url.rstrip("/")
    )
    if not m:
        die(f"Cannot parse MR URL: {url}\nExpected: https://git.drupalcode.org/<project>/-/merge_requests/<iid>")
    project_encoded = m.group(1).replace("/", "%2F")
    mr_iid = m.group(2)
    return project_encoded, mr_iid

def fetch_all_discussions(project, mr_iid):
    """Fetch all discussion pages and return combined list."""
    discussions = []
    page = 1
    while True:
        batch = fetch(f"projects/{project}/merge_requests/{mr_iid}/discussions?per_page=100&page={page}")
        if not isinstance(batch, list):
            die(f"Unexpected response from API: {batch}")
        discussions.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return discussions


def extract_threads(discussions):
    """Extract inline diff threads and general (non-inline) MR comments, skipping system notes."""
    threads = []
    for d in discussions:
        notes = d.get("notes", [])
        if not notes:
            continue
        root = notes[0]
        if root.get("system"):
            continue
        pos = root.get("position")
        if pos:
            file_path = pos.get("new_path") or pos.get("old_path", "")
            line = pos.get("new_line") or pos.get("old_line") or "?"
            general = False
        else:
            # General MR comment (overview/discussion tab) — not anchored to a diff line.
            file_path = None
            line = None
            general = True
        resolved = d.get("resolved", False)
        replies = notes[1:]
        last_reply = replies[-1] if replies else None
        threads.append({
            "resolved": resolved,
            "general": general,
            "id": root["id"],
            "author": root["author"]["username"],
            "created_at": root.get("created_at", ""),
            "file": file_path,
            "line": line,
            "body": root["body"],
            "reply_count": len(replies),
            "last_reply_author": last_reply["author"]["username"] if last_reply else None,
            "last_reply_body": last_reply["body"][:120] if last_reply else None,
            "last_reply_at": last_reply.get("created_at", "") if last_reply else None,
        })
    return threads


def sort_key(t):
    line = t["line"] if isinstance(t["line"], int) else 0
    return (t["file"], line)


def general_sort_key(t):
    return t["created_at"]


def print_thread(t):
    status = "RESOLVED" if t["resolved"] else "OPEN"
    created = t["created_at"][:10] if t["created_at"] else "?"
    print(f"[{status}] #{t['id']} @{t['author']} ({created})")
    if t["general"]:
        print("  General MR comment")
    else:
        print(f"  File: {t['file']}:{t['line']}")
    # Print body, indenting continuation lines
    body_lines = t["body"].splitlines()
    print(f"  Comment: {body_lines[0]}")
    for bl in body_lines[1:]:
        print(f"           {bl}")
    if t["last_reply_author"]:
        last_at = t["last_reply_at"][:10] if t["last_reply_at"] else "?"
        print(f"  Replies: {t['reply_count']} — last by @{t['last_reply_author']} ({last_at}): {t['last_reply_body']}")
    print()


def main():
    if len(sys.argv) < 2:
        die("Usage: python3 fetch.py <MR_URL>")

    url = sys.argv[1]
    project, mr_iid = parse_url(url)

    discussions = fetch_all_discussions(project, mr_iid)
    threads = extract_threads(discussions)

    inline = [t for t in threads if not t["general"]]
    general = [t for t in threads if t["general"]]

    open_threads = sorted([t for t in inline if not t["resolved"]], key=sort_key)
    resolved_threads = sorted([t for t in inline if t["resolved"]], key=sort_key)
    general_threads = sorted(general, key=general_sort_key)
    files_affected = len(set(t["file"] for t in inline))

    print(
        f"{len(open_threads)} open threads, {len(resolved_threads)} resolved, "
        f"{len(general_threads)} general comments — {files_affected} files affected\n"
    )

    for t in open_threads:
        print_thread(t)

    if resolved_threads:
        print("--- RESOLVED ---\n")
        for t in resolved_threads:
            print_thread(t)

    if general_threads:
        print("--- GENERAL COMMENTS ---\n")
        for t in general_threads:
            print_thread(t)


if __name__ == "__main__":
    main()
