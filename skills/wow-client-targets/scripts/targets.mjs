import fs from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const targetIds = ['retail', 'forever', 'classic'];
export const branches = { retail: 'live', forever: 'forever', classic: 'classic' };
export function resolveTargets(requested, configured = []) {
  const input = requested?.length ? requested : configured;
  if (!Array.isArray(input) || input.some(value => typeof value !== 'string')) throw new Error('Targets must be an array of strings');
  if (!input.length) throw new Error('Target is ambiguous: select retail, forever, classic, or all');
  const normalized = input.map(value => value.trim().toLowerCase());
  for (const value of normalized) {
    if (value !== 'all' && !targetIds.includes(value)) throw new Error(`Unsupported target: ${value}`);
  }
  const selected = normalized.includes('all') ? targetIds : normalized;
  return targetIds.filter(id => selected.includes(id));
}
export function interfaceFromVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match || +match[2] > 99 || +match[3] > 99) throw new Error(`Invalid client version: ${version}`);
  return +match[1] * 10000 + +match[2] * 100 + +match[3];
}
export function apiDecision(evidence) {
  if (!evidence || evidence.availability === 'unknown') return 'verify';
  if (evidence.availability === 'unavailable') return 'unsupported';
  if (!evidence.loadedForTarget || !evidence.signatureVerified || !evidence.addonAccessVerified) return 'verify';
  return evidence.requiresAdapter ? 'adapter' : 'supported';
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const registry = JSON.parse(await fs.readFile(fileURLToPath(new URL('../references/targets.json', import.meta.url)), 'utf8'));
    const targets = resolveTargets(process.argv.slice(2));
    console.log(JSON.stringify(targets.map(id => ({ id, ...registry.targets[id] })), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
