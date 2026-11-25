#!/usr/bin/env python3
"""Scan a draft for patterns write-like-abhisek bans.

Usage: python3 scan.py <file>...   (or pipe text on stdin)

Errors (exit 1): em dashes, spelled-out counts, banned words.
Warnings (exit 0): praise openers, stacked hedges, trailing -ing clauses,
groups of 3, bold labels that repeat their line, summary endings.

Code (fenced blocks and `inline`) and URLs are ignored.
"""

import re
import sys

NUMBER_WORDS = (
    "two three four five six seven eight nine ten eleven twelve thirteen "
    "fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty "
    "forty fifty sixty seventy eighty ninety hundred thousand"
).split()
# Phrases where the word isn't a count.
NUMBER_EXCEPTIONS = re.compile(
    r"\b(two-factor|two-way|one or two|a hundred percent)\b", re.I)

BANNED = [
    r"delve[sd]?", r"delving", r"tapestry", r"leverag(e|es|ed|ing)",
    r"utili[sz](e|es|ed|ing)", r"pivotal", r"crucial", r"underscor(e|es|ed|ing)",
    r"testament", r"showcas(e|es|ed|ing)", r"foster(s|ed|ing)?", r"bolster(s|ed|ing)?",
    r"garner(s|ed|ing)?", r"intricate", r"nuanced", r"landscape", r"north star",
    r"synerg(y|ies)", r"seamless(ly)?", r"cutting-edge", r"game[- ]changer",
    r"in conclusion", r"furthermore", r"moreover", r"additionally",
    r"it is worth noting", r"serves as", r"stands as",
    r"i hope this helps", r"as you can see",
    r"we are (thrilled|excited) to announce", r"after careful consideration",
    r"upon further reflection",
]
BANNED_RE = re.compile(r"\b(" + "|".join(BANNED) + r")\b", re.I)

PRAISE_OPENER = re.compile(
    r"^\W*(great (question|work|job|catch|point)|excellent|awesome|amazing|"
    r"fantastic|love this|what a (great|fantastic|wonderful)|nice work)\b", re.I)
HEDGES = re.compile(
    r"\b(i think|i believe|perhaps|possibly|probably|maybe|might|"
    r"it seems|seems to|somewhat|arguably|could potentially)\b", re.I)
SUMMARY_ENDING = re.compile(r"(^|[.!?]\s+)(overall|in summary|to sum up|all in all),", re.I)
TRAILING_ING = re.compile(r",\s+([a-z]+ing)\b[^.!?\n]*[.!?]")
ING_NOT_VERBS = {"thing", "something", "anything", "nothing", "everything",
                 "string", "during", "morning", "evening", "spring", "king"}
GROUP_OF_3 = re.compile(r"\b(\w+(?: \w+)?), (\w+(?: \w+)?),? and (\w+)\b")
BOLD_LABEL = re.compile(r"\*\*([^*:]{2,40}):?\*\*:?\s*(.+)")


def strip_code(text):
    """Blank out fenced code, inline code and URLs, keeping line numbers."""
    def blank(m):
        return re.sub(r"[^\n]", " ", m.group(0))
    text = re.sub(r"```.*?```", blank, text, flags=re.S)
    text = re.sub(r"`[^`\n]*`", blank, text)
    text = re.sub(r"https?://\S+", blank, text)
    return text


def scan(text):
    errors, warnings = [], []
    lines = strip_code(text).split("\n")
    hedge_hits = []
    first_text_line = next((i for i, l in enumerate(lines) if l.strip()), None)
    for i, line in enumerate(lines, 1):
        if "—" in line:
            errors.append((i, "em dash: use a period, comma, colon or parentheses"))
        clean = NUMBER_EXCEPTIONS.sub("", line)
        for w in re.findall(r"\b(" + "|".join(NUMBER_WORDS) + r")\b", clean, re.I):
            errors.append((i, f'spelled-out count "{w}": use digits'))
        for m in BANNED_RE.finditer(line):
            errors.append((i, f'banned word "{m.group(0)}"'))
        if first_text_line is not None and i - 1 == first_text_line:
            if PRAISE_OPENER.search(line.lstrip("> ")):
                warnings.append((i, "praise opener: thank once if it's real, then get to the point"))
        hedge_hits += [(i, m.group(0)) for m in HEDGES.finditer(line)]
        if SUMMARY_ENDING.search(line):
            warnings.append((i, "summary ending: cut the recap, end on the ask or the fact"))
        for m in TRAILING_ING.finditer(line):
            if m.group(1).lower() not in ING_NOT_VERBS:
                warnings.append((i, f'trailing "-ing" clause ("{m.group(1)}..."): split into its own sentence'))
        for m in GROUP_OF_3.finditer(line):
            warnings.append((i, f'group of 3 ("{m.group(0)}"): keep only what is true and specific'))
        m = BOLD_LABEL.search(line)
        if m:
            label = {w for w in re.findall(r"[a-z]+", m.group(1).lower()) if len(w) > 3}
            rest = set(re.findall(r"[a-z]+", m.group(2).lower()))
            if label and label <= rest:
                warnings.append((i, f'bold label "{m.group(1)}" repeats its line'))
    if len(hedge_hits) > 1:
        words = ", ".join(f'"{w}" (line {n})' for n, w in hedge_hits)
        warnings.append((hedge_hits[1][0], f"{len(hedge_hits)} hedges, keep at most 1: {words}"))
    return errors, warnings


def main(argv):
    sources = [(p, open(p, encoding="utf-8").read()) for p in argv[1:]] or [("<stdin>", sys.stdin.read())]
    total_errors = 0
    for name, text in sources:
        errors, warnings = scan(text)
        for n, msg in sorted(errors):
            print(f"{name}:{n}: error: {msg}")
        for n, msg in sorted(warnings):
            print(f"{name}:{n}: warning: {msg}")
        total_errors += len(errors)
        if not errors and not warnings:
            print(f"{name}: clean")
    return 1 if total_errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
