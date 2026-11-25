'use strict';

// Keeps write-like-abhisek's scan.py and its worked examples in agreement:
// every "do not write like this" draft gets flagged, every "In Abhisek's
// voice" draft comes back clean.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const dir = path.join(__dirname, '..', 'core', 'skills', 'write-like-abhisek');
const skill = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8');

function scan(text) {
  const r = spawnSync('python3', [path.join(dir, 'scan.py')], { input: text, encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
}

const examples = [...skill.matchAll(/\*\*(.*?)\*\*\n((?:>.*\n)+)/g)]
  .map(([, title, body]) => ({ title, bad: /not write/.test(title), text: body.replace(/^> ?/gm, '') }));

test('the skill has bad and good worked examples', () => {
  assert.ok(examples.filter(e => e.bad).length >= 3);
  assert.ok(examples.filter(e => !e.bad).length >= 3);
});

for (const [i, e] of examples.entries()) {
  test(`example ${i} (${e.bad ? 'bad' : 'good'}): ${e.title}`, () => {
    const r = scan(e.text);
    if (e.bad) assert.match(r.out, /error|warning/, r.out);
    else assert.equal(r.out.trim(), '<stdin>: clean', r.out);
  });
}

test('errors exit 1, fixed phrases and code are ignored', () => {
  assert.equal(scan('We shipped it — finally.\n').code, 1);
  assert.equal(scan('I fixed two bugs.\n').code, 1);
  assert.equal(scan('We leverage the cache.\n').code, 1);
  const ok = scan('One of the tests failed. No one noticed.\n\n```\nfoo — bar, two\n```\n\nRun `delve()` at https://x.test/delve—two.\n');
  assert.equal(ok.code, 0, ok.out);
});

test('warnings flag hedges, trailing -ing, groups of 3 and repeated bold labels', () => {
  const r = scan('I think this might work.\nWe fixed the cache, improving load time.\nFast, simple, and reliable.\n**Performance:** This improves performance.\n');
  for (const w of ['hedges', 'trailing "-ing"', 'group of 3', 'bold label']) assert.match(r.out, new RegExp(w), r.out);
  assert.equal(r.code, 0);
});
