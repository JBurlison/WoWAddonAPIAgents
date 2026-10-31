import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { root } from './lib.mjs';

const repository = 'Gethe/wow-ui-source';
const remoteURL = `https://github.com/${repository}.git`;
const branches = { retail: 'live', forever: 'forever', classic: 'classic' };

function validatePin(id, pin) {
  if (!Object.hasOwn(branches, id) || pin?.branch !== branches[id] || !/^[a-f0-9]{40}$/.test(pin?.commit || '') || !/^\d+\.\d+\.\d+\.\d+$/.test(pin?.version || '')) {
    throw new Error(`Invalid source pin: ${id}`);
  }
}

export function selectPins(registry, report) {
  if (registry?.schemaVersion !== 1 || registry.repository !== repository || Object.keys(registry.targets || {}).sort().join(',') !== 'classic,forever,retail') {
    throw new Error('Unexpected source registry');
  }
  const pins = structuredClone(registry.targets);
  for (const [id, pin] of Object.entries(pins)) validatePin(id, pin);
  if (report !== undefined) {
    if (!Array.isArray(report?.updates)) throw new Error('Invalid upstream candidate report');
    const seen = new Set();
    for (const update of report.updates) {
      if (!Object.hasOwn(pins, update.id) || seen.has(update.id) || update.previous?.commit !== pins[update.id].commit) throw new Error('Stale, duplicate or unexpected candidate target');
      validatePin(update.id, update.candidate);
      pins[update.id] = structuredClone(update.candidate);
      seen.add(update.id);
    }
  }
  return pins;
}

async function realDirectory(dir, { empty = false } = {}) {
  await fs.mkdir(dir, { recursive: true });
  const stat = await fs.lstat(dir);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`Source cache must be a real directory: ${dir}`);
  if (empty && (await fs.readdir(dir)).length) throw new Error(`Expected empty hooks/template directory: ${dir}`);
}

function gitRunner(disabledHooks) {
  const env = { ...process.env };
  // Ignore inherited Git repository/config overrides and credential helpers.
  for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(disabledHooks, 'unused-global-config'), GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' });
  return (cwd, args, { allowFailure = false } = {}) => {
    try {
      return execFileSync('git', ['-c', `core.hooksPath=${disabledHooks}`, '-c', 'core.fsmonitor=false', '-c', 'submodule.recurse=false', '-c', 'protocol.allow=never', '-c', 'protocol.https.allow=always', ...args], {
        cwd, env, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 8 * 1024 * 1024,
      }).trim();
    } catch (error) {
      if (allowFailure) return null;
      // Do not echo arbitrary repository config or inherited credentials on failure.
      throw new Error(`Git ${args[0]} failed in ${cwd} (exit ${error.status ?? 'unavailable'})`);
    }
  };
}

export async function prepareCheckout({ cacheRoot, id, pin }) {
  validatePin(id, pin);
  const disabledHooks = path.join(cacheRoot, '.disabled-hooks');
  await realDirectory(cacheRoot);
  await realDirectory(disabledHooks, { empty: true });
  const git = gitRunner(disabledHooks);
  const checkout = path.join(cacheRoot, id);
  const existing = await fs.lstat(checkout).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (existing && (!existing.isDirectory() || existing.isSymbolicLink())) throw new Error(`Unexpected source cache path: ${id}`);
  if (!existing) await fs.mkdir(checkout);
  const entries = await fs.readdir(checkout);
  if (!entries.length) {
    git(checkout, ['init', '--template', disabledHooks]);
    git(checkout, ['remote', 'add', 'origin', remoteURL]);
  }
  const gitDir = await fs.lstat(path.join(checkout, '.git')).catch(() => null);
  if (!gitDir?.isDirectory() || gitDir.isSymbolicLink()) throw new Error(`Expected an independent Git checkout: ${id}`);
  const top = git(checkout, ['rev-parse', '--show-toplevel']);
  if (await fs.realpath(top) !== await fs.realpath(checkout)) throw new Error(`Unexpected repository root: ${id}`);
  const configKeys = git(checkout, ['config', '--local', '--no-includes', '--name-only', '--list']).split(/\r?\n/).filter(Boolean);
  const safeKey = /^(?:core\.(?:repositoryformatversion|filemode|bare|logallrefupdates|ignorecase|symlinks)|remote\.origin\.(?:url|fetch)|branch\.[\w.-]+\.(?:remote|merge))$/;
  if (configKeys.some(key => !safeKey.test(key))) throw new Error(`Unexpected local Git configuration in ${id}; use a clean source cache`);
  const origin = git(checkout, ['config', '--local', '--no-includes', '--get-all', 'remote.origin.url']);
  if (![remoteURL, `https://github.com/${repository}`].includes(origin)) throw new Error(`Unexpected source repository: ${id}`);
  if (git(checkout, ['rev-parse', '--is-bare-repository']) !== 'false') throw new Error(`Bare source repository is not supported: ${id}`);
  if (git(checkout, ['status', '--porcelain=v1', '--untracked-files=all', '--ignored']).length) throw new Error(`Dirty source checkout: ${id}; preserve your changes before refreshing`);

  if (git(checkout, ['cat-file', '-e', `${pin.commit}^{commit}`], { allowFailure: true }) === null) {
    git(checkout, ['fetch', '--no-tags', '--no-recurse-submodules', '--depth=1', 'origin', pin.commit]);
  }
  if (git(checkout, ['rev-parse', '--verify', `${pin.commit}^{commit}`]) !== pin.commit) throw new Error(`Fetched source identity mismatch: ${id}`);
  git(checkout, ['checkout', '--detach', pin.commit]);
  if (git(checkout, ['rev-parse', 'HEAD']) !== pin.commit || git(checkout, ['status', '--porcelain=v1', '--untracked-files=all', '--ignored']).length) throw new Error(`Source checkout verification failed: ${id}`);
  const version = (await fs.readFile(path.join(checkout, 'version.txt'), 'utf8')).trim();
  if (version !== pin.version) throw new Error(`Source version mismatch: ${id}`);
  return { id, commit: pin.commit, version, checkout };
}

export async function prepareSources({ base = root, candidates = false } = {}) {
  const registry = JSON.parse(await fs.readFile(path.join(base, 'skills/wow-client-targets/references/targets.json'), 'utf8'));
  const report = candidates ? JSON.parse(await fs.readFile(path.join(base, '.cache/upstream-report.json'), 'utf8')) : undefined;
  const pins = selectPins(registry, report);
  const cache = path.join(base, '.cache');
  await realDirectory(cache);
  const cacheRoot = path.join(cache, 'api-audit');
  await realDirectory(cacheRoot);
  const result = [];
  for (const [id, pin] of Object.entries(pins)) result.push(await prepareCheckout({ cacheRoot, id, pin }));
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--candidates') || args.length > 1) {
    console.error('Use node scripts/prepare-api-sources.mjs [--candidates]');
    process.exitCode = 1;
  } else {
    prepareSources({ candidates: args.includes('--candidates') }).then(rows => {
      for (const row of rows) console.log(`${row.id}: ${row.version} at ${row.commit}`);
    }).catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
