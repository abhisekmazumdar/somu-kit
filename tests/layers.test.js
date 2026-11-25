'use strict';

// Layer rule: drupal-contrib -> drupal -> core. core is generic and never
// mentions Drupal, so it stays usable in any project.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const core = path.join(__dirname, '..', 'core');

test('core never mentions Drupal', () => {
  const files = fs.readdirSync(core, { recursive: true })
    .filter(f => !f.startsWith(path.join('evals', 'results')) && fs.statSync(path.join(core, f)).isFile());
  assert.ok(files.length > 5);
  for (const f of files) {
    assert.doesNotMatch(fs.readFileSync(path.join(core, f), 'utf8'), /drupal/i, `core/${f}`);
  }
});
