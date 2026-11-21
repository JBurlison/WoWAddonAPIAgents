import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { extractReferenceRecords } from './reference-data.mjs';
import { hardenedGit, isMainModule } from './lib.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiPath = 'Interface/AddOns/Blizzard_APIDocumentationGenerated';
const indexDir = 'skills/wow-api-index/references/generated';
const targetOrder = ['retail', 'forever', 'classic'];
const targetCodes = { retail: 'r', forever: 'f', classic: 'c' };
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const hash = text => createHash('sha256').update(text).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const countKinds = records => Object.fromEntries([...new Set(records.map(r => r.kind))].sort(compare).map(kind => [kind, records.filter(r => r.kind === kind).length]));
const evidence = { declaration: 'source-declared', loadConditions: 'unknown', runtime: 'unknown', addonAccess: 'unknown' };
const skillsPrefix = relative => relative.replace(/^skills\//, '');

// Keep one tuple per line so a changed export does not replace the entire index.
export function serializeSymbolIndex({ rows, ...metadata }) {
  return JSON.stringify(metadata).slice(0, -1) + ',"rows":[\n' + rows.map(row => JSON.stringify(row)).join(',\n') + '\n]}\n';
}

function serializeCatalog(header, declarations) {
  return JSON.stringify(header).slice(0, -1) + ',"declarations":[\n' + declarations.map(r => JSON.stringify(r)).join(',\n') + '\n]}\n';
}

function serializeProvenance(provenance) {
  const groupLines = Object.entries(provenance.groups).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`);
  const targetLines = Object.entries(provenance.sourceFiles).map(([target, files]) => {
    const fileLines = Object.entries(files).map(([f, meta]) => `${JSON.stringify(f)}:${JSON.stringify(meta)}`);
    return `${JSON.stringify(target)}:{\n${fileLines.join(',\n')}\n}`;
  });
  return `{"schemaVersion":${provenance.schemaVersion},"groups":{\n${groupLines.join(',\n')}\n},"sourceFiles":{\n${targetLines.join(',\n')}\n}}\n`;
}

function hasSecretValue(node) {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some(hasSecretValue);
  for (const [k, v] of Object.entries(node)) {
    if (k === 'NeverSecret' || k === 'Documentation') continue;
    if ((k.startsWith('Secret') || k === 'ConditionalSecret' || k === 'ConditionalSecretContents') && v !== false && v !== 'NotAllowed') return true;
    if (hasSecretValue(v)) return true;
  }
  return false;
}

function computeFlags(record) {
  const decl = record.declaration;
  let flags = '';
  if (hasSecretValue(decl)) flags += 'S';
  if (decl.IsProtectedFunction || decl.HasRestrictions) flags += 'P';
  if (record.environment === 'SecureOnly') flags += 'O';
  if (decl.CallbackEvent) flags += 'C';
  return flags;
}

async function filesUnder(dir) {
  const result = [];
  for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => compare(a.name, b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink not supported: ${full}`);
    if (entry.isDirectory()) result.push(...await filesUnder(full));
    else result.push(full);
  }
  return result;
}

async function readRealText(file) {
  const stat = await fs.lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Unexpected source file type: ${file}`);
  return fs.readFile(file, 'utf8');
}

function safeResolve(boundary, relative) {
  const full = path.resolve(boundary, relative);
  const rel = path.relative(path.resolve(boundary), full);
  if (!rel || path.isAbsolute(rel) || rel.startsWith('..')) throw new Error(`Reference path escaped boundary: ${relative}`);
  return full;
}

export async function generateReferences({ base = root, sourceRoot = path.join(base, '.cache/api-audit'), write = true } = {}) {
  const registry = JSON.parse(await fs.readFile(path.join(base, 'skills/wow-client-targets/references/targets.json'), 'utf8'));
  const owners = JSON.parse(await fs.readFile(path.join(base, 'config/api-owners.json'), 'utf8'));
  const knownSkills = new Set((await fs.readdir(path.join(base, 'skills'))).filter(s => s.startsWith('wow-')));
  const ownerFor = (group, file) => {
    const fileOwner = owners.files[file];
    const row = owners.groups[group];
    if (!row || !fileOwner) throw new Error(`Unowned source: ${group} / ${file}; update config/api-owners.json deliberately`);
    if (!knownSkills.has(row.owner) || !knownSkills.has(fileOwner.owner)) throw new Error(`Unknown owner: ${group}`);
    if (row.owner !== fileOwner.owner) throw new Error(`Ownership mismatch: group ${group} (${row.owner}) vs file ${file} (${fileOwner.owner})`);
    return row;
  };
  const manifest = {
    schemaVersion: 2, generatorVersion: 2, sourceRepository: registry.repository, sourceBasePath: apiPath,
    scope: 'Complete generated declaration schemas at pinned commits. Handwritten Lua/FrameXML, XML definitions, macro grammar and runtime-only exports are separate surfaces.',
    statusMeaning: 'Source declaration is verified by extraction; loading, runtime behavior and addon access remain unknown unless a curated reference supplies separate evidence. Environment All is not addon permission. CallbackEvent is not a frame-event subscription.',
    representation: 'Declarations shared identically across targets are stored once per domain in catalog.json with per-target source location and system mappings. Evidence and system metadata are hoisted per domain. luaExpression preserves unevaluated Lua expressions; luaStringBody preserves escaped Lua string bodies without executing them.',
    ownerConfigHash: hash(JSON.stringify(owners)), targets: {}, chunks: [], symbolIndex: null, provenance: null, artifacts: [],
  };
  const provenance = { schemaVersion: 2, groups: {}, sourceFiles: {} };
  const outputs = new Map(), allRecords = {}, byOwnerTarget = new Map();
  const usedGroups = new Set(), usedFiles = new Set();
  const git = hardenedGit();

  for (const [target, metadata] of Object.entries(registry.targets)) {
    const checkout = path.join(sourceRoot, target);
    const sha = git(checkout, ['rev-parse', 'HEAD']);
    if (sha !== metadata.commit) throw new Error(`${target}: source HEAD differs from pinned commit`);
    if (git(checkout, ['status', '--porcelain=v1', '--untracked-files=all', '--ignored']).length) throw new Error(`${target}: dirty source checkout`);
    if ((await readRealText(path.join(checkout, 'version.txt'))).trim() !== metadata.version) throw new Error(`${target}: version mismatch`);
    const blobs = Object.fromEntries(
      git(checkout, ['ls-files', '-s', '--', apiPath]).split(/\r?\n/).filter(Boolean).map(line => {
        const [meta, file] = line.split('\t');
        return [file, meta.split(' ')[1]];
      }),
    );
    const records = [], sourceFiles = {};
    const sourceDir = path.join(checkout, apiPath);
    const luaFiles = (await filesUnder(sourceDir)).filter(f => f.endsWith('.lua'))
      .map(full => ({ full, rel: path.relative(sourceDir, full).replaceAll('\\', '/') }))
      .sort((a, b) => compare(a.rel, b.rel));
    for (const { full, rel: file } of luaFiles) {
      if (!Object.hasOwn(blobs, `${apiPath}/${file}`)) throw new Error(`Untracked source file: ${target}/${file}`);
      const parsed = extractReferenceRecords(await readRealText(full), file);
      if (!owners.files[file]) throw new Error(`Missing file owner: ${file}`);
      usedFiles.add(file);
      sourceFiles[file] = { blob: blobs[`${apiPath}/${file}`], records: parsed.records.length, owner: owners.files[file].owner };
      if (!/^[a-f0-9]{40}$/.test(sourceFiles[file].blob || '')) throw new Error(`Missing source blob: ${target}/${file}`);
      for (const system of parsed.systems) {
        const ownership = ownerFor(system.group, file);
        usedGroups.add(system.group);
        const group = provenance.groups[system.group] ??= { ...ownership, targets: [] };
        if (!group.targets.includes(target)) group.targets.push(target);
      }
      for (const record of parsed.records) {
        const ownership = ownerFor(record.group, file);
        usedGroups.add(record.group);
        const group = provenance.groups[record.group] ??= { ...ownership, targets: [] };
        if (!group.targets.includes(target)) group.targets.push(target);
        records.push({
          ...record,
          owner: ownership.owner,
          classification: record.environment === 'SecureOnly' ? 'secure-only' : ownership.classification,
        });
      }
    }
    records.sort((a, b) => compare(a.id, b.id));
    const ids = new Set(), callableNames = new Set();
    for (const record of records) {
      if (ids.has(record.id)) throw new Error(`Duplicate ID: ${target}/${record.id}`);
      ids.add(record.id);
      if (['function', 'event', 'method'].includes(record.kind)) {
        const key = `${record.kind}:${record.symbol}`;
        if (callableNames.has(key)) throw new Error(`Duplicate export: ${target}/${key}`);
        callableNames.add(key);
      }
      const ownerBucket = byOwnerTarget.get(record.owner) ?? new Map();
      byOwnerTarget.set(record.owner, ownerBucket);
      const list = ownerBucket.get(target) ?? [];
      list.push(record);
      ownerBucket.set(target, list);
    }
    allRecords[target] = records;
    manifest.targets[target] = { branch: metadata.branch, commit: sha, version: metadata.version, sourceFiles: luaFiles.length, records: records.length, kinds: countKinds(records) };
    provenance.sourceFiles[target] = sourceFiles;
  }

  for (const [kind, entries, used] of [['group', owners.groups, usedGroups], ['file', owners.files, usedFiles]]) {
    for (const key of Object.keys(entries)) if (!used.has(key)) throw new Error(`Stale ${kind} ownership row: ${key}`);
  }
  provenance.groups = Object.fromEntries(Object.entries(provenance.groups).sort(([a], [b]) => compare(a, b)));

  const symbolMap = new Map();
  for (const owner of [...byOwnerTarget.keys()].sort(compare)) {
    const targetBuckets = byOwnerTarget.get(owner);
    const systems = {};
    const systemKeyByJson = new Map();
    const resolveSystemKey = parent => {
      const serialized = JSON.stringify(parent);
      const cached = systemKeyByJson.get(serialized);
      if (cached) return cached;
      const baseKey = `${parent.group}|${parent.section}|${parent.name}`;
      const key = Object.hasOwn(systems, baseKey) ? `${baseKey}#${hash(serialized).slice(0, 6)}` : baseKey;
      systems[key] = parent;
      systemKeyByJson.set(serialized, key);
      return key;
    };

    const declMap = new Map();
    const targetHeaders = {};
    for (const target of targetOrder) {
      const subset = targetBuckets.get(target);
      if (!subset?.length) continue;
      targetHeaders[target] = { commit: manifest.targets[target].commit, version: manifest.targets[target].version, records: subset.length, kinds: countKinds(subset) };
      for (const r of subset) {
        const sysKey = resolveSystemKey(r.parent);
        const canonical = JSON.stringify([r.kind, r.symbol, r.group, r.namespace, r.environment, r.classification, r.declaration]);
        let entry = declMap.get(canonical);
        if (entry && entry.targets[target]) {
          entry = null; // Preserve distinct entry if same-target collision ever occurred.
        }
        if (!entry) {
          entry = {
            kind: r.kind, symbol: r.symbol, group: r.group, namespace: r.namespace,
            environment: r.environment, classification: r.classification,
            declaration: r.declaration, targets: {},
          };
          const bucketKey = declMap.has(canonical) ? `${canonical}\0${target}\0${r.source.file}` : canonical;
          declMap.set(bucketKey, entry);
        }
        entry.targets[target] = { file: r.source.file, line: r.source.line, system: sysKey };

        const symKey = `${r.kind}\0${r.symbol}\0${r.owner}\0${r.group}`;
        let sym = symbolMap.get(symKey);
        if (!sym) {
          sym = { symbol: r.symbol, kind: r.kind, owner: r.owner, group: r.group, targetSet: new Set(), flagSet: new Set() };
          symbolMap.set(symKey, sym);
        }
        sym.targetSet.add(target);
        for (const ch of computeFlags(r)) sym.flagSet.add(ch);
      }
    }

    const sortedSystems = Object.fromEntries(Object.entries(systems).sort(([a], [b]) => compare(a, b)));
    const declarations = [...declMap.values()].sort((a, b) =>
      compare(a.kind, b.kind)
      || compare(a.symbol, b.symbol)
      || compare(Object.keys(a.targets).join(','), Object.keys(b.targets).join(','))
      || compare(Object.values(a.targets)[0].file, Object.values(b.targets)[0].file),
    );
    const relative = `skills/${owner}/references/generated/catalog.json`;
    const header = { schemaVersion: 2, owner, repository: registry.repository, sourceBasePath: apiPath, evidence, targets: targetHeaders, systems: sortedSystems };
    const content = serializeCatalog(header, declarations);
    outputs.set(relative, content);
    manifest.chunks.push({ owner, path: skillsPrefix(relative), sha256: hash(content), targets: Object.fromEntries(Object.entries(targetHeaders).map(([t, info]) => [t, { records: info.records, kinds: info.kinds }])) });
  }

  const symbolRows = [...symbolMap.values()]
    .sort((a, b) => compare(a.kind, b.kind) || compare(a.symbol, b.symbol) || compare(a.owner, b.owner) || compare(a.group, b.group))
    .map(s => [
      s.symbol,
      s.kind,
      s.owner,
      s.group,
      targetOrder.filter(t => s.targetSet.has(t)).map(t => targetCodes[t]).join(''),
      ['S', 'P', 'O', 'C'].filter(f => s.flagSet.has(f)).join(''),
    ]);
  const indexContent = serializeSymbolIndex({ schemaVersion: 2, columns: ['symbol', 'kind', 'owner', 'group', 'targets', 'flags'], rows: symbolRows });
  outputs.set(`${indexDir}/symbols.json`, indexContent);
  manifest.symbolIndex = { path: skillsPrefix(`${indexDir}/symbols.json`), sha256: hash(indexContent) };

  const provenanceContent = serializeProvenance(provenance);
  outputs.set(`${indexDir}/provenance.json`, provenanceContent);
  manifest.provenance = { path: skillsPrefix(`${indexDir}/provenance.json`), sha256: hash(provenanceContent) };

  for (const chunk of manifest.chunks) {
    const lines = [`# ${chunk.owner}: generated declaration ledger`, '', 'These are complete extracted source schemas for this domain at the pinned commits. They establish declarations, not addon-facing availability. Load conditions, runtime behavior and addon access are explicitly unknown. Read the handwritten current guide for semantic and loading evidence; preserve restrictions when implementing.', '', '| Target | Build | Declarations | Source schemas |', '|---|---|---:|---|'];
    for (const [target, info] of Object.entries(chunk.targets)) {
      lines.push(`| ${target} | ${manifest.targets[target].version} | ${info.records} | [catalog.json](catalog.json) |`);
    }
    lines.push('', `Use the [package-local query tool](../../../wow-api-index/scripts/query.mjs) (for example \`node ../../../wow-api-index/scripts/query.mjs forever --domain ${chunk.owner} --list\`) to retrieve a named function, event, structure, enum, callback type or predicate without reading the entire file. The [catalogue guide](../../../wow-api-index/references/CURRENT-REFERENCES.md) describes querying, schema representation and evidence status.`, '');
    outputs.set(`skills/${chunk.owner}/references/generated/README.md`, lines.join('\n'));
  }

  const namespaceRows = Object.entries(provenance.groups).filter(([group]) => group.startsWith('C_'));
  const namespaceMD = ['# Namespace → skill lookup', '', 'Complete routing for every declared `C_` system in the pinned generated inventories. This is ownership, not cross-client support. Target presence is source-only. For global systems, objects and data definitions use the [complete domain routing](DOMAIN-SKILLS.md) and [query tool](../scripts/query.mjs).', '', '| Namespace | Owner | Declared targets | Scope classification |', '|---|---|---|---|'];
  for (const [group, row] of namespaceRows) namespaceMD.push(`| \`${group}\` | [${row.owner}](../../${row.owner}/SKILL.md) | ${row.targets.join(', ')} | ${row.classification} |`);
  namespaceMD.push('');
  outputs.set('skills/wow-api-index/references/NAMESPACE-LOOKUP.md', namespaceMD.join('\n'));

  const domainMD = ['# Domain routing and evidence status', '', 'Every domain below exists. Generated-schema completeness is measured against pinned declarations; it is separate from load-path, runtime and permission verification. Handwritten UI helpers, XML, macros and CVars need their own source evidence. No checkmark means every API is tested.', '', '| Skill | Generated declarations (Retail / Forever / Classic) | Current ledger |', '|---|---|---|'];
  for (const owner of [...knownSkills].sort(compare)) {
    const chunk = manifest.chunks.find(c => c.owner === owner);
    const rows = targetOrder.map(target => chunk?.targets[target]?.records || 0);
    domainMD.push(`| [${owner}](../../${owner}/SKILL.md) | ${rows.join(' / ')} | ${rows.some(Boolean) ? `[source schemas](../../${owner}/references/generated/README.md)` : 'Workflow or non-generated surface; see skill'} |`);
  }
  domainMD.push('', '## Complete system ownership', '', '| Namespace / global / object / data system | Owner | Scope classification | Declared targets |', '|---|---|---|---|');
  for (const [group, row] of Object.entries(provenance.groups)) domainMD.push(`| \`${group}\` | ${row.owner} | ${row.classification} | ${row.targets.join(', ')} |`);
  domainMD.push('');
  outputs.set('skills/wow-api-index/references/DOMAIN-SKILLS.md', domainMD.join('\n'));

  const eventsByName = new Map();
  for (const target of targetOrder) {
    for (const r of allRecords[target]) {
      if (r.kind !== 'event') continue;
      let bucket = eventsByName.get(r.symbol);
      if (!bucket) { bucket = []; eventsByName.set(r.symbol, bucket); }
      bucket.push({ target, record: r });
    }
  }
  const eventNames = [...eventsByName.keys()].sort(compare);
  const bands = [['A-F', /^[A-F]/], ['G-L', /^[G-L]/], ['M-R', /^[M-R]/], ['S-Z', /^[S-Z]/]];
  for (const event of eventNames) if (bands.filter(([, pattern]) => pattern.test(event)).length !== 1) throw new Error(`Event is not assigned exactly once to a catalogue band: ${event}`);
  const headerTargets = [
    '| Target | Build | Pinned source |',
    '|---|---|---|',
    ...targetOrder.map(t => `| ${t} | ${manifest.targets[t].version} | [${manifest.targets[t].commit.slice(0, 8)}](https://github.com/${registry.repository}/tree/${manifest.targets[t].commit}/${apiPath}) |`),
  ];
  for (const [band, pattern] of bands) {
    const lines = [`# Current event catalogue: ${band}`, '', 'Every row is a generated Event declaration in at least one pinned target. Source presence does not certify frame registration or addon access. `CallbackEvent` declarations use a different dispatch mechanism. Retrieve the full typed payload, source URL and restrictions with the [query tool](../../wow-api-index/scripts/query.mjs); the [event skill](../SKILL.md) explains usage.', '', ...headerTargets, '', '| Event | Owner | Target declarations |', '|---|---|---|'];
    for (const event of eventNames.filter(e => pattern.test(e))) {
      const entries = eventsByName.get(event);
      const eventOwners = [...new Set(entries.map(e => e.record.owner))].sort(compare).map(o => `[${o}](../../${o}/SKILL.md)`).join(', ');
      const cells = entries.map(({ target, record: r }) => `${target} (\`${r.source.file}:${r.source.line}\`${r.declaration.CallbackEvent ? ' (callback)' : ''})`);
      lines.push(`| \`${event}\` | ${eventOwners} | ${cells.join(', ')} |`);
    }
    lines.push('');
    outputs.set(`skills/wow-api-events/references/EVENTS-${band}.md`, lines.join('\n'));
  }

  for (const [relative, content] of outputs) {
    if (!relative.endsWith('.json')) manifest.artifacts.push({ path: skillsPrefix(relative), sha256: hash(content) });
  }
  outputs.set(`${indexDir}/manifest.json`, json(manifest));
  if (write) {
    for (const [relative, content] of outputs) {
      await fs.mkdir(path.dirname(path.join(base, relative)), { recursive: true });
      await fs.writeFile(path.join(base, relative), content);
    }
    // Remove obsolete generated files (such as legacy per-target retail/forever/classic JSONs).
    for (const skill of await fs.readdir(path.join(base, 'skills'))) {
      if (!skill.startsWith('wow-')) continue;
      const genDir = path.join(base, 'skills', skill, 'references/generated');
      const exists = await fs.stat(genDir).catch(() => null);
      if (!exists?.isDirectory()) continue;
      for (const file of await filesUnder(genDir)) {
        const rel = path.relative(base, file).replaceAll('\\', '/');
        if (!outputs.has(rel)) await fs.unlink(file);
      }
    }
  }
  return { manifest, outputs };
}

export async function validateReferences(base = root) {
  const skills = path.join(base, 'skills');
  const manifest = JSON.parse(await fs.readFile(path.join(base, indexDir, 'manifest.json'), 'utf8'));
  const owners = JSON.parse(await fs.readFile(path.join(base, 'config/api-owners.json'), 'utf8'));
  const registry = JSON.parse(await fs.readFile(path.join(skills, 'wow-client-targets/references/targets.json'), 'utf8'));
  if (manifest.schemaVersion !== 2 || manifest.generatorVersion !== 2 || manifest.ownerConfigHash !== hash(JSON.stringify(owners))) throw new Error('Ownership config or schema drift: regenerate references');
  if (Object.keys(manifest.targets).sort().join(',') !== Object.keys(registry.targets).sort().join(',')) throw new Error('Reference target set differs from registry');

  const provenanceText = await fs.readFile(safeResolve(skills, manifest.provenance.path), 'utf8');
  if (hash(provenanceText) !== manifest.provenance.sha256) throw new Error(`Provenance hash drift: ${manifest.provenance.path}`);
  const provenance = JSON.parse(provenanceText);
  if (provenance.schemaVersion !== 2) throw new Error('Invalid provenance schemaVersion');
  if (Object.keys(provenance.groups).sort().join('\0') !== Object.keys(owners.groups).sort().join('\0')) throw new Error('Incomplete system ownership');
  for (const [group, row] of Object.entries(provenance.groups)) {
    if (row.owner !== owners.groups[group].owner || row.classification !== owners.groups[group].classification) throw new Error(`System ownership drift: ${group}`);
  }

  const allRecords = {};
  for (const [target, m] of Object.entries(manifest.targets)) {
    if (m.commit !== registry.targets[target]?.commit || m.version !== registry.targets[target]?.version || m.branch !== registry.targets[target]?.branch) throw new Error(`Unpinned reference target: ${target}`);
    allRecords[target] = [];
  }

  const expectedFiles = new Set([
    skillsPrefix(`${indexDir}/manifest.json`),
    manifest.provenance.path,
    manifest.symbolIndex.path,
    ...manifest.chunks.map(c => c.path),
    ...manifest.artifacts.map(a => a.path),
  ]);

  const symbolMap = new Map();
  for (const chunk of manifest.chunks) {
    const text = await fs.readFile(safeResolve(skills, chunk.path), 'utf8');
    if (hash(text) !== chunk.sha256) throw new Error(`Reference hash drift: ${chunk.path}`);
    const data = JSON.parse(text);
    if (data.schemaVersion !== 2 || data.owner !== chunk.owner || JSON.stringify(data.evidence) !== JSON.stringify(evidence)) throw new Error(`Reference metadata drift: ${chunk.path}`);
    const perTargetRecords = Object.fromEntries(targetOrder.map(t => [t, []]));
    for (const d of data.declarations) {
      if (owners.groups[d.group]?.owner !== chunk.owner) throw new Error(`Unowned group in ${chunk.path}: ${d.group}`);
      if (!d.declaration?.Name || !d.declaration?.Type) throw new Error(`Incomplete schema: ${d.symbol}`);
      if (d.kind === 'event' && d.symbol !== d.declaration.LiteralName) throw new Error(`Event literal mismatch: ${d.symbol}`);
      for (const [t, tMeta] of Object.entries(d.targets)) {
        if (!allRecords[t]) throw new Error(`Unexpected target ${t} in ${chunk.path}`);
        if (!owners.files[tMeta.file] || owners.files[tMeta.file].owner !== chunk.owner) throw new Error(`File/group ownership mismatch in ${chunk.path}: ${tMeta.file}`);
        if (!Number.isInteger(tMeta.line) || tMeta.line < 1 || !data.systems?.[tMeta.system]?.metadata) throw new Error(`Incomplete source/system metadata: ${d.symbol}/${t}`);
        const parent = data.systems[tMeta.system];
        const rehydrated = {
          id: `${d.kind}:${d.symbol}@${tMeta.file}`,
          kind: d.kind,
          symbol: d.symbol,
          name: d.declaration.Name,
          group: d.group,
          namespace: d.namespace,
          environment: d.environment,
          parent,
          source: { file: tMeta.file, line: tMeta.line },
          declaration: d.declaration,
          owner: chunk.owner,
          classification: d.classification,
          evidence,
        };
        perTargetRecords[t].push(rehydrated);
        allRecords[t].push(rehydrated);

        const symKey = `${d.kind}\0${d.symbol}\0${chunk.owner}\0${d.group}`;
        let sym = symbolMap.get(symKey);
        if (!sym) {
          sym = { symbol: d.symbol, kind: d.kind, owner: chunk.owner, group: d.group, targetSet: new Set(), flagSet: new Set() };
          symbolMap.set(symKey, sym);
        }
        sym.targetSet.add(t);
        for (const ch of computeFlags(rehydrated)) sym.flagSet.add(ch);
      }
    }
    for (const [t, info] of Object.entries(chunk.targets)) {
      if (data.targets[t]?.commit !== manifest.targets[t]?.commit || data.targets[t]?.records !== info.records || perTargetRecords[t].length !== info.records) throw new Error(`Chunk target count drift: ${chunk.path}/${t}`);
      if (JSON.stringify(countKinds(perTargetRecords[t])) !== JSON.stringify(info.kinds)) throw new Error(`Chunk kind counts drift: ${chunk.path}/${t}`);
    }
  }

  for (const [target, records] of Object.entries(allRecords)) {
    const expected = manifest.targets[target];
    if (records.length !== expected.records || JSON.stringify(countKinds(records)) !== JSON.stringify(expected.kinds)) throw new Error(`Incomplete target inventory: ${target}`);
    if (new Set(records.map(r => r.id)).size !== records.length) throw new Error(`Duplicate records: ${target}`);
    const sources = provenance.sourceFiles[target];
    if (Object.keys(sources).length !== expected.sourceFiles) throw new Error(`Source file inventory drift: ${target}`);
    const countsByFile = new Map();
    for (const r of records) {
      if (!sources[r.source.file]) throw new Error(`Unknown source file: ${r.id}`);
      countsByFile.set(r.source.file, (countsByFile.get(r.source.file) || 0) + 1);
    }
    for (const [file, metadata] of Object.entries(sources)) {
      if (!owners.files[file] || metadata.owner !== owners.files[file].owner || !/^[a-f0-9]{40}$/.test(metadata.blob) || (countsByFile.get(file) || 0) !== metadata.records) throw new Error(`Incomplete source definitions: ${target}/${file}`);
    }
  }

  for (const artifact of [...manifest.artifacts, manifest.symbolIndex]) {
    if (hash(await fs.readFile(safeResolve(skills, artifact.path), 'utf8')) !== artifact.sha256) throw new Error(`Generated navigation drift: ${artifact.path}`);
  }
  const symbols = JSON.parse(await fs.readFile(safeResolve(skills, manifest.symbolIndex.path), 'utf8'));
  const expectedSymbolRows = [...symbolMap.values()]
    .sort((a, b) => compare(a.kind, b.kind) || compare(a.symbol, b.symbol) || compare(a.owner, b.owner) || compare(a.group, b.group))
    .map(s => [
      s.symbol, s.kind, s.owner, s.group,
      targetOrder.filter(t => s.targetSet.has(t)).map(t => targetCodes[t]).join(''),
      ['S', 'P', 'O', 'C'].filter(f => s.flagSet.has(f)).join(''),
    ]);
  if (symbols.schemaVersion !== 2 || JSON.stringify(symbols.rows) !== JSON.stringify(expectedSymbolRows)) throw new Error('Symbol index incomplete or drifted');

  // Reject orphaned files inside skills/*/references/generated/.
  for (const skill of await fs.readdir(skills)) {
    if (!skill.startsWith('wow-')) continue;
    const genDir = path.join(skills, skill, 'references/generated');
    const exists = await fs.stat(genDir).catch(() => null);
    if (!exists?.isDirectory()) continue;
    for (const file of await filesUnder(genDir)) {
      const rel = path.relative(skills, file).replaceAll('\\', '/');
      if (!expectedFiles.has(rel)) throw new Error(`Orphaned generated file: ${rel}`);
    }
  }

  // Independent semantic anchors catch regressions in extraction, not merely
  // regenerated hashes. These are build-scoped contracts from pinned sources.
  const get = (target, symbol, kind) => allRecords[target].find(r => r.symbol === symbol && (!kind || r.kind === kind));
  for (const target of Object.keys(allRecords)) {
    const spell = get(target, 'C_Spell.GetSpellInfo', 'function')?.declaration;
    if (spell?.Arguments?.[0]?.Name !== 'spellIdentifier' || spell?.Returns?.[0]?.Type !== 'SpellInfo' || spell?.MayReturnNothing !== true) throw new Error(`SpellInfo contract drift: ${target}`);
  }
  const aura = get('forever', 'C_UnitAuras.GetAuraDataByIndex', 'function')?.declaration;
  if (aura?.RequiresUnitAuraAccess !== true || aura?.SecretWhenUnitAuraRestricted !== true || aura?.Returns?.[0]?.Nilable !== true) throw new Error('Aura restrictions/nilability lost');
  if (get('forever', 'InCombatLockdown', 'function')?.namespace !== null || get('forever', 'C_StringUtil.GetDefaultAbbreviationBreakpoints', 'function')?.namespace !== 'C_StringUtil') throw new Error('Namespace override semantics lost');
  for (const target of ['retail', 'forever']) {
    const duration = get(target, 'C_Spell.GetSpellCooldownDuration', 'function')?.declaration;
    if (duration?.Returns?.[0]?.Type !== 'LuaDurationObject' || duration?.MayReturnNothing !== true || duration?.Arguments?.[1]?.Name !== 'ignoreGCD' || duration?.Arguments?.[1]?.Default !== false) throw new Error(`Duration object contract drift: ${target}`);
    const meter = allRecords[target].filter(r => r.group === 'C_DamageMeter' && r.kind === 'function').map(r => r.name).sort();
    const expected = ['GetAvailableCombatSessions', 'GetCombatSessionFromID', 'GetCombatSessionFromType', 'GetCombatSessionSourceFromID', 'GetCombatSessionSourceFromType', 'GetSessionDurationSeconds', 'IsDamageMeterAvailable', 'ResetAllCombatSessions'].sort();
    if (JSON.stringify(meter) !== JSON.stringify(expected)) throw new Error(`Damage meter function contract drift: ${target}`);
    const eventNames = allRecords[target].filter(r => r.group === 'C_DamageMeter' && r.kind === 'event').map(r => r.symbol).sort();
    if (eventNames.join(',') !== ['DAMAGE_METER_COMBAT_SESSION_UPDATED', 'DAMAGE_METER_CURRENT_SESSION_UPDATED', 'DAMAGE_METER_RESET'].join(',')) throw new Error(`Damage meter event inventory drift: ${target}`);
    const session = get(target, 'DAMAGE_METER_COMBAT_SESSION_UPDATED', 'event')?.declaration;
    if (session?.Payload?.map(p => `${p.Name}:${p.Type}:${p.Nilable}`).join(',') !== 'type:DamageMeterType:false,sessionID:number:false') throw new Error(`Damage meter payload drift: ${target}`);
    for (const name of ['DAMAGE_METER_CURRENT_SESSION_UPDATED', 'DAMAGE_METER_RESET']) if ((get(target, name, 'event')?.declaration.Payload || []).length) throw new Error(`Unexpected meter payload: ${target}/${name}`);
  }
  for (const target of Object.keys(allRecords)) {
    const payload = get(target, 'SPELL_UPDATE_COOLDOWN', 'event')?.declaration.Payload;
    const expected = ['spellID', 'baseSpellID', 'category', 'startRecoveryCategory', ...(target === 'classic' ? [] : ['itemID'])];
    if (payload?.map(p => p.Name).join(',') !== expected.join(',') || payload.some(p => p.Type !== 'number' || p.Nilable !== true)) throw new Error(`Cooldown event contract drift: ${target}`);
  }
  const swing = get('forever', 'PLAYER_SWING', 'event')?.declaration;
  if (swing?.Payload?.map(p => p.Name).join(',') !== 'swingDuration,swingType') throw new Error('PLAYER_SWING payload drift');

  const n = value => value.toLocaleString('en-US');
  const currentGuide = await fs.readFile(path.join(skills, 'wow-api-index/references/CURRENT-REFERENCES.md'), 'utf8');
  for (const [target, label] of [['retail', 'Retail'], ['forever', 'Forever'], ['classic', 'Classic progression']]) {
    const m = manifest.targets[target];
    const row = `| ${label} | ${m.version} | ${n(m.records)} | ${n(m.kinds.function)} / ${n(m.kinds.event)} / ${n(m.kinds.method)} |`;
    if (!currentGuide.includes(row)) throw new Error(`Current reference build summary drift: ${target}`);
  }
  const eventGuide = await fs.readFile(path.join(skills, 'wow-api-events/references/RETAIL-BASELINE.md'), 'utf8');
  const callbackCounts = targetOrder.map(t => allRecords[t].filter(r => r.kind === 'event' && r.declaration.CallbackEvent).length);
  const joinAnd = list => `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`;
  const expectedEventSummary = `Retail ${manifest.targets.retail.version}, Forever ${manifest.targets.forever.version} and Classic progression ${manifest.targets.classic.version}`;
  const expectedEventCounts = `${joinAnd(targetOrder.map(t => n(manifest.targets[t].kinds.event)))} generated Event declarations, including ${joinAnd(callbackCounts.map(String))} marked CallbackEvent`;
  if (!eventGuide.includes(expectedEventSummary) || !eventGuide.includes(expectedEventCounts)) {
    throw new Error('Event summary baseline drift in wow-api-events/references/RETAIL-BASELINE.md');
  }
  for (const file of await filesUnder(path.join(skills, 'wow-api-events'))) if (file.endsWith('.md')) {
    const text = await fs.readFile(file, 'utf8');
    if (text.split(/^#{1,6}[ \t]+[^\n]*$/m).slice(1).some(section => !section.trim())) throw new Error(`Empty event section: ${file}`);
  }
  return { targets: Object.fromEntries(Object.entries(manifest.targets).map(([target, t]) => [target, t.kinds])), chunks: manifest.chunks.length, ownedGroups: Object.keys(provenance.groups).length };
}

if (isMainModule(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const allowed = new Set(['--check', '--verify-source', '--help']);
    const unknown = args.filter(arg => !allowed.has(arg));
    if (unknown.length) throw new Error(`Unknown option(s): ${unknown.join(', ')}. Use --check, --verify-source, --help, or no flags to generate.`);
    if (args.includes('--help')) {
      console.log('Usage: node scripts/generate-api-references.mjs [--check|--verify-source|--help]');
    } else if (args.includes('--check')) {
      console.log(JSON.stringify(await validateReferences(), null, 2));
    } else if (args.includes('--verify-source')) {
      const { outputs } = await generateReferences({ write: false });
      for (const [relative, content] of outputs) {
        if (await fs.readFile(path.join(root, relative), 'utf8') !== content) throw new Error(`Source-derived reference drift: ${relative}`);
      }
      console.log(`Verified ${outputs.size} generated artifacts against pinned source checkouts.`);
    } else {
      const { manifest, outputs } = await generateReferences();
      console.log(JSON.stringify({ artifacts: outputs.size, targets: manifest.targets }, null, 2));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
