import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { root, json, readJSON, write } from './lib.mjs';

export const versionFiles = [
  'config/plugin.json', 'package.json', 'package-lock.json',
  'plugins/wow-addon-dev/plugin.json',
  'plugins/wow-addon-dev/.codex-plugin/plugin.json',
  'plugins/wow-addon-dev/.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json', '.github/plugin/marketplace.json',
];
export function parts(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error(`Expected stable major.minor.patch version: ${version}`);
  const values = version.split('.').map(Number);
  if (values.some(value => !Number.isSafeInteger(value))) throw new Error('Version component exceeds safe integer range');
  return values;
}
export function compare(a, b) {
  const left = parts(a), right = parts(b);
  for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i] > right[i] ? 1 : -1;
  return 0;
}
export function increment(version, level = 'patch') {
  const values = parts(version), index = ['major', 'minor', 'patch'].indexOf(level);
  if (index < 0) throw new Error('Choose major, minor, or patch');
  values[index]++;
  values.fill(0, index + 1);
  const next = values.join('.');
  parts(next);
  return next;
}
export const nextPRVersion = (base, proposed) => compare(proposed, base) > 0 ? proposed : increment(base);
export function rewriteVersion(file, text, version) {
  parts(version);
  const data = JSON.parse(text);
  if (!versionFiles.includes(file)) throw new Error(`Version editing is not allowed: ${file}`);
  if (file.endsWith('marketplace.json')) {
    if (data.name !== 'wow-addon-api-agents' || data.plugins?.length !== 1 || data.plugins[0].name !== 'wow-addon-dev') throw new Error(`Unexpected catalog: ${file}`);
    data.plugins[0].version = version;
  } else {
    const expected = file === 'package.json' || file === 'package-lock.json' ? 'wow-addon-api-agents' : 'wow-addon-dev';
    if (data.name !== expected) throw new Error(`Unexpected identity: ${file}`);
    data.version = version;
    if (file === 'package-lock.json') {
      if (data.packages?.['']?.name !== expected) throw new Error('Missing lockfile root package');
      data.packages[''].version = version;
    }
  }
  return json(data);
}
export async function setVersion(version, base = root) {
  const changed = await Promise.all(versionFiles.map(async file => [file, rewriteVersion(file, await fs.readFile(path.join(base, file), 'utf8'), version)]));
  for (const [file, text] of changed) await write(path.join(base, file), text);
}
export function assertVersionOnly(file, original, candidate) {
  if (rewriteVersion(file, original, '0.0.0') !== rewriteVersion(file, candidate, '0.0.0')) throw new Error(`Upstream updater may change only version fields: ${file}`);
}
export async function validateVersions(base = root) {
  const version = (await readJSON(path.join(base, 'config/plugin.json'))).version;
  parts(version);
  for (const file of versionFiles) {
    const current = await readJSON(path.join(base, file));
    if (JSON.stringify(current) !== JSON.stringify(JSON.parse(rewriteVersion(file, json(current), version)))) throw new Error(`Version mismatch: ${file}`);
  }
  return version;
}
export function checkPRVersion(baseVersion, proposedVersion, pluginChanged) {
  const comparison = compare(proposedVersion, baseVersion);
  if (comparison < 0 || (pluginChanged && comparison === 0)) throw new Error(`Plugin changes require a version greater than ${baseVersion}; run npm run version:bump -- patch`);
}
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
async function guard(base) {
  for (const file of versionFiles) assertVersionOnly(file, git(['show', `${base}:${file}`]), await fs.readFile(path.join(root, file), 'utf8'));
}
async function main() {
  const [command, arg] = process.argv.slice(2);
  if (command === 'bump') {
    const current = await validateVersions();
    const next = increment(current, arg || 'patch');
    await setVersion(next);
    console.log(`${current} -> ${next}`);
  } else if (command === 'check') {
    if (!arg) throw new Error('Provide a base Git ref');
    const base = git(['rev-parse', '--verify', `${arg}^{commit}`]);
    const baseline = JSON.parse(git(['show', `${base}:config/plugin.json`])).version;
    const current = await validateVersions();
    const changed = git(['diff', '--name-only', base, '--', 'plugins/wow-addon-dev/']).length > 0;
    checkPRVersion(baseline, current, changed);
    console.log(`Version policy passed: ${baseline} -> ${current}`);
  } else if (command === 'guard') {
    if (!arg) throw new Error('Provide the original checkout commit');
    const base = git(['rev-parse', '--verify', `${arg}^{commit}`]);
    await guard(base);
  } else if (command === 'ensure') {
    // Repeatable against the original Actions commit even if the agent commits its edits.
    const base = git(['rev-parse', '--verify', `${process.env.GITHUB_SHA || 'HEAD'}^{commit}`]);
    const baseline = JSON.parse(git(['show', `${base}:config/plugin.json`])).version;
    const current = (await readJSON(path.join(root, 'config/plugin.json'))).version;
    await guard(base);
    const changed = git(['diff', base, '--name-only', '--', 'plugins/wow-addon-dev/']).length > 0;
    if (changed) await setVersion(nextPRVersion(baseline, current));
  } else throw new Error('Use bump [major|minor|patch], check BASE, guard BASE, or ensure');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
