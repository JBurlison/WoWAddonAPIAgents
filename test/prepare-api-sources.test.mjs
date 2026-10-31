import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { prepareCheckout, selectPins } from '../scripts/prepare-api-sources.mjs';

const registry = () => ({ schemaVersion: 1, repository: 'Gethe/wow-ui-source', targets: Object.fromEntries(Object.entries({ retail: 'live', forever: 'forever', classic: 'classic' }).map(([id, branch]) => [id, { branch, commit: 'a'.repeat(40), version: '1.2.3.4' }])) });

test('source pins reject moving refs, foreign targets and stale candidate reports without mutating the registry', () => {
  const original = registry();
  const candidate = { ...original.targets.forever, commit: 'b'.repeat(40) };
  const report = { updates: [{ id: 'forever', previous: original.targets.forever, candidate }] };
  assert.equal(selectPins(original, report).forever.commit, candidate.commit);
  assert.equal(original.targets.forever.commit, 'a'.repeat(40));
  assert.throws(() => selectPins({ ...original, repository: 'other/source' }), /Unexpected/);
  assert.throws(() => selectPins(original, { updates: [{ ...report.updates[0], candidate: { ...candidate, commit: 'forever' } }] }), /Invalid source pin/);
  assert.throws(() => selectPins(original, { updates: [{ ...report.updates[0], previous: { commit: 'c'.repeat(40) } }] }), /Stale/);
  assert.throws(() => selectPins(original, { updates: [...report.updates, ...report.updates] }), /duplicate/);
});

async function fixture(t) {
  const cacheRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'wow-api-source-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(cacheRoot)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(cacheRoot).startsWith('wow-api-source-'));
    return fs.rm(cacheRoot, { recursive: true, force: true });
  });
  const checkout = path.join(cacheRoot, 'forever');
  await fs.mkdir(checkout);
  const git = args => execFileSync('git', ['-c', 'user.name=Source test', '-c', 'user.email=test@example.invalid', '-c', `core.hooksPath=${path.join(cacheRoot, 'no-hooks')}`, ...args], {
    cwd: checkout, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(cacheRoot, 'unused-global-config') },
  }).trim();
  git(['init', '--initial-branch=main']);
  git(['remote', 'add', 'origin', 'https://github.com/Gethe/wow-ui-source.git']);
  await fs.writeFile(path.join(checkout, 'version.txt'), '1.2.3.4\n');
  await fs.writeFile(path.join(checkout, '.gitignore'), 'ignored.tmp\n');
  git(['add', 'version.txt', '.gitignore']);
  git(['commit', '-m', 'Source fixture']);
  const pin = { branch: 'forever', version: '1.2.3.4', commit: git(['rev-parse', 'HEAD']) };
  return { cacheRoot, checkout, git, pin };
}

test('source preparation reuses an exact cached SHA, suppresses checkout hooks and verifies the version', async t => {
  const f = await fixture(t);
  const sentinel = path.join(f.cacheRoot, 'hook-ran');
  const hook = path.join(f.checkout, '.git/hooks/post-checkout');
  await fs.writeFile(hook, `#!/bin/sh\nprintf hook > '${sentinel.replaceAll('\\', '/')}'\n`, { mode: 0o755 });
  const result = await prepareCheckout({ cacheRoot: f.cacheRoot, id: 'forever', pin: f.pin });
  assert.equal(result.commit, f.pin.commit);
  assert.equal(f.git(['rev-parse', 'HEAD']), f.pin.commit);
  await assert.rejects(fs.stat(sentinel), { code: 'ENOENT' });
  await assert.rejects(prepareCheckout({ cacheRoot: f.cacheRoot, id: 'forever', pin: { ...f.pin, version: '9.9.9.9' } }), /version mismatch/);
});

test('source preparation rejects dirty files, ignored additions, foreign origins and executable local config', async t => {
  const f = await fixture(t);
  const prepare = () => prepareCheckout({ cacheRoot: f.cacheRoot, id: 'forever', pin: f.pin });
  await fs.writeFile(path.join(f.checkout, 'version.txt'), 'dirty\n');
  await assert.rejects(prepare(), /Dirty source/);
  f.git(['checkout', '--', 'version.txt']);
  await fs.writeFile(path.join(f.checkout, 'ignored.tmp'), 'local data');
  await assert.rejects(prepare(), /Dirty source/);
  await fs.unlink(path.join(f.checkout, 'ignored.tmp'));
  f.git(['remote', 'set-url', 'origin', 'https://github.com/other/source.git']);
  await assert.rejects(prepare(), /Unexpected source repository/);
  f.git(['remote', 'set-url', 'origin', 'https://github.com/Gethe/wow-ui-source.git']);
  f.git(['config', 'filter.test.smudge', 'untrusted-command']);
  await assert.rejects(prepare(), /Unexpected local Git configuration/);
});
