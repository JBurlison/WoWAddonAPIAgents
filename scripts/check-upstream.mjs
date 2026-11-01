import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient, inspectChanges, registryPath, gate } from './upstream.mjs';
import { root, readJSON, write, json } from './lib.mjs';

export async function checkUpstream({
  automation = false,
  gateOnly = false,
  env = process.env,
  client = createClient({ token: env.GH_TOKEN || env.GITHUB_TOKEN || '' }),
  workspace = root,
  log = console.log,
} = {}) {
  if (gateOnly && !automation) throw new Error('gateOnly requires automation mode');
  const reportPath = path.join(workspace, '.cache/upstream-report.json');
  await fs.rm(reportPath, { force: true });
  if (automation && !env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is missing');
  async function setReviewRequired(required) {
    if (automation) await fs.appendFile(env.GITHUB_OUTPUT, `review_required=${required}\n`);
  }
  async function noop(reason, status) {
    if (automation && !gateOnly) {
      if (!env.GH_AW_SAFE_OUTPUTS) throw new Error('GH_AW_SAFE_OUTPUTS is missing');
      await fs.mkdir(path.dirname(env.GH_AW_SAFE_OUTPUTS), { recursive: true });
      await fs.appendFile(env.GH_AW_SAFE_OUTPUTS, JSON.stringify({ type: 'noop', message: reason }) + '\n');
    }
    await setReviewRequired(false);
    log(reason);
    return { status, reviewRequired: false };
  }
  if (automation) {
    const repo = env.GITHUB_REPOSITORY;
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '')) throw new Error('GITHUB_REPOSITORY is missing or invalid');
    // Paginate rather than relying on eventually consistent issue search.
    for (let page = 1; ; page++) {
      const prs = await client.api(`repos/${repo}/pulls?state=open&per_page=100&page=${page}`);
      if (prs.some(pr => pr.title.startsWith('[wow-api-update]') && pr.head.repo?.full_name === repo)) {
        return noop('An upstream update PR is awaiting review.', 'pending-review');
      }
      if (prs.length < 100) break;
    }
  }
  const updates = await inspectChanges(await readJSON(path.join(workspace, registryPath)), client);
  const status = gate({ changed: updates.length > 0, hasKey: !automation || !!env.COPILOT_GITHUB_TOKEN });
  if (status === 'unchanged') return noop('No relevant upstream changes.', status);
  if (status !== 'review') throw new Error(`Cannot update: ${status}`);
  const report = { checkedAt: new Date().toISOString(), updates };
  await write(reportPath, json(report));
  await setReviewRequired(true);
  log(`${updates.length} target(s) changed. Review .cache/upstream-report.json; committed snapshots were not modified.`);
  return { status, reviewRequired: true, reportPath };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const gateOnly = process.argv.includes('--gate');
  checkUpstream({ automation: gateOnly || process.argv.includes('--automation'), gateOnly }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
