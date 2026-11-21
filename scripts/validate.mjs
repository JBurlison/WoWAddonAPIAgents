import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { root, files, frontmatter, readJSON, isMainModule } from './lib.mjs';
import { branches, interfaceFromVersion } from '../skills/wow-client-targets/scripts/targets.mjs';
import { registryPath } from './upstream.mjs';
import { validateVersions } from './version.mjs';

function stripFencedCode(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let fence = null;
  for (const line of lines) {
    if (!fence) {
      const m = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
      if (m) {
        fence = { ch: m[1][0], len: m[1].length };
        continue;
      }
      out.push(line);
    } else {
      const closeRe = new RegExp(`^[ \\t]{0,3}${fence.ch}{${fence.len},}[ \\t]*$`);
      if (closeRe.test(line)) fence = null;
    }
  }
  return out.join('\n');
}

function stripInlineCode(text) {
  return text.replace(/(`+)(?:(?!\1)[\s\S])*?\1/g, '');
}

export function headingSlug(rawHeading) {
  return rawHeading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(`+)([\s\S]*?)\1/g, (_, __, inner) => inner.replace(/[<>]/g, ''))
    .replace(/<[^>]+>/g, '')
    .replace(/[*~]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/ /g, '-');
}

async function getHeadings(file, headingCache) {
  const resolved = path.resolve(file);
  if (headingCache.has(resolved)) return headingCache.get(resolved);
  const stripped = stripFencedCode(await fs.readFile(resolved, 'utf8'));
  const counts = new Map();
  const slugs = new Set();
  for (const line of stripped.split('\n')) {
    const m = line.match(/^#{1,6}[ \t]+(.+?)[ \t]*#*$/);
    if (!m) continue;
    const base = headingSlug(m[1]);
    const count = counts.get(base) || 0;
    counts.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  headingCache.set(resolved, slugs);
  return slugs;
}

async function listDirCached(dir, dirCache) {
  const resolved = path.resolve(dir);
  if (dirCache.has(resolved)) return dirCache.get(resolved);
  const entries = new Set(await fs.readdir(resolved));
  dirCache.set(resolved, entries);
  return entries;
}

export function validateSkill(text, expectedName) {
  const { yaml } = frontmatter(text);
  const meta = YAML.parse(yaml, { uniqueKeys: true });
  if (meta.name !== expectedName || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name) || meta.name.length > 64) throw new Error('Invalid skill name');
  if (typeof meta.description !== 'string' || !meta.description.trim() || meta.description.length > 1024) throw new Error('Invalid skill description');
  return meta;
}

export async function validateLinks(file, boundary, dirCache = new Map(), headingCache = new Map()) {
  const text = stripInlineCode(stripFencedCode(await fs.readFile(file, 'utf8')));
  const errors = [];
  const boundaryResolved = path.resolve(boundary);
  for (const match of text.matchAll(/\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:)/.test(url)) continue;
    const hashIndex = url.indexOf('#');
    const targetPart = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
    const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
    const resolved = targetPart ? path.resolve(path.dirname(file), decodeURIComponent(targetPart)) : path.resolve(file);
    const relative = path.relative(boundaryResolved, resolved);
    if (path.isAbsolute(relative) || relative.startsWith('..')) { errors.push(`Link escapes package: ${url}`); continue; }
    try {
      // Case-sensitive existence also on Windows, matching Linux installations.
      let cursor = boundaryResolved;
      for (const segment of relative.split(path.sep).filter(Boolean)) {
        if (!(await listDirCached(cursor, dirCache)).has(segment)) throw new Error('missing');
        cursor = path.join(cursor, segment);
      }
      if (fragment && resolved.toLowerCase().endsWith('.md')) {
        const slugs = await getHeadings(resolved, headingCache);
        if (!slugs.has(decodeURIComponent(fragment).toLowerCase())) {
          errors.push(`Broken heading anchor: ${url}`);
        }
      }
    } catch {
      errors.push(`Broken or wrong-case link: ${url}`);
    }
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
      if (!item.sources[key]?.startsWith('https://github.com/Gethe/wow-ui-source/') || !item.sources[key].includes(`/${item.commit}/`)) throw new Error(`Unpinned source: ${id}/${key}`);
    }
  }
}

export async function validate(base = root) {
  await validateVersions(base);
  const errors = [];
  const dirCache = new Map();
  const headingCache = new Map();
  const plugin = path.resolve(base, 'plugins/wow-addon-dev');
  const sourceSkills = await files(path.join(base, 'skills'));
  const settings = await readJSON(path.join(base, '.vscode/settings.json'));
  if (settings['chat.agentSkillsLocations']?.['./skills'] !== true) errors.push('VS Code must discover the maintained skills directory');
  for (const relative of ['agents/wow-addon.md', 'agents/ai-builder.md', 'instructions/wow-api.instructions.md', '.github/agents/ai-builder.md']) {
    const file = path.join(base, relative);
    const metadata = YAML.parse(frontmatter(await fs.readFile(file, 'utf8')).yaml);
    if (!metadata.name || !metadata.description) errors.push(`Missing source metadata: ${relative}`);
    errors.push(...(await validateLinks(file, base, dirCache, headingCache)).map(message => `${relative}: ${message}`));
  }

  let totalWowDescChars = 0;
  const docs = [
    ...sourceSkills,
    ...await files(plugin),
    path.join(base, '.github/agents/wow-addon.agent.md'),
    path.join(base, '.github/instructions/wow-api-important.instructions.md'),
    path.join(base, 'README.md'),
    path.join(base, 'CONTRIBUTING.md'),
    ...await files(path.join(base, 'docs')),
  ];
  for (const file of docs) {
    try {
      if (file.endsWith('SKILL.md')) {
        const skillName = path.basename(path.dirname(file));
        const meta = validateSkill(await fs.readFile(file, 'utf8'), skillName);
        if (skillName.startsWith('wow-') && !path.resolve(file).startsWith(plugin + path.sep)) {
          if (meta.description.length > 320) errors.push(`${path.relative(base, file)}: WoW skill description exceeds 320 chars (${meta.description.length})`);
          totalWowDescChars += meta.description.length;
        }
      }
      if (file.endsWith('.md')) {
        const boundary = path.resolve(file).startsWith(plugin + path.sep) ? plugin : base;
        errors.push(...(await validateLinks(file, boundary, dirCache, headingCache)).map(message => `${path.relative(base, file)}: ${message}`));
      }
    } catch (error) {
      errors.push(`${path.relative(base, file)}: ${error.message}`);
    }
  }
  if (totalWowDescChars > 10000) errors.push(`Total WoW skill description budget exceeded: ${totalWowDescChars} > 10000 chars`);

  validateRegistry(await readJSON(path.join(base, registryPath)));
  const portable = await readJSON(path.join(plugin, 'plugin.json'));
  const allowed = ['$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions'];
  if (portable.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json' || Object.keys(portable).some(key => !allowed.includes(key))) errors.push('Invalid portable manifest envelope');
  for (const file of ['.codex-plugin/plugin.json', '.claude-plugin/plugin.json', '.antigravity-plugin/plugin.json']) {
    const manifest = await readJSON(path.join(plugin, file));
    if (manifest.name !== portable.name || manifest.version !== portable.version) errors.push(`Manifest identity mismatch: ${file}`);
  }
  const antigravity = await readJSON(path.join(plugin, '.antigravity-plugin/plugin.json'));
  const antigravityAllowed = ['name', 'displayName', 'version', 'description', 'author', 'homepage', 'repository', 'logo', 'suggestedPrompts', 'disabled'];
  if (Object.keys(antigravity).some(key => !antigravityAllowed.includes(key))) errors.push('Invalid Antigravity manifest envelope');
  if (antigravity.logo !== undefined) {
    const logo = antigravity.logo;
    if (typeof logo !== 'string' || !logo || logo.startsWith('/') || logo.startsWith('\\') || /^[a-z][a-z0-9+.-]*:/i.test(logo) || logo.split(/[\\/]/).includes('..') || !/\.(png|svg|jpg|jpeg|webp)$/i.test(logo)) {
      errors.push(`Invalid Antigravity logo path: ${logo}`);
    } else {
      const relLogo = path.relative(plugin, path.resolve(plugin, logo));
      try {
        let cursor = plugin;
        for (const seg of relLogo.split(path.sep).filter(Boolean)) {
          if (!(await listDirCached(cursor, dirCache)).has(seg)) throw new Error('missing');
          cursor = path.join(cursor, seg);
        }
      } catch {
        errors.push(`Missing or wrong-case Antigravity logo: ${logo}`);
      }
    }
  }
  if (antigravity.suggestedPrompts !== undefined) {
    if (!Array.isArray(antigravity.suggestedPrompts) || antigravity.suggestedPrompts.length < 1 || antigravity.suggestedPrompts.length > 3 || antigravity.suggestedPrompts.some(prompt => typeof prompt !== 'string' || !prompt.trim())) {
      errors.push('Invalid Antigravity suggestedPrompts');
    }
  }
  try {
    const rulesText = await fs.readFile(path.join(plugin, 'rules/AGENTS.md'), 'utf8');
    if (/^---\r?\n/.test(rulesText)) errors.push('Plugin rules/AGENTS.md must not include YAML frontmatter');
    if (Buffer.byteLength(rulesText, 'utf8') > 24000) errors.push('Plugin rules/AGENTS.md exceeds 24,000 byte limit');
  } catch { errors.push('Missing plugins/wow-addon-dev/rules/AGENTS.md'); }

  for (const relAgent of ['agents/wow-addon.md', 'com.github.copilot/agents/wow-addon.agent.md']) {
    const meta = YAML.parse(frontmatter(await fs.readFile(path.join(plugin, relAgent), 'utf8')).yaml);
    if (!meta?.name || !meta?.description) errors.push(`Missing generated agent metadata: ${relAgent}`);
  }

  for (const file of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json', '.github/plugin/marketplace.json']) {
    const market = await readJSON(path.join(base, file));
    if (market.name !== 'wow-addon-api-agents' || market.plugins.length !== 1) errors.push(`Invalid catalog: ${file}`);
    const entry = market.plugins[0];
    if (entry.name !== portable.name || (typeof entry.source === 'string' ? entry.source : entry.source.path) !== './plugins/wow-addon-dev') errors.push(`Invalid marketplace source: ${file}`);
  }
  const skills = await fs.readdir(path.join(plugin, 'skills'));
  const maintainedSkills = (await fs.readdir(path.join(base, 'skills'))).filter(name => name.startsWith('wow-')).sort();
  if (JSON.stringify(skills.sort()) !== JSON.stringify(maintainedSkills)) errors.push('Packaged skills must match the maintained WoW skill set exactly');

  const workflowPath = path.join(base, '.github/workflows/update-wow-api.md');
  try {
    const workflow = YAML.parse(frontmatter(await fs.readFile(workflowPath, 'utf8')).yaml);
    if (workflow.engine.id !== 'copilot' || workflow.engine.model !== 'sonnet' || workflow['timeout-minutes'] !== 20) errors.push('Unexpected update engine/model/timeout');
    if (workflow['safe-outputs']['merge-pull-request'] || workflow.permissions.contents !== 'read') errors.push('Updater must not merge or grant agent write permissions');
    if (workflow['safe-outputs']['create-pull-request']['max'] !== 1) errors.push('Updater must create at most one PR');
    if (workflow.jobs?.safe_outputs?.if !== "needs.agent.result == 'success'") errors.push('Publication must require successful post-agent validation');
  } catch (error) {
    errors.push(`Workflow: ${error.message}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Validated ${skills.length} packaged skills, manifests, target registry, workflow policy, and local links.`);
}

if (isMainModule(import.meta.url)) validate().catch(error => { console.error(error.message); process.exitCode = 1; });
