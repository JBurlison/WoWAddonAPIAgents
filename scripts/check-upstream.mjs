import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient, inspectChanges, registryPath, gate } from './upstream.mjs';
import { root, readJSON, write, json } from './lib.mjs';

async function main() {
  const automation = process.argv.includes('--automation');
  const client = createClient();
  await fs.rm(path.join(root, '.cache/upstream-report.json'), { force: true });
  async function noop(reason) {
    console.log(reason);
    if (automation) {
      if (!process.env.GH_AW_SAFE_OUTPUTS) throw new Error('GH_AW_SAFE_OUTPUTS is missing');
      await fs.appendFile(process.env.GH_AW_SAFE_OUTPUTS, JSON.stringify({ type: 'noop', message: reason }) + '\n');
    }
  }
  if (automation) {
    const repo = process.env.GITHUB_REPOSITORY;
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '')) throw new Error('GITHUB_REPOSITORY is missing or invalid');
    // Paginate rather than relying on eventually consistent issue search.
    for (let page = 1; ; page++) {
      const prs = await client.api(`repos/${repo}/pulls?state=open&per_page=100&page=${page}`);
      if (prs.some(pr => pr.title.startsWith('[wow-api-update]') && pr.head.repo?.full_name === repo)) {
        await noop('An upstream update PR is awaiting review.'); return;
      }
      if (prs.length < 100) break;
    }
  }
  const updates = await inspectChanges(await readJSON(path.join(root, registryPath)), client);
  const status = gate({ changed: updates.length > 0, hasKey: !automation || !!process.env.COPILOT_GITHUB_TOKEN });
  if (status === 'unchanged') { await noop('No relevant upstream changes.'); return; }
  if (status !== 'review') throw new Error(`Cannot update: ${status}`);
  const report = { checkedAt: new Date().toISOString(), updates };
  await write(path.join(root, '.cache/upstream-report.json'), json(report));
  console.log(`${updates.length} target(s) changed. Review .cache/upstream-report.json; committed snapshots were not modified.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
