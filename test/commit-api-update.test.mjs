import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('../scripts/commit-api-update.mjs', import.meta.url));
const publisherLimit = 10 * 1024 * 1024;

async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wow-api-commit-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith('wow-api-commit-'));
    return fs.rm(dir, { recursive: true, force: true });
  });
  const options = {
    cwd: dir, encoding: 'utf8',
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(dir, '.unused-config') },
  };
  const git = (...args) => execFileSync('git', args, options).trim();
  const write = (file, content) => fs.writeFile(path.join(dir, file), content);
  const refresh = base => spawnSync(process.execPath, [script], {
    ...options, env: { ...options.env, GITHUB_SHA: base },
  });
  git('init', '-q', '--initial-branch=refresh');
  git('config', 'user.name', 'Refresh test');
  git('config', 'user.email', 'refresh@example.invalid');
  git('config', 'core.autocrlf', 'false');
  return { dir, git, write, refresh };
}

test('a staged refresh becomes a linear, payload-bounded history with the exact staged tree', async t => {
  const { dir, git, write, refresh } = await fixture(t);
  // Only the last line changes. Each signed-commit addition still sends the whole blob.
  const prefix = ('x'.repeat(63) + '\n').repeat(96 * 1024);
  for (const file of ['classic.json', 'retail.json']) await write(file, prefix + 'before\n');
  await write('obsolete.md', 'old guide\n');
  git('add', '-A');
  git('commit', '-qm', 'Previous snapshot');
  const base = git('rev-parse', 'HEAD');
  for (const file of ['classic.json', 'retail.json']) await write(file, prefix + 'after\n');
  await fs.unlink(path.join(dir, 'obsolete.md'));
  await write('new guide.md', 'new guide\n');
  git('add', '-A');
  const tree = git('write-tree');
  assert.ok(git('diff', '--cached', '--unified=0').length < 2048);

  const result = refresh(base);
  assert.equal(result.status, 0, result.stderr);
  const commits = git('rev-list', '--reverse', base + '..HEAD').split('\n');
  assert.ok(commits.length >= 2, 'The two updated blobs exceed the limit for one signed commit');
  let parent = base;
  for (const commit of commits) {
    assert.equal(git('show', '-s', '--format=%P', commit), parent);
    assert.equal(git('show', '-s', '--format=%s', commit).includes('[skip ci]'), commit !== commits.at(-1));
    const paths = git('diff', '--no-renames', '--diff-filter=AM', '--name-only', parent, commit);
    const addedBytes = paths ? paths.split('\n').reduce((total, file) =>
      total + Number(git('cat-file', '-s', commit + ':' + file)), 0) : 0;
    assert.ok(addedBytes <= publisherLimit, `Commit ${commit} needs ${addedBytes} added bytes`);
    parent = commit;
  }
  assert.equal(git('rev-parse', 'HEAD^{tree}'), tree);
  assert.equal(git('write-tree'), tree);
  assert.equal(git('status', '--porcelain'), '');
  assert.deepEqual(git('reflog', 'show', '--format=%H', 'refs/heads/refresh').split('\n'), [parent, base],
    'Publish the complete chain to the local branch in one ref update');
});

test('an individually oversized addition leaves the branch, staging area, and working files intact', async t => {
  const { git, write, refresh } = await fixture(t);
  await write('first.md', 'before\n');
  git('add', '-A');
  git('commit', '-qm', 'Previous snapshot');
  const base = git('rev-parse', 'HEAD');
  await write('first.md', 'after\n');
  await write('oversized.json', Buffer.alloc(publisherLimit + 1, 120));
  git('add', '-A');
  const tree = git('write-tree');
  const status = git('status', '--porcelain');

  const result = refresh(base);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /oversized\.json/);
  assert.equal(git('rev-parse', 'HEAD'), base);
  assert.equal(git('reflog', 'show', '--format=%H', 'refs/heads/refresh'), base);
  assert.equal(git('write-tree'), tree);
  assert.equal(git('status', '--porcelain'), status);
});
