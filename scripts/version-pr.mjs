// Run only from the trusted default branch. PR trees and JSON are data, never executed.
import fs from 'node:fs/promises';
import { isMainModule } from './lib.mjs';
import { versionFiles, nextPRVersion, rewriteVersion } from './version.mjs';

export function pluginTree(tree) {
  if (tree.truncated || !Array.isArray(tree.tree)) throw new Error('Incomplete Git tree');
  return tree.tree.filter(item => item.type === 'blob' && item.path.startsWith('plugins/wow-addon-dev/'))
    .map(item => `${item.path}\0${item.mode}\0${item.sha}`).sort().join('\n');
}
export async function updatePR(api, repository, number, { dispatchUnchanged = false } = {}) {
  const prefix = `repos/${repository}`;
  const pr = await api(`${prefix}/pulls/${number}`);
  if (pr.state !== 'open' || pr.head.repo?.full_name?.toLowerCase() !== repository.toLowerCase() || pr.base.ref !== 'main') return 'skipped';
  const head = pr.head.sha;
  const base = await api(`${prefix}/git/ref/heads/main`);
  const compare = await api(`${prefix}/compare/${base.object.sha}...${head}`);
  const mergeBaseSha = compare.merge_base_commit?.sha;
  if (!/^[a-f0-9]{40}$/.test(mergeBaseSha || '')) throw new Error(`Unable to resolve merge base for PR #${number}`);
  const [baseTree, after] = await Promise.all([base.object.sha, head].map(sha => api(`${prefix}/git/trees/${sha}?recursive=1`)));
  const mergeBaseTree = mergeBaseSha === base.object.sha
    ? baseTree
    : await api(`${prefix}/git/trees/${mergeBaseSha}?recursive=1`);
  if (pluginTree(mergeBaseTree) === pluginTree(after)) return 'unchanged';
  async function read(file, tree) {
    const entry = tree.tree.find(item => item.path === file);
    if (!entry || entry.mode !== '100644' || entry.type !== 'blob') throw new Error(`Expected regular JSON file: ${file}`);
    const blob = await api(`${prefix}/git/blobs/${entry.sha}`);
    if (blob.encoding !== 'base64' || blob.size > 2_000_000) throw new Error(`Unexpected JSON encoding/size: ${file}`);
    return Buffer.from(blob.content, 'base64').toString('utf8');
  }
  const baseline = JSON.parse(await read('config/plugin.json', baseTree)).version;
  const source = await Promise.all(versionFiles.map(async file => [file, await read(file, after)]));
  const proposed = JSON.parse(source[0][1]).version;
  const version = nextPRVersion(baseline, proposed);
  const edits = source.map(([file, content]) => [file, content, rewriteVersion(file, content, version)]).filter(([, old, next]) => old.replaceAll('\r\n', '\n') !== next);
  if (!edits.length) {
    if (dispatchUnchanged) await api(`${prefix}/actions/workflows/validate.yml/dispatches`, { method: 'POST', body: { ref: pr.head.ref } });
    return 'already-versioned';
  }
  const tree = await api(`${prefix}/git/trees`, { method: 'POST', body: { base_tree: after.sha, tree: edits.map(([file, , content]) => ({ path: file, mode: '100644', type: 'blob', content })) } });
  const commit = await api(`${prefix}/git/commits`, { method: 'POST', body: { message: `chore: version plugin ${version}`, tree: tree.sha, parents: [head] } });
  const latest = await api(`${prefix}/pulls/${number}`);
  if (latest.state !== 'open' || latest.head.sha !== head || latest.head.ref !== pr.head.ref) throw new Error('PR changed during version preparation; retry');
  await api(`${prefix}/git/refs/heads/${pr.head.ref.split('/').map(encodeURIComponent).join('/')}`, { method: 'PATCH', body: { sha: commit.sha, force: false } });
  // Token pushes do not trigger push workflows; PR runs can require approval.
  // Explicit dispatch ensures the new commit gets validation.
  await api(`${prefix}/actions/workflows/validate.yml/dispatches`, { method: 'POST', body: { ref: pr.head.ref } });
  return `versioned ${version}`;
}
async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !process.env.GH_TOKEN) throw new Error('Repository and GitHub token required');
  const event = JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const api = async (route, { method = 'GET', body } = {}) => {
    const response = await fetch(`https://api.github.com/${route}`, { method, headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`GitHub ${method} ${route}: ${response.status}`);
    return response.status === 204 ? null : response.json();
  };
  const numbers = [];
  if (event.pull_request) numbers.push(event.pull_request.number);
  else for (let page = 1; ; page++) {
    const prs = await api(`repos/${repository}/pulls?state=open&base=main&per_page=100&page=${page}`);
    numbers.push(...prs.map(pr => pr.number));
    if (prs.length < 100) break;
  }
  const dispatchUnchanged = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  let failed = 0;
  for (const number of numbers) {
    try {
      console.log(`PR #${number}: ${await updatePR(api, repository, number, { dispatchUnchanged })}`);
    } catch (error) {
      failed++;
      console.error(`PR #${number}: ${error.message}`);
    }
  }
  if (failed) throw new Error(`Failed to process ${failed} PR(s)`);
}
if (isMainModule(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
