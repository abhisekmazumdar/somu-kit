'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { src, skillNames, listFiles } = require('./layout');
const read = (file) => fs.readFileSync(src(file), 'utf8');
const url = 'https://www.drupal.org/docs/develop/issues/issue-procedures-and-etiquette/policy-on-the-use-of-ai-when-contributing-to-drupal#s-disclosure';
const statement = 'Used AI to help with <uses> (<what it did>). The reasoning and positions are my own, and I reviewed everything before posting.';
// GitLab collapses it under a visible toggle; the link can't sit in <summary>, where a click only toggles.
const block = `<details><summary>AI disclosure</summary>\n\n_${statement} ([Drupal.org AI policy](${url}))_\n\n</details>`;
const html = `<em><a href="${url}">AI disclosure</a>: ${statement}</em>`;

// One format everywhere a post is drafted; drupalorg-writing holds the full rules.
for (const file of [
  'skills/drupalorg-writing/SKILL.md',
  'skills/drupal-gitlab/SKILL.md',
  'skills/drupal-gitlab/references/merge-requests.md',
  'templates/CLAUDE.md.template',
  'templates/AGENTS.md.template',
]) test(`${file} uses the standard AI disclosure block`, () => {
  // Ignore indentation, so the block can sit inside a list item.
  assert.ok(read(file).replace(/^[ \t]+/gm, '').includes(block));
});

test('classic Drupal.org keeps the one-line HTML disclosure', () => {
  // <details> isn't verified to survive Drupal.org's text filter.
  assert.ok(read('skills/drupalorg-writing/SKILL.md').includes(html));
});

test('Claude Code adds no attribution of its own', () => {
  // Older Claude Code versions reject `attribution: false`, so hide each part explicitly.
  const settings = JSON.parse(read('templates/settings.json.template').replace(/\{\{[A-Z_]+\}\}/g, 'placeholder'));
  assert.deepEqual(settings.attribution, { commit: '', pr: '', sessionUrl: false });
});

test('no legacy or tool-naming disclosure formats remain', () => {
  const files = ['skills', 'agents'].flatMap((dir) => listFiles(dir))
    .filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const text = read(file);
    assert.doesNotMatch(text, /Used \[tool\]|_AI assisted|_\[AI disclosure\]/, file);
    for (const disclosure of text.match(/Used AI to help with [^\n]*/g) ?? []) {
      assert.doesNotMatch(disclosure, /Claude|Codex|GPT|Gemini|Copilot/, file);
    }
  }
});
