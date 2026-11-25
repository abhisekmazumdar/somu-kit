'use strict';

// Drafts have 1 home: issues/<nid>/drafts/. An older comments/ path once
// coexisted with it, so drafts landed in 2 places depending on the skill.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { src, listFiles } = require('./layout');

test('every draft path is issues/<nid>/drafts/', () => {
  const files = [...listFiles('skills'), ...listFiles('agents'), ...listFiles('templates')]
    .filter(f => /\.(md|template)$/.test(f));
  assert.ok(files.length > 20, 'expected to scan the skills, agents and templates');
  for (const file of files) {
    assert.doesNotMatch(fs.readFileSync(src(file), 'utf8'), /issues\/<nid>\/comments\b/, file);
  }
});

const read = rel => fs.readFileSync(src(rel), 'utf8');
const flat = rel => read(rel).replace(/\s+/g, ' ');

test('verdict and confidence examples use no em dash, so drafts copy none', () => {
  for (const rel of [
    'skills/drupalorg-comment-format/SKILL.md',
    'skills/drupal-issue-start/SKILL.md',
    'skills/issue-record-update/SKILL.md',
    'skills/issue-record-update/references/review-card.md',
    'agents/drupal-issue-agent.md',
  ]) {
    assert.doesNotMatch(flat(rel), /\b(RTBC|Close|Needs work|Needs discussion)\b[^"`\n]{0,3}—/i, rel);
  }
  assert.match(read('skills/drupalorg-comment-format/SKILL.md'), /No em dashes \(—\) anywhere in a draft/);
});

test('AI is never a co-decider in drafting guidance', () => {
  const voice = fs.readFileSync(require('node:path').join(__dirname, '../../core/skills/write-like-abhisek/SKILL.md'), 'utf8');
  for (const [name, text] of [['write-like-abhisek', voice], ['drupalorg-comment-format', read('skills/drupalorg-comment-format/SKILL.md')]]) {
    assert.doesNotMatch(text, /with (Claude|AI)[^.\n]*we both/i, name);
    assert.doesNotMatch(text, /back-and-forth with Claude/i, name);
  }
});

test('SSH remotes use git.drupal.org (git.drupalcode.org has no SSH listener)', () => {
  for (const rel of [...listFiles('skills'), ...listFiles('agents')].filter(f => f.endsWith('.md'))) {
    for (const line of read(rel).split('\n')) {
      if (/hangs|no SSH listener|not git\.drupalcode\.org/.test(line)) continue;
      assert.doesNotMatch(line, /git@git\.drupalcode\.org:/, `${rel}: ${line.trim()}`);
    }
  }
});

test('CI failure fixes fix the cause instead of silencing the check', () => {
  const patterns = read('agents/drupal-issue-agent/references/ci-failure-patterns.md');
  for (const row of patterns.split('\n').filter(l => l.startsWith('| `'))) {
    const fix = row.split('|')[3] ?? '';
    if (/ignoreErrors/.test(fix)) assert.match(fix, /only when/, `bare suppression: ${row}`);
  }
});

test('PHPUnit guidance prefers attributes everywhere', () => {
  const standards = read('skills/drupal-coding-standards/SKILL.md');
  assert.doesNotMatch(standards, /Replace with `@covers`/, 'drupal-coding-standards tells you to drop attributes');
  assert.match(standards, /Use attributes/);
});
