import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import YAML from 'yaml';
import { root, frontmatter } from '../scripts/lib.mjs';
import { versionFiles, parts, increment, nextPRVersion, rewriteVersion, validateVersions, checkPRVersion, assertVersionOnly } from '../scripts/version.mjs';
import { updatePR, pluginTree } from '../scripts/version-pr.mjs';
import { releaseNeeded, publishRelease } from '../scripts/release.mjs';

test('stable version policy increments once, preserves explicit releases, and rejects stale versions', () => {
  assert.equal(increment('1.9.9'), '1.9.10');
  assert.equal(increment('1.9.9', 'minor'), '1.10.0');
  assert.equal(increment('1.9.9', 'major'), '2.0.0');
  assert.equal(nextPRVersion('1.0.1', '1.0.1'), '1.0.2');
  assert.equal(nextPRVersion('1.0.1', '1.0.2'), '1.0.2');
  assert.equal(nextPRVersion('1.0.2', '1.0.1'), '1.0.3');
  assert.equal(nextPRVersion('1.0.2', '2.0.0'), '2.0.0');
  for (const version of ['v1.0.0', '1.01.0', '1.0.0-beta', '1.0', '1.0.9007199254740992']) assert.throws(() => parts(version));
  assert.throws(() => checkPRVersion('1.0.1', '1.0.1', true));
  assert.throws(() => checkPRVersion('1.0.1', '1.0.0', false));
  assert.doesNotThrow(() => checkPRVersion('1.0.1', '1.0.1', false));
});

test('all version copies agree and only version fields change', async () => {
  await validateVersions();
  for (const file of versionFiles) {
    const text = await fs.readFile(root + file, 'utf8');
    const before = JSON.parse(text);
    const after = JSON.parse(rewriteVersion(file, text, '9.8.7'));
    if (file.endsWith('marketplace.json')) before.plugins[0].version = '9.8.7';
    else { before.version = '9.8.7'; if (file === 'package-lock.json') before.packages[''].version = '9.8.7'; }
    assert.deepEqual(after, before);
    assert.doesNotThrow(() => assertVersionOnly(file, text, JSON.stringify(after)));
  }
  assert.throws(() => rewriteVersion('arbitrary.json', '{}', '1.0.1'));
  const pkg = await fs.readFile(root + 'package.json', 'utf8');
  const changed = JSON.parse(pkg); changed.scripts.test = 'untrusted-command';
  assert.throws(() => assertVersionOnly('package.json', pkg, JSON.stringify(changed)), /only version fields/);
});

async function prFixture({ changed = true, version = '1.0.0', baselineVersion = version, fork = false, race = false } = {}) {
  const calls = [];
  const contents = await Promise.all(versionFiles.map(async file => rewriteVersion(file, await fs.readFile(root + file, 'utf8'), version)));
  const tree = { sha: 'tree', tree: versionFiles.map((file, i) => ({ path: file, type: 'blob', mode: '100644', sha: `blob${i}` })) };
  const baseline = { sha: 'base-tree', tree: tree.tree.map(item => ({ ...item })) };
  baseline.tree.find(item => item.path === 'config/plugin.json').sha = 'base-config';
  if (changed) baseline.tree.find(item => item.path === 'plugins/wow-addon-dev/plugin.json').sha = 'old-plugin';
  let reads = 0;
  const api = async (route, options = {}) => {
    calls.push({ route, ...options });
    if (options.method) {
      if (route.endsWith('/git/trees')) return { sha: 'new-tree' };
      if (route.endsWith('/git/commits')) return { sha: 'new-commit' };
      return null;
    }
    if (route.endsWith('/pulls/1')) return { state: 'open', head: { sha: race && ++reads > 1 ? 'raced' : 'head', ref: 'feature', repo: { full_name: fork ? 'Other/repo' : 'Owner/repo' } }, base: { ref: 'main' } };
    if (route.endsWith('/git/ref/heads/main')) return { object: { sha: 'base' } };
    if (route.endsWith('/git/trees/base?recursive=1')) return baseline;
    if (route.endsWith('/git/trees/head?recursive=1')) return tree;
    if (route.endsWith('/git/blobs/base-config')) {
      const content = rewriteVersion('config/plugin.json', contents[0], baselineVersion);
      return { encoding: 'base64', size: content.length, content: Buffer.from(content).toString('base64') };
    }
    const match = route.match(/\/git\/blobs\/blob(\d+)$/);
    if (match) return { encoding: 'base64', size: contents[+match[1]].length, content: Buffer.from(contents[+match[1]]).toString('base64') };
    throw new Error(`Unexpected route: ${route}`);
  };
  return { api, calls };
}

test('PR bot edits only fixed JSON files, creates one non-forced commit, and dispatches validation', async () => {
  const { api, calls } = await prFixture();
  assert.equal(await updatePR(api, 'Owner/repo', 1), 'versioned 1.0.1');
  const edits = calls.find(call => call.route.endsWith('/git/trees') && call.method).body;
  assert.equal(edits.base_tree, 'tree');
  assert.deepEqual(edits.tree.map(file => file.path), versionFiles);
  const commit = calls.find(call => call.route.endsWith('/git/commits')).body;
  assert.deepEqual(commit.parents, ['head']);
  assert.equal(calls.find(call => call.method === 'PATCH').body.force, false);
  assert.ok(calls.at(-1).route.endsWith('/validate.yml/dispatches'));
});

test('already bumped PRs do not get extra commits and failed validation dispatch can be retried', async () => {
  const { api, calls } = await prFixture({ version: '1.0.1', baselineVersion: '1.0.0' });
  assert.equal(await updatePR(api, 'Owner/repo', 1), 'already-versioned');
  assert.ok(calls.every(call => call.method !== 'PATCH'));
  assert.ok(calls.at(-1).route.endsWith('/validate.yml/dispatches'));
});

test('PR bot skips forks and unchanged plugins, rejects incomplete trees and racing heads', async () => {
  for (const settings of [{ fork: true }, { changed: false }]) {
    const { api, calls } = await prFixture(settings);
    await updatePR(api, 'Owner/repo', 1);
    assert.ok(calls.every(call => !call.method));
  }
  const { api, calls } = await prFixture({ race: true });
  await assert.rejects(updatePR(api, 'Owner/repo', 1), /PR changed/);
  assert.ok(calls.every(call => call.method !== 'PATCH'));
  assert.throws(() => pluginTree({ truncated: true, tree: [] }));
});

test('releases require an increase or manual recovery; lower versions fail', () => {
  assert.equal(releaseNeeded('1.0.0', '1.0.0'), false);
  assert.equal(releaseNeeded('1.0.0', '1.0.1'), true);
  assert.equal(releaseNeeded(null, '1.0.1'), true);
  assert.equal(releaseNeeded('1.0.0', '1.0.0', true), true);
  assert.throws(() => releaseNeeded('2.0.0', '1.0.1'));
});

test('release publication uploads assets before publishing and recovers draft failures', async () => {
  const calls = [], commands = [], sha = 'a'.repeat(40);
  const api = async (route, options) => { calls.push({ route, ...options }); return null; };
  const args = { api, repository: 'Owner/repo', sha, version: '1.0.1', assets: ['plugin.zip', 'SHA256SUMS'], gh: async command => { commands.push(command); } };
  assert.equal(await publishRelease(args), 'published');
  assert.equal(calls.at(-1).body.sha, sha);
  assert.deepEqual(commands.map(command => command[1]), ['create', 'upload', 'edit']);
  assert.ok(commands[0].includes('--verify-tag'));
  commands.length = 0;
  const draftAPI = async route => route.includes('/git/ref/') ? { object: { type: 'commit', sha } } : { draft: true };
  await publishRelease({ ...args, api: draftAPI });
  assert.deepEqual(commands.map(command => command[1]), ['upload', 'edit']);
  commands.length = 0;
  await assert.rejects(publishRelease({ ...args, gh: async command => { commands.push(command); if (command[1] === 'upload') throw new Error('Upload failed'); } }), /Upload failed/);
  assert.ok(commands.every(command => command[1] !== 'edit'));
});

test('release reruns do not overwrite published assets or move an existing tag', async () => {
  const sha = 'a'.repeat(40), commands = [];
  const args = { repository: 'Owner/repo', sha, version: '1.0.1', assets: [], gh: command => commands.push(command) };
  assert.equal(await publishRelease({ ...args, api: async route => route.includes('/git/ref/') ? { object: { type: 'commit', sha } } : { draft: false } }), 'already-published');
  assert.equal(commands.length, 0);
  await assert.rejects(publishRelease({ ...args, api: async () => ({ object: { type: 'commit', sha: 'b'.repeat(40) } }) }), /another commit/);
});

test('workflow boundaries use trusted version code and require validation before release', async () => {
  const version = YAML.parse(await fs.readFile(root + '.github/workflows/version-pr.yml', 'utf8'));
  assert.ok(version.on.pull_request_target);
  assert.equal(version.jobs.version.steps[0].with.ref, 'refs/heads/main');
  assert.equal(version.jobs.version.steps[0].with['persist-credentials'], false);
  assert.ok(version.jobs.version.steps.every(step => !step.run || step.run === 'node scripts/version-pr.mjs'));
  const release = YAML.parse(await fs.readFile(root + '.github/workflows/release.yml', 'utf8'));
  assert.equal(release.jobs.publish.needs, 'validate');
  assert.equal(release.jobs.validate.uses, './.github/workflows/validate.yml');
  assert.equal(release.jobs.publish.permissions.contents, 'write');
  const updater = YAML.parse(frontmatter(await fs.readFile(root + '.github/workflows/update-wow-api.md', 'utf8')).yaml);
  assert.match(updater['post-steps'][0].run, /node scripts\/version.mjs guard/);
  assert.match(updater['post-steps'][0].run, /node scripts\/version.mjs check/);
  for (const file of versionFiles) assert.ok(updater['safe-outputs']['create-pull-request']['allowed-files'].includes(file));
});
