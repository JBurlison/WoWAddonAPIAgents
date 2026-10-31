import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { root, readJSON, write } from './lib.mjs';
import { parts, compare } from './version.mjs';

export function releaseNeeded(previous, current, manual = false) {
  parts(current);
  if (previous !== null && compare(current, previous) < 0) throw new Error('Release versions must not decrease');
  return manual || previous === null || current !== previous;
}
const run = (command, args) => execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const git = args => run('git', args);

export async function publishRelease({ api, repository, sha, version, assets, gh = args => run('gh', args) }) {
  parts(version);
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Expected a commit SHA');
  const tag = `v${version}`, prefix = `repos/${repository}`;
  const ref = await api(`${prefix}/git/ref/tags/${tag}`, { allow404: true });
  if (ref && (ref.object.type !== 'commit' || ref.object.sha !== sha)) throw new Error(`Tag ${tag} belongs to another commit; refusing to move it`);
  const release = await api(`${prefix}/releases/tags/${tag}`, { allow404: true });
  if (release && !ref) throw new Error('Release has no corresponding tag');
  if (release && !release.draft) return 'already-published';
  if (!ref) await api(`${prefix}/git/refs`, { method: 'POST', body: { ref: `refs/tags/${tag}`, sha } });
  if (!release) await gh(['release', 'create', tag, '--repo', repository, '--verify-tag', '--draft', '--title', `WoW Addon Development ${version}`, '--generate-notes']);
  await gh(['release', 'upload', tag, ...assets, '--repo', repository, '--clobber']);
  await gh(['release', 'edit', tag, '--repo', repository, '--draft=false']);
  return 'published';
}

async function main() {
  const version = (await readJSON(path.join(root, 'config/plugin.json'))).version;
  const sha = git(['rev-parse', 'HEAD']);
  if (sha !== process.env.GITHUB_SHA || process.env.GITHUB_REF !== 'refs/heads/main') throw new Error('Release must use the exact validated main commit');
  const event = await readJSON(process.env.GITHUB_EVENT_PATH);
  const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  const before = event.before;
  const previous = before && !/^0+$/.test(before) ? JSON.parse(git(['show', `${before}:config/plugin.json`])).version : null;
  if (!releaseNeeded(previous, version, manual)) { console.log('Version unchanged; no release.'); return; }
  const repository = process.env.GITHUB_REPOSITORY;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !process.env.GH_TOKEN) throw new Error('Repository and GitHub token required');
  const api = async (route, { method = 'GET', body, allow404 = false } = {}) => {
    const response = await fetch(`https://api.github.com/${route}`, { method, headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60_000) });
    if (response.status === 404 && allow404) return null;
    if (!response.ok) throw new Error(`GitHub ${method} ${route}: ${response.status}`);
    return response.status === 204 ? null : response.json();
  };
  const archive = `wow-addon-dev-${version}.zip`;
  const dir = path.join(root, 'dist');
  await fs.mkdir(dir, { recursive: true });
  git(['archive', '--format=zip', '--prefix=wow-addon-dev/', `--output=${path.join(dir, archive)}`, `${sha}:plugins/wow-addon-dev`]);
  const hash = createHash('sha256').update(await fs.readFile(path.join(dir, archive))).digest('hex');
  const sums = path.join(dir, 'SHA256SUMS');
  await write(sums, `${hash}  ${archive}\n`);
  console.log(await publishRelease({ api, repository, sha, version, assets: [path.join(dir, archive), sums] }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
