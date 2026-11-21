import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const json = value => JSON.stringify(value, null, 2) + '\n';
export const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}
export function isMainModule(metaUrl) {
  if (!process.argv[1]) return false;
  try {
    const entry = fsSync.realpathSync(process.argv[1]);
    const self = fsSync.realpathSync(fileURLToPath(metaUrl));
    return process.platform === 'win32' ? entry.toLowerCase() === self.toLowerCase() : entry === self;
  } catch {
    return false;
  }
}
export function hardenedGit(disabledHooks, { allowHttps = false } = {}) {
  const hooksPath = disabledHooks || path.join(os.tmpdir(), 'wow-disabled-hooks-unused');
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
  Object.assign(env, {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: path.join(path.dirname(hooksPath), 'unused-global-config'),
    GIT_TERMINAL_PROMPT: '0',
    GIT_OPTIONAL_LOCKS: '0',
  });
  const baseArgs = [
    '-c', `core.hooksPath=${hooksPath}`,
    '-c', 'core.fsmonitor=false',
    '-c', 'core.symlinks=false',
    '-c', 'core.quotePath=false',
    '-c', 'submodule.recurse=false',
    '-c', 'protocol.allow=never',
    '-c', 'protocol.file.allow=never',
    ...(allowHttps ? ['-c', 'protocol.https.allow=always'] : []),
  ];
  return (cwd, args, { allowFailure = false, maxBuffer = 8 * 1024 * 1024 } = {}) => {
    try {
      return execFileSync('git', [...baseArgs, ...args], {
        cwd, env, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer,
      }).trim();
    } catch (error) {
      if (allowFailure) return null;
      throw new Error(`Git ${args[0]} failed in ${cwd} (exit ${error.status ?? 'unavailable'})`);
    }
  };
}
export async function files(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.isSymbolicLink()) throw new Error(`Symlink not supported: ${dir}/${entry.name}`);
    if (entry.isDirectory()) result.push(...await files(path.join(dir, entry.name)));
    else result.push(path.join(dir, entry.name));
  }
  return result;
}
export function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('Missing YAML frontmatter');
  return { yaml: match[1], body: text.slice(match[0].length).trim() };
}
