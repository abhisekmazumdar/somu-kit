'use strict';

// Maps the repo-relative paths the tests use ('skills/<name>/...',
// 'agents/...', 'docs/...', 'bin/...', 'templates/...') onto the somu-kit
// layout: skills split across the drupal and drupal-contrib plugins, agents
// in drupal-contrib, docs at the repo root, everything else in installer/.

const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..', '..');
const installer = path.resolve(__dirname, '..');
const skillRoots = ['drupal', 'drupal-contrib'].map(plugin => path.join(repo, plugin, 'skills'));

function skillNames() {
  return skillRoots.flatMap(root => fs.readdirSync(root)
    .filter(name => fs.statSync(path.join(root, name)).isDirectory()));
}

function src(...parts) {
  const rel = path.join(...parts).split(path.sep).join('/');
  const [top, name] = rel.split('/');
  if (top === 'skills') {
    if (!name) throw new Error("src('skills') spans 2 plugins: use skillNames()");
    const root = skillRoots.find(r => fs.existsSync(path.join(r, name))) ?? skillRoots[1];
    return path.join(root, rel.slice('skills/'.length));
  }
  if (top === 'agents') return path.join(repo, 'drupal-contrib', rel);
  if (top === 'docs') return path.join(repo, rel);
  return path.join(installer, rel);
}

// Every file under 'skills' or 'agents', as repo-relative paths src() accepts.
function listFiles(dir) {
  const roots = dir === 'skills' ? skillRoots : [src(dir)];
  return roots.flatMap(root => fs.readdirSync(root, { recursive: true }).map(f => path.join(dir, f)));
}

module.exports = { src, skillNames, listFiles };
