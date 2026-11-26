'use strict';

// Naming and structure checks for every plugin. They catch the problems a
// rename or a move leaves behind: a name that no longer matches its folder,
// a path to a file that moved, an old name coming back, 2 skills claiming
// the same trigger, or a file the plugin loader would misread.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.join(__dirname, '..');
const LAYERS = ['core', 'drupal', 'drupal-contrib']; // a layer may use only layers before it

// Names we renamed or removed. They must not come back.
const RETIRED = ['drupalorg-comment-format', 'drupal-gitlab-inline-comments', 'drupal-automated-testing', 'drupal-gitlab-comments'];

const read = rel => fs.readFileSync(path.join(repo, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(repo, rel));
const dirs = rel => exists(rel) ? fs.readdirSync(path.join(repo, rel)).filter(n => fs.statSync(path.join(repo, rel, n)).isDirectory()) : [];
const files = rel => fs.readdirSync(path.join(repo, rel), { recursive: true }).map(f => path.join(rel, f)).filter(f => fs.statSync(path.join(repo, f)).isFile());

const skills = LAYERS.flatMap(layer => dirs(`${layer}/skills`).map(name => ({ layer, name, file: `${layer}/skills/${name}/SKILL.md` })));
const agents = LAYERS.flatMap(layer => exists(`${layer}/agents`)
  ? fs.readdirSync(path.join(repo, layer, 'agents')).map(f => ({ layer, name: f.replace(/\.md$/, ''), file: `${layer}/agents/${f}` }))
  : []);
const externals = [...read('installer/bin/setup.js').matchAll(/^\s+name: '([a-z0-9-]+)',$/gm)].map(m => m[1]);
const texts = LAYERS.flatMap(layer => files(layer)).filter(f => /\.(md|json|py|js|sh)$/.test(f) && !f.includes(`evals${path.sep}results`));

function frontmatter(file) {
  const m = read(file).match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, `${file} has no frontmatter`);
  const name = m[1].match(/^name:\s*(\S+)/m)?.[1];
  const desc = m[1].match(/^description:\s*(?:>\n((?:[ \t]+.*\n?)+)|(.+))/m);
  const description = (desc?.[1] ?? desc?.[2] ?? '').replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
  return { name, description };
}

test('every skill and agent name matches its folder or file', () => {
  assert.ok(skills.length > 20 && agents.length >= 4);
  for (const { name, file } of [...skills, ...agents]) assert.equal(frontmatter(file).name, name, file);
});

test('every description is set and within the 1,024 character limit', () => {
  for (const { file } of [...skills, ...agents]) {
    const { description } = frontmatter(file);
    assert.ok(description.length > 40, `${file}: description too short`);
    assert.ok(description.length <= 1024, `${file}: description is ${description.length} chars`);
  }
});

test('retired names never come back', () => {
  for (const f of [...texts, 'CLAUDE.md', 'README.md', ...files('installer/bin'), ...files('installer/templates')]) {
    for (const old of RETIRED) assert.ok(!read(f).includes(old), `${f} still says ${old}`);
  }
});

test('no 2 skills or agents claim the same quoted trigger phrase', () => {
  const seen = new Map();
  for (const { file } of [...skills, ...agents]) {
    for (const [, phrase] of frontmatter(file).description.matchAll(/"([^"]{6,})"/g)) {
      const key = phrase.toLowerCase();
      assert.ok(!seen.has(key), `"${phrase}" is in ${seen.get(key)} and ${file}`);
      seen.set(key, file);
    }
  }
});

test('plugin paths point at a file in the same plugin', () => {
  for (const f of texts) {
    const layer = f.split(path.sep)[0];
    for (const [, rel] of read(f).matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]+[A-Za-z0-9_])/g)) {
      assert.ok(exists(`${layer}/${rel}`), `${f}: ${rel} is not in ${layer}/`);
    }
  }
});

test('<skills-root> is only for external skills', () => {
  for (const f of texts) {
    for (const [, name] of read(f).matchAll(/<skills-root>\/([a-z0-9-]+)/g)) {
      assert.ok(externals.includes(name), `${f}: use \${CLAUDE_PLUGIN_ROOT}/skills/${name}, not <skills-root>`);
    }
  }
});

test('script paths are unquoted, so permission rules can match them', () => {
  for (const f of texts) assert.doesNotMatch(read(f), /python3 "\$\{CLAUDE_(PLUGIN_ROOT|SKILL_DIR)\}/, f);
});

test('a layer never names a skill or agent from a layer above it', () => {
  for (const [i, layer] of LAYERS.entries()) {
    const above = [...skills, ...agents].filter(s => LAYERS.indexOf(s.layer) > i).map(s => s.name);
    const own = new Set([...skills, ...agents].filter(s => s.layer === layer).map(s => s.name));
    for (const f of texts.filter(t => t.startsWith(layer + path.sep))) {
      for (const name of above.filter(n => !own.has(n))) {
        assert.doesNotMatch(read(f), new RegExp(`(?<![\\w-])${name}(?![\\w-])`), `${f} names ${name}`);
      }
    }
  }
});

test('agents/ holds only agent files: the plugin loader reads every .md in it as an agent', () => {
  for (const layer of LAYERS) {
    if (!exists(`${layer}/agents`)) continue;
    for (const f of files(`${layer}/agents`)) assert.equal(path.dirname(f), path.join(layer, 'agents'), `${f}: move reference files into a skill`);
  }
});

test('the marketplace lists every layer, without versions, depending only downward', () => {
  const market = JSON.parse(read('.claude-plugin/marketplace.json'));
  assert.deepEqual(market.plugins.map(p => p.name), LAYERS);
  for (const [i, entry] of market.plugins.entries()) {
    assert.equal(entry.source, `./${entry.name}`);
    assert.equal(entry.version, undefined, `${entry.name}: a version in the marketplace stops updates`);
    const manifest = JSON.parse(read(`${entry.name}/.claude-plugin/plugin.json`));
    assert.equal(manifest.name, entry.name);
    assert.equal(manifest.version, undefined, `${entry.name}: every push is an update, so no version`);
    assert.deepEqual(manifest.dependencies ?? [], LAYERS.slice(0, i).reverse(), `${entry.name} dependencies`);
  }
});
