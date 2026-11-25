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
    'skills/drupalorg-writing/SKILL.md',
    'skills/drupal-issue-start/SKILL.md',
    'skills/issue-record-update/SKILL.md',
    'skills/issue-record-update/references/review-card.md',
    'agents/drupal-issue-agent.md',
  ]) {
    assert.doesNotMatch(flat(rel), /\b(RTBC|Close|Needs work|Needs discussion)\b[^"`\n]{0,3}—/i, rel);
  }
  assert.match(read('skills/drupalorg-writing/SKILL.md'), /No em dashes \(—\) anywhere in a draft/);
});

test('AI is never a co-decider in drafting guidance', () => {
  const voice = fs.readFileSync(require('node:path').join(__dirname, '../../core/skills/write-like-abhisek/SKILL.md'), 'utf8');
  for (const [name, text] of [['write-like-abhisek', voice], ['drupalorg-writing', read('skills/drupalorg-writing/SKILL.md')]]) {
    assert.doesNotMatch(text, /with (Claude|AI)[^.\n]*we both/i, name);
    assert.doesNotMatch(text, /back-and-forth with Claude/i, name);
  }
});

test('SSH remotes use 1 host: git.drupal.org', () => {
  for (const rel of [...listFiles('skills'), ...listFiles('agents')].filter(f => f.endsWith('.md'))) {
    for (const line of read(rel).split('\n')) {
      assert.doesNotMatch(line, /git@git\.drupalcode\.org:/, `${rel}: ${line.trim()}`);
    }
  }
});

test('new static follows Drupal: ignore it like core, never make classes final', () => {
  const row = read('agents/drupal-issue-agent/references/ci-failure-patterns.md').split('\n').find(l => l.includes('Unsafe usage of new static'));
  assert.match(row, /ignoreErrors/);
  assert.match(row, /Don't make the class `final`/);
});

test('PHPUnit guidance prefers attributes everywhere', () => {
  const standards = read('skills/drupal-coding-standards/SKILL.md');
  assert.doesNotMatch(standards, /Replace with `@covers`/, 'drupal-coding-standards tells you to drop attributes');
  assert.match(standards, /New tests use attributes/);
  assert.match(standards, /Never remove the docblocks there/);
});
