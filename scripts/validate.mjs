import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { root, files, frontmatter, readJSON } from './lib.mjs';
import { branches, interfaceFromVersion } from '../skills/wow-client-targets/scripts/targets.mjs';
import { registryPath } from './upstream.mjs';

export function validateSkill(text, expectedName) {
  const { yaml } = frontmatter(text);
  const meta = YAML.parse(yaml, { uniqueKeys: true });
  if (meta.name !== expectedName || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name) || meta.name.length > 64) throw new Error('Invalid skill name');
  if (typeof meta.description !== 'string' || !meta.description.trim() || meta.description.length > 1024) throw new Error('Invalid skill description');
  return meta;
}
export async function validateLinks(file, boundary) {
  const text = (await fs.readFile(file, 'utf8')).replace(/```[\s\S]*?```/g, '');
  const errors = [];
  for (const match of text.matchAll(/\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|#)/.test(url)) continue;
    const target = decodeURIComponent(url.split('#')[0]);
    const resolved = path.resolve(path.dirname(file), target);
    const relative = path.relative(boundary, resolved);
    if (path.isAbsolute(relative) || relative.startsWith('..')) { errors.push(`Link escapes package: ${url}`); continue; }
    try {
      // Case-sensitive existence also on Windows, matching Linux installations.
      let cursor = boundary;
      for (const segment of relative.split(path.sep).filter(Boolean)) {
        if (!(await fs.readdir(cursor)).includes(segment)) throw new Error('missing');
        cursor = path.join(cursor, segment);
      }
    } catch { errors.push(`Broken or wrong-case link: ${url}`); }
  }
  return errors;
}
export function validateRegistry(registry) {
  if (registry.schemaVersion !== 1 || registry.repository !== 'Gethe/wow-ui-source') throw new Error('Invalid target registry');
  if (Object.keys(registry.targets).sort().join(',') !== Object.keys(branches).sort().join(',')) throw new Error('Unexpected target set');
  for (const [id, branch] of Object.entries(branches)) {
    const item = registry.targets[id];
    if (item.branch !== branch || !/^[a-f0-9]{40}$/.test(item.commit) || !/^[a-f0-9]{64}$/.test(item.fingerprint)) throw new Error(`Invalid snapshot identity: ${id}`);
    if (item.interface !== interfaceFromVersion(item.version) || !Number.isFinite(Date.parse(item.verifiedAt))) throw new Error(`Invalid snapshot version/date: ${id}`);
    if (!item.interfaceEvidence?.includes('Derived') || !item.verification) throw new Error(`Missing evidence scope: ${id}`);
    for (const key of ['version', 'api', 'ui']) {
      if (!item.sources[key]?.startsWith(`https://github.com/Gethe/wow-ui-source/`) || !item.sources[key].includes(`/${item.commit}/`)) throw new Error(`Unpinned source: ${id}/${key}`);
    }
  }
}
export async function validate(base = root) {
  const errors = [];
  const plugin = path.join(base, 'plugins/wow-addon-dev');
  const sourceSkills = (await files(path.join(base, 'skills'))).filter(file => path.relative(path.join(base, 'skills'), file).startsWith('wow-'));
  const settings = await readJSON(path.join(base, '.vscode/settings.json'));
  if (settings['chat.agentSkillsLocations']?.['./skills'] !== true) errors.push('VS Code must discover the maintained skills directory');
  for (const relative of ['agents/wow-addon.md', 'agents/ai-builder.md', 'instructions/wow-api.instructions.md', '.github/agents/ai-builder.md']) {
    const file = path.join(base, relative);
    const metadata = YAML.parse(frontmatter(await fs.readFile(file, 'utf8')).yaml);
    if (!metadata.name || !metadata.description) errors.push(`Missing source metadata: ${relative}`);
    errors.push(...(await validateLinks(file, base)).map(message => `${relative}: ${message}`));
  }
  const docs = [...sourceSkills, ...await files(plugin), path.join(base, '.github/agents/wow-addon.agent.md'), path.join(base, '.github/instructions/wow-api-important.instructions.md'), path.join(base,'README.md'), path.join(base,'CONTRIBUTING.md'), ...await files(path.join(base,'docs'))];
  for (const file of docs) {
    try {
      if (file.endsWith('SKILL.md')) validateSkill(await fs.readFile(file, 'utf8'), path.basename(path.dirname(file)));
      if (file.endsWith('.md')) {
        const boundary = file.startsWith(plugin + path.sep) ? plugin : base;
        errors.push(...(await validateLinks(file, boundary)).map(message => `${path.relative(base, file)}: ${message}`));
      }
    } catch (error) { errors.push(`${path.relative(base, file)}: ${error.message}`); }
  }
  validateRegistry(await readJSON(path.join(base, registryPath)));
  const portable = await readJSON(path.join(plugin, 'plugin.json'));
  const allowed = ['$schema','name','version','description','author','homepage','repository','license','keywords','extensions'];
  if (portable.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json' || Object.keys(portable).some(key => !allowed.includes(key))) errors.push('Invalid portable manifest envelope');
  for (const file of ['.codex-plugin/plugin.json','.claude-plugin/plugin.json']) {
    const manifest = await readJSON(path.join(plugin,file));
    if (manifest.name !== portable.name || manifest.version !== portable.version) errors.push(`Manifest identity mismatch: ${file}`);
  }
  for (const file of ['.agents/plugins/marketplace.json','.claude-plugin/marketplace.json','.github/plugin/marketplace.json']) {
    const market = await readJSON(path.join(base,file));
    if (market.name !== 'wow-addon-api-agents' || market.plugins.length !== 1) errors.push(`Invalid catalog: ${file}`);
    const entry = market.plugins[0];
    if (entry.name !== portable.name || (typeof entry.source === 'string' ? entry.source : entry.source.path) !== './plugins/wow-addon-dev') errors.push(`Invalid marketplace source: ${file}`);
  }
  const skills = await fs.readdir(path.join(plugin,'skills'));
  if (skills.length !== 35 || skills.some(name => !name.startsWith('wow-'))) errors.push('Expected 33 WoW domain skills plus two workflow/target skills');
  const workflowPath = path.join(base,'.github/workflows/update-wow-api.md');
  try {
    const workflow = YAML.parse(frontmatter(await fs.readFile(workflowPath,'utf8')).yaml);
    if (workflow.engine.id !== 'copilot' || workflow.engine.model !== 'sonnet' || workflow['timeout-minutes'] !== 20) errors.push('Unexpected update engine/model/timeout');
    if (workflow['safe-outputs']['merge-pull-request'] || workflow.permissions.contents !== 'read') errors.push('Updater must not merge or grant agent write permissions');
    if (workflow['safe-outputs']['create-pull-request']['max'] !== 1) errors.push('Updater must create at most one PR');
    if (workflow.jobs?.safe_outputs?.if !== "needs.agent.result == 'success'") errors.push('Publication must require successful post-agent validation');
  } catch (error) { errors.push(`Workflow: ${error.message}`); }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Validated ${skills.length} packaged skills, manifests, target registry, workflow policy, and local links.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) validate().catch(error => { console.error(error.message); process.exitCode = 1; });
