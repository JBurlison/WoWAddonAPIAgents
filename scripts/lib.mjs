import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const json = value => JSON.stringify(value, null, 2) + '\n';
export const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
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
