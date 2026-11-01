import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkUpstream } from '../scripts/check-upstream.mjs';
import { fingerprint, registryPath } from '../scripts/upstream.mjs';
import { branches } from '../skills/wow-client-targets/scripts/targets.mjs';

const baselineCommit = 'a'.repeat(40);
const changedCommit = 'b'.repeat(40);
const sourceTree = sha => ({ tree: [{ type: 'blob', path: 'version.txt', sha }, { type: 'blob', path: 'Interface/AddOns/API.lua', sha }], truncated: false });
const before = sourceTree('before');
const after = sourceTree('after');

async function fixture(t) {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'wow-upstream-preflight-'));
  t.after(async () => {
    const resolved = path.resolve(workspace);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('wow-upstream-preflight-')) throw new Error('Unexpected temporary directory');
    await fs.rm(resolved, { recursive: true, force: true });
  });
  const registry = { targets: Object.fromEntries(Object.keys(branches).map(id => [id, { commit: baselineCommit, version: '1.0.0.1', fingerprint: fingerprint(before) }])) };
  await fs.mkdir(path.dirname(path.join(workspace, registryPath)), { recursive: true });
  await fs.writeFile(path.join(workspace, registryPath), JSON.stringify(registry));
  const reportPath = path.join(workspace, '.cache/upstream-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, '{"stale":true}\n');
  const env = { GITHUB_REPOSITORY: 'owner/repo', GITHUB_OUTPUT: path.join(workspace, 'step-output'), GH_AW_SAFE_OUTPUTS: path.join(workspace, 'runner-temp/gh-aw/safeoutputs/outputs.jsonl'), COPILOT_GITHUB_TOKEN: 'fixture-token' };
  return { workspace, env, registry, reportPath, log: () => {} };
}

function client({ changed = false, pulls = [[]], failure } = {}) {
  const calls = [];
  return {
    calls,
    api: async endpoint => {
      calls.push(endpoint);
      if (failure) throw failure;
      if (endpoint.includes('/pulls?')) return pulls[Number(new URL(`https://api.github.com/${endpoint}`).searchParams.get('page')) - 1] || [];
      if (endpoint.includes('/commits/')) return { sha: changed ? changedCommit : baselineCommit };
      if (endpoint.includes(`/git/trees/${baselineCommit}`)) return before;
      if (endpoint.includes(`/git/trees/${changedCommit}`)) return after;
      throw new Error(`Unexpected API request: ${endpoint}`);
    },
    raw: async commit => {
      assert.ok([baselineCommit, changedCommit].includes(commit));
      return commit === changedCommit ? '1.0.1.2' : '1.0.0.1';
    },
  };
}

const readIfPresent = file => fs.readFile(file, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
const pr = (title, repo = 'owner/repo') => ({ title, head: { repo: { full_name: repo } } });

test('unchanged automation creates the safe-output directory and emits noop without a review report', async t => {
  const f = await fixture(t);
  delete f.env.COPILOT_GITHUB_TOKEN;
  await assert.rejects(fs.access(path.dirname(f.env.GH_AW_SAFE_OUTPUTS)), { code: 'ENOENT' });
  const result = await checkUpstream({ ...f, automation: true, client: client() });
  assert.deepEqual(result, { status: 'unchanged', reviewRequired: false });
  assert.deepEqual(JSON.parse(await fs.readFile(f.env.GH_AW_SAFE_OUTPUTS, 'utf8')), { type: 'noop', message: 'No relevant upstream changes.' });
  assert.equal(await fs.readFile(f.env.GITHUB_OUTPUT, 'utf8'), 'review_required=false\n');
  await assert.rejects(fs.access(f.reportPath), { code: 'ENOENT' });
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(f.workspace, registryPath), 'utf8')), f.registry);
});

test('pending update PR is found on later pages and preserves existing safe-output records', async t => {
  const f = await fixture(t);
  const existing = JSON.stringify({ type: 'noop', message: 'Earlier preflight message.' }) + '\n';
  await fs.mkdir(path.dirname(f.env.GH_AW_SAFE_OUTPUTS), { recursive: true });
  await fs.writeFile(f.env.GH_AW_SAFE_OUTPUTS, existing);
  const firstPage = Array.from({ length: 100 }, () => pr('Unrelated'));
  firstPage[99] = pr('[wow-api-update] foreign fork', 'someone/fork');
  const api = client({ pulls: [firstPage, [pr('[wow-api-update] current proposal')]] });
  const result = await checkUpstream({ ...f, automation: true, client: api });
  assert.deepEqual(result, { status: 'pending-review', reviewRequired: false });
  assert.equal(api.calls.length, 2);
  assert.match(api.calls[1], /page=2$/);
  const safeOutputs = await fs.readFile(f.env.GH_AW_SAFE_OUTPUTS, 'utf8');
  assert.ok(safeOutputs.startsWith(existing));
  assert.deepEqual(safeOutputs.trim().split('\n').map(JSON.parse).at(-1), { type: 'noop', message: 'An upstream update PR is awaiting review.' });
  assert.equal(await fs.readFile(f.env.GITHUB_OUTPUT, 'utf8'), 'review_required=false\n');
  await assert.rejects(fs.access(f.reportPath), { code: 'ENOENT' });
});

test('changed automation writes the complete candidate report before allowing review', async t => {
  const f = await fixture(t);
  const result = await checkUpstream({ ...f, automation: true, client: client({ changed: true }) });
  assert.deepEqual(result, { status: 'review', reviewRequired: true, reportPath: f.reportPath });
  const report = JSON.parse(await fs.readFile(f.reportPath, 'utf8'));
  assert.equal(report.updates.length, 3);
  assert.ok(Number.isFinite(Date.parse(report.checkedAt)));
  assert.ok(report.updates.every(u => u.candidate.commit === changedCommit && u.previous.commit === baselineCommit));
  assert.equal(await fs.readFile(f.env.GITHUB_OUTPUT, 'utf8'), 'review_required=true\n');
  assert.equal(await readIfPresent(f.env.GH_AW_SAFE_OUTPUTS), '');
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(f.workspace, registryPath), 'utf8')), f.registry);
});

test('network failures remove stale reports and never signal a successful review or noop', async t => {
  const f = await fixture(t);
  await assert.rejects(checkUpstream({ ...f, automation: true, client: client({ failure: new Error('HTTP 503') }) }), /HTTP 503/);
  await assert.rejects(fs.access(f.reportPath), { code: 'ENOENT' });
  assert.equal(await readIfPresent(f.env.GITHUB_OUTPUT), '');
  assert.equal(await readIfPresent(f.env.GH_AW_SAFE_OUTPUTS), '');
});

test('a candidate report write failure never enables review', async t => {
  const f = await fixture(t);
  const api = client({ changed: true });
  const raw = api.raw;
  let snapshots = 0;
  api.raw = async commit => {
    if (++snapshots === Object.keys(branches).length) await fs.mkdir(f.reportPath);
    return raw(commit);
  };
  await assert.rejects(checkUpstream({ ...f, automation: true, client: api }));
  assert.equal((await fs.stat(f.reportPath)).isDirectory(), true);
  assert.equal(await readIfPresent(f.env.GITHUB_OUTPUT), '');
  assert.equal(await readIfPresent(f.env.GH_AW_SAFE_OUTPUTS), '');
});

test('a safe-output directory creation failure does not report a successful noop', async t => {
  const f = await fixture(t);
  await fs.writeFile(path.join(f.workspace, 'runner-temp'), 'file blocking directory creation');
  const logged = [];
  await assert.rejects(checkUpstream({ ...f, automation: true, client: client(), log: message => logged.push(message) }));
  assert.deepEqual(logged, []);
  assert.equal(await readIfPresent(f.env.GITHUB_OUTPUT), '');
  await assert.rejects(fs.access(f.reportPath), { code: 'ENOENT' });
});

test('changed source without Copilot credentials fails closed', async t => {
  const f = await fixture(t);
  delete f.env.COPILOT_GITHUB_TOKEN;
  await assert.rejects(checkUpstream({ ...f, automation: true, client: client({ changed: true }) }), /missing-credentials/);
  await assert.rejects(fs.access(f.reportPath), { code: 'ENOENT' });
  assert.equal(await readIfPresent(f.env.GITHUB_OUTPUT), '');
  assert.equal(await readIfPresent(f.env.GH_AW_SAFE_OUTPUTS), '');
});

test('missing automation output paths fail closed instead of silently allowing inference', async t => {
  for (const key of ['GITHUB_OUTPUT', 'GH_AW_SAFE_OUTPUTS']) {
    await t.test(key, async t => {
      const f = await fixture(t);
      const output = f.env.GITHUB_OUTPUT;
      const safeOutput = f.env.GH_AW_SAFE_OUTPUTS;
      delete f.env[key];
      await assert.rejects(checkUpstream({ ...f, automation: true, client: client() }), new RegExp(`${key} is missing`));
      await assert.rejects(fs.access(f.reportPath), { code: 'ENOENT' });
      assert.equal(await readIfPresent(output), '');
      assert.equal(await readIfPresent(safeOutput), '');
    });
  }
});

test('manual unchanged checks do not require or write GitHub Actions output files', async t => {
  const f = await fixture(t);
  const result = await checkUpstream({ ...f, env: {}, client: client() });
  assert.deepEqual(result, { status: 'unchanged', reviewRequired: false });
  assert.equal(await readIfPresent(f.env.GITHUB_OUTPUT), '');
  assert.equal(await readIfPresent(f.env.GH_AW_SAFE_OUTPUTS), '');
});
