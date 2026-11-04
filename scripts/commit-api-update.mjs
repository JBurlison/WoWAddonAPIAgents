import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Run in the proposal checkout after staging and validating the complete update.
// The publisher sends each changed file in full when it signs a commit.
const targetBytes = 8 * 1024 * 1024;
const maxBytes = 10 * 1024 * 1024;

function git(args, options = {}) {
  return execFileSync('git', args, { maxBuffer: 16 * 1024 * 1024, ...options });
}

function gitLine(args, options) {
  return git(args, options).toString('utf8').trimEnd();
}

function checkWorktree() {
  if (git(['diff', '--no-ext-diff', '--ignore-submodules=none', '--name-only', '-z', '--']).length) {
    throw new Error('Unstaged changes found. Stage and validate the complete API update first.');
  }
  if (git(['ls-files', '--others', '--exclude-standard', '-z']).length) {
    throw new Error('Untracked files found. Stage all intended files and remove unrelated files first.');
  }
}

function changedEntries(base, tree) {
  const raw = git(['diff-tree', '--raw', '-r', '-z', '--no-commit-id', '--no-renames', '--no-abbrev', base, tree, '--']);
  const fields = new TextDecoder('utf-8', { fatal: true }).decode(raw).split('\0');
  fields.pop(); // NUL terminator.
  const entries = [];
  for (let i = 0; i < fields.length; i += 2) {
    const match = /^:(000000|100644) (000000|100644) ([a-f0-9]{40}) ([a-f0-9]{40}) ([AMD])$/.exec(fields[i]);
    if (!match) throw new Error(`Unsupported Git mode or change for ${fields[i + 1]}: ${fields[i]}`);
    entries.push({ path: fields[i + 1], mode: match[2], oid: match[4] });
  }
  // Remove old paths before creating replacements (including file/directory swaps).
  return [...entries.filter(e => e.mode === '000000'), ...entries.filter(e => e.mode !== '000000')];
}

function partition(entries) {
  const objects = [...new Set(entries.filter(e => e.mode !== '000000').map(e => e.oid))];
  const sizes = new Map();
  if (objects.length) {
    const output = gitLine(['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], {
      input: objects.join('\n') + '\n',
    });
    for (const line of output.split('\n')) {
      const match = /^([a-f0-9]{40}) blob (\d+)$/.exec(line.trimEnd());
      if (!match) throw new Error(`Unable to measure staged Git blob: ${line}`);
      sizes.set(match[1], Number(match[2]));
    }
  }
  const batches = [];
  let batch = [], bytes = 0;
  for (const entry of entries) {
    const size = entry.mode === '000000' ? 0 : sizes.get(entry.oid);
    if (!Number.isSafeInteger(size)) throw new Error(`Missing Git blob size for ${entry.path}`);
    if (size > maxBytes) throw new Error(`Single blob exceeds the 10 MiB signed-commit limit: ${entry.path} (${size} bytes)`);
    if (batch.length && bytes + size > targetBytes) {
      batches.push(batch);
      batch = [];
      bytes = 0;
    }
    batch.push(entry);
    bytes += size;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

function commitUpdate() {
  const base = process.env.GITHUB_SHA;
  if (!/^[a-f0-9]{40}$/.test(base ?? '')) throw new Error('GITHUB_SHA must be the full starting commit SHA.');
  if (gitLine(['rev-parse', '--show-prefix'])) throw new Error('Run this command from the checkout root.');
  const branch = gitLine(['symbolic-ref', 'HEAD']);
  if (!branch.startsWith('refs/heads/') || branch === 'refs/heads/main') {
    throw new Error('Check out a named local proposal branch first.');
  }
  if (gitLine(['rev-parse', 'HEAD']) !== base) throw new Error('Proposal branch HEAD must equal GITHUB_SHA before committing.');
  checkWorktree();
  const finalTree = gitLine(['write-tree']);
  const baseTree = gitLine(['rev-parse', `${base}^{tree}`]);
  if (finalTree === baseTree) throw new Error('No staged API update to commit.');
  const batches = partition(changedEntries(baseTree, finalTree));

  // Prepare objects with an independent index. A failed batch leaves the real
  // index and branch intact. Publish the finished chain with one ref update.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wow-api-commit-'));
  const index = path.join(dir, 'index');
  const options = { env: { ...process.env, GIT_INDEX_FILE: index } };
  let parent = base;
  try {
    git(['read-tree', baseTree], options);
    for (const [i, batch] of batches.entries()) {
      const input = batch.map(e => `${e.mode} ${e.oid}\t${e.path}\0`).join('');
      git(['update-index', '-z', '--index-info'], { ...options, input });
      const tree = gitLine(['write-tree'], options);
      if (i === batches.length - 1 && tree !== finalTree) throw new Error('Prepared commit tree differs from the validated index.');
      parent = gitLine(['commit-tree', tree, '-p', parent, '-m', `Update WoW API references (${i + 1}/${batches.length})`], options);
    }
  } finally {
    fs.rmSync(index, { force: true });
    fs.rmSync(index + '.lock', { force: true });
    fs.rmdirSync(dir);
  }
  checkWorktree();
  if (gitLine(['symbolic-ref', 'HEAD']) !== branch || gitLine(['write-tree']) !== finalTree) {
    throw new Error('Branch or staged tree changed during commit preparation. Recheck the proposal.');
  }
  git(['update-ref', '-m', 'Prepare verified WoW API update', branch, parent, base]);
  console.log(`Prepared ${batches.length} linear commit(s) on ${branch.slice('refs/heads/'.length)} at ${parent}.`);
}

try {
  commitUpdate();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
