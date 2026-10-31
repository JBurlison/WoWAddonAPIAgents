import { createHash } from 'node:crypto';
import { branches, interfaceFromVersion } from '../skills/wow-client-targets/scripts/targets.mjs';

export const repository = 'Gethe/wow-ui-source';
export const registryPath = 'skills/wow-client-targets/references/targets.json';
export const relevant = file => file === 'version.txt' || (file.startsWith('Interface/') && /\.(lua|xml|toc|xsd|txt)$/.test(file));
export function sourceFiles(tree) {
  if (tree.truncated) throw new Error('Upstream tree was truncated; refusing an incomplete snapshot');
  if (!Array.isArray(tree.tree)) throw new Error('Missing upstream tree');
  return tree.tree.filter(item => item.type === 'blob' && relevant(item.path)).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
export function fingerprint(tree) {
  return createHash('sha256').update(sourceFiles(tree).map(item => `${item.path}\0${item.sha}\n`).join('')).digest('hex');
}
export function changedFiles(before, after) {
  const oldFiles = new Map(sourceFiles(before).map(item => [item.path, item.sha]));
  const newFiles = new Map(sourceFiles(after).map(item => [item.path, item.sha]));
  return [...new Set([...oldFiles.keys(), ...newFiles.keys()])].sort().filter(file => oldFiles.get(file) !== newFiles.get(file)).map(file => ({
    path: file, status: !oldFiles.has(file) ? 'added' : !newFiles.has(file) ? 'removed' : 'modified',
    before: oldFiles.get(file) ?? null, after: newFiles.get(file) ?? null,
  }));
}
export function createClient({ token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN, fetcher = fetch } = {}) {
  async function request(url, asJSON = true) {
    const headers = { 'User-Agent': 'wow-addon-api-agents', Accept: 'application/vnd.github+json' };
    if (token && new URL(url).hostname === 'api.github.com') headers.Authorization = `Bearer ${token}`;
    const response = await fetcher(url, { headers, signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Upstream request failed (${response.status}): ${url}`);
    return asJSON ? response.json() : response.text();
  }
  return {
    api: endpoint => request(`https://api.github.com/${endpoint}`),
    raw: (commit, file) => request(`https://raw.githubusercontent.com/${repository}/${commit}/${file}`, false),
  };
}
export async function snapshot(id, client = createClient()) {
  if (!branches[id]) throw new Error(`Unsupported target: ${id}`);
  const commit = await client.api(`repos/${repository}/commits/${branches[id]}`);
  if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error('Invalid upstream commit');
  const [tree, rawVersion] = await Promise.all([
    client.api(`repos/${repository}/git/trees/${commit.sha}?recursive=1`), client.raw(commit.sha, 'version.txt'),
  ]);
  const version = rawVersion.trim();
  return { tree, metadata: {
    branch: branches[id], commit: commit.sha, version,
    interface: interfaceFromVersion(version),
    interfaceEvidence: 'Derived from version.txt (major*10000 + minor*100 + patch); confirm with select(4, GetBuildInfo()) in the target client.',
    verifiedAt: new Date().toISOString(), fingerprint: fingerprint(tree),
    verification: 'Source inventory and version verified; API availability requires per-feature verification including client load conditions.',
    sources: {
      version: `https://github.com/${repository}/blob/${commit.sha}/version.txt`,
      api: `https://github.com/${repository}/tree/${commit.sha}/Interface/AddOns/Blizzard_APIDocumentationGenerated`,
      ui: `https://github.com/${repository}/tree/${commit.sha}/Interface`,
    },
  } };
}
export async function inspectChanges(registry, client = createClient()) {
  const updates = [];
  for (const id of Object.keys(branches)) {
    const current = await snapshot(id, client);
    const previous = registry.targets[id];
    if (!previous) throw new Error(`Missing baseline for ${id}`);
    if (current.metadata.fingerprint === previous.fingerprint && current.metadata.version === previous.version) continue;
    const before = await client.api(`repos/${repository}/git/trees/${previous.commit}?recursive=1`);
    const changes = changedFiles(before, current.tree);
    updates.push({ id, previous, candidate: current.metadata, changes,
      compareUrl: `https://github.com/${repository}/compare/${previous.commit}...${current.metadata.commit}` });
  }
  return updates;
}
export function gate({ openPR = false, changed = false, hasKey = true, validationPassed = true }) {
  if (openPR) return 'pending-review';
  if (!changed) return 'unchanged';
  if (!hasKey) return 'missing-credentials';
  if (!validationPassed) return 'validation-failed';
  return 'review';
}
