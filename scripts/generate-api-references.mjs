import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { extractReferenceRecords } from './reference-data.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiPath = 'Interface/AddOns/Blizzard_APIDocumentationGenerated';
const indexDir = 'skills/wow-api-index/references/generated';
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const hash = text => createHash('sha256').update(text).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const countKinds = records => Object.fromEntries([...new Set(records.map(r => r.kind))].sort(compare).map(kind => [kind, records.filter(r => r.kind === kind).length]));
const sourceURL = (commit, file, line) => `https://github.com/Gethe/wow-ui-source/blob/${commit}/${apiPath}/${file}#L${line}`;
const evidence = { declaration: 'source-declared', loadConditions: 'unknown', runtime: 'unknown', addonAccess: 'unknown' };
const skillsPrefix = relative => relative.replace(/^skills\//, '');

async function filesUnder(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) result.push(...await filesUnder(path.join(dir, entry.name)));
    else result.push(path.join(dir, entry.name));
  }
  return result;
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
    return row;
  };
  const manifest = { schemaVersion: 1, generatorVersion: 1, sourceRepository: registry.repository, sourceBasePath: apiPath,
    scope: 'Complete generated declaration schemas at pinned commits. Handwritten Lua/FrameXML, XML definitions, macro grammar and runtime-only exports are separate surfaces.',
    statusMeaning: 'Source declaration is verified by extraction; loading, runtime behavior and addon access remain unknown unless a curated reference supplies separate evidence. Environment All is not addon permission. CallbackEvent is not a frame-event subscription.',
    representation: 'All declaration fields and nested schemas are retained except Documentation prose; original prose remains at each pinned source. luaExpression preserves unevaluated Lua expressions; luaStringBody preserves escaped Lua string bodies without executing them. Empty Lua tables are JSON arrays; mixed tables use luaFields/luaValues.',
    ownerConfigHash: hash(JSON.stringify(owners)), targets: {}, chunks: [], groups: {}, sourceFiles: {}, artifacts: [] };
  const outputs = new Map(), allRecords = {};
  const index = { schemaVersion: 1, columns: ['symbol', 'kind', 'owner'], targets: {} };
  const usedGroups = new Set(), usedFiles = new Set();
  for (const [target, metadata] of Object.entries(registry.targets)) {
    const checkout = path.join(sourceRoot, target);
    const sha = execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (sha !== metadata.commit) throw new Error(`${target}: source HEAD differs from pinned commit`);
    if (execFileSync('git', ['-C', checkout, 'status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()) throw new Error(`${target}: dirty source checkout`);
    if ((await fs.readFile(path.join(checkout, 'version.txt'), 'utf8')).trim() !== metadata.version) throw new Error(`${target}: version mismatch`);
    const blobs = Object.fromEntries(execFileSync('git', ['-C', checkout, 'ls-files', '-s', '--', apiPath], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim().split('\n').filter(Boolean).map(line => { const [meta, file] = line.split('\t'); return [file, meta.split(' ')[1]]; }));
    const records = [], sourceFiles = {};
    const sourceDir = path.join(checkout, apiPath);
    const files = (await fs.readdir(sourceDir)).filter(f => f.endsWith('.lua')).sort(compare);
    for (const file of files) {
      const parsed = extractReferenceRecords(await fs.readFile(path.join(sourceDir, file), 'utf8'), file);
      if (!owners.files[file]) throw new Error(`Missing file owner: ${file}`);
      usedFiles.add(file);
      sourceFiles[file] = { blob: blobs[`${apiPath}/${file}`], records: parsed.records.length, owner: owners.files[file].owner };
      if (!/^[a-f0-9]{40}$/.test(sourceFiles[file].blob || '')) throw new Error(`Missing source blob: ${target}/${file}`);
      for (const system of parsed.systems) {
        const ownership = ownerFor(system.group, file);
        usedGroups.add(system.group);
        const group = manifest.groups[system.group] ??= { ...ownership, targets: [] };
        if (!group.targets.includes(target)) group.targets.push(target);
      }
      for (const record of parsed.records) {
        const ownership = ownerFor(record.group, file);
        usedGroups.add(record.group);
        const group = manifest.groups[record.group] ??= { ...ownership, targets: [] };
        if (!group.targets.includes(target)) group.targets.push(target);
        records.push({ ...record, owner: ownership.owner,
          classification: record.environment === 'SecureOnly' ? 'secure-only' : ownership.classification,
          evidence: { ...evidence } });
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
    }
    allRecords[target] = records;
    manifest.targets[target] = { branch: metadata.branch, commit: sha, version: metadata.version, sourceFiles: files.length, records: records.length, kinds: countKinds(records) };
    manifest.sourceFiles[target] = sourceFiles;
    index.targets[target] = records.map(r => [r.symbol, r.kind, r.owner]);
    for (const owner of [...new Set(records.map(r => r.owner))].sort(compare)) {
      const subset = records.filter(r => r.owner === owner);
      const relative = `skills/${owner}/references/generated/${target}.json`;
      const header = { schemaVersion: 1, target, owner, repository: registry.repository, commit: sha, version: metadata.version, sourceBasePath: apiPath, records: subset.length };
      const content = JSON.stringify(header).slice(0, -1) + ',"declarations":[\n' + subset.map(r => JSON.stringify(r)).join(',\n') + '\n]}\n';
      outputs.set(relative, content);
      manifest.chunks.push({ target, owner, path: skillsPrefix(relative), sha256: hash(content), records: subset.length, kinds: countKinds(subset) });
    }
  }
  for (const [kind, entries, used] of [['group', owners.groups, usedGroups], ['file', owners.files, usedFiles]]) {
    for (const key of Object.keys(entries)) if (!used.has(key)) throw new Error(`Stale ${kind} ownership row: ${key}`);
  }
  manifest.groups = Object.fromEntries(Object.entries(manifest.groups).sort(([a], [b]) => compare(a, b)));
  const indexContent = JSON.stringify(index) + '\n';
  outputs.set(`${indexDir}/symbols.json`, indexContent);
  manifest.symbolIndex = { path: skillsPrefix(`${indexDir}/symbols.json`), sha256: hash(indexContent) };
  for (const owner of [...new Set(manifest.chunks.map(c => c.owner))].sort(compare)) {
    const rows = manifest.chunks.filter(c => c.owner === owner);
    const lines = [`# ${owner}: generated declaration ledger`, '', 'These are complete extracted source schemas for this domain at the pinned commits. They establish declarations, not addon-facing availability. Load conditions, runtime behavior and addon access are explicitly unknown. Read the handwritten current guide for semantic and loading evidence; preserve restrictions when implementing.', '', '| Target | Build | Declarations | Source schemas |', '|---|---|---:|---|'];
    for (const row of rows) lines.push(`| ${row.target} | ${manifest.targets[row.target].version} | ${row.records} | [${row.target}.json](${row.target}.json) |`);
    lines.push('', 'Use the [package-local query tool](../../../wow-api-index/scripts/query.mjs) to retrieve a named function, event, structure, enum, callback type or predicate without reading the entire file. The [catalogue guide](../../../wow-api-index/references/CURRENT-REFERENCES.md) describes querying, schema representation and evidence status.', '');
    outputs.set(`skills/${owner}/references/generated/README.md`, lines.join('\n'));
  }
  const namespaceRows = Object.entries(manifest.groups).filter(([group]) => group.startsWith('C_'));
  const namespaceMD = ['# Namespace → skill lookup', '', 'Complete routing for every declared `C_` system in the pinned generated inventories. This is ownership, not cross-client support. Target presence is source-only. For global systems, objects and data definitions use the [complete domain routing](DOMAIN-SKILLS.md) and [query tool](../scripts/query.mjs).', '', '| Namespace | Owner | Declared targets | Scope classification |', '|---|---|---|---|'];
  for (const [group, row] of namespaceRows) namespaceMD.push(`| \`${group}\` | [${row.owner}](../../${row.owner}/SKILL.md) | ${row.targets.join(', ')} | ${row.classification} |`);
  namespaceMD.push('');
  outputs.set('skills/wow-api-index/references/NAMESPACE-LOOKUP.md', namespaceMD.join('\n'));
  const domainMD = ['# Domain routing and evidence status', '', 'Every domain below exists. Generated-schema completeness is measured against pinned declarations; it is separate from load-path, runtime and permission verification. Handwritten UI helpers, XML, macros and CVars need their own source evidence. No checkmark means every API is tested.', '', '| Skill | Generated declarations (Retail / Forever / Classic) | Current ledger |', '|---|---|---|'];
  for (const owner of [...knownSkills].sort(compare)) {
    const rows = ['retail','forever','classic'].map(target => manifest.chunks.find(c => c.target === target && c.owner === owner)?.records || 0);
    domainMD.push(`| [${owner}](../../${owner}/SKILL.md) | ${rows.join(' / ')} | ${rows.some(Boolean) ? `[source schemas](../../${owner}/references/generated/README.md)` : 'Workflow or non-generated surface; see skill'} |`);
  }
  domainMD.push('', '## Complete system ownership', '', '| Namespace / global / object / data system | Owner | Scope classification | Declared targets |', '|---|---|---|---|');
  for (const [group, row] of Object.entries(manifest.groups)) domainMD.push(`| \`${group}\` | ${row.owner} | ${row.classification} | ${row.targets.join(', ')} |`);
  domainMD.push('');
  outputs.set('skills/wow-api-index/references/DOMAIN-SKILLS.md', domainMD.join('\n'));
  const eventNames = [...new Set(Object.values(allRecords).flat().filter(r => r.kind === 'event').map(r => r.symbol))].sort(compare);
  const bands = [['A-F', /^[A-F]/], ['G-L', /^[G-L]/], ['M-R', /^[M-R]/], ['S-Z', /^[S-Z]/]];
  for (const event of eventNames) if (bands.filter(([,pattern])=>pattern.test(event)).length !== 1) throw new Error(`Event is not assigned exactly once to a catalogue band: ${event}`);
  for (const [band, pattern] of bands) {
    const lines = [`# Current event catalogue: ${band}`, '', 'Every row is a generated Event declaration in at least one pinned target. Source presence does not certify frame registration or addon access. `CallbackEvent` declarations use a different dispatch mechanism. Follow the source or retrieve the full typed payload and restrictions with the [query tool](../../wow-api-index/scripts/query.mjs); the [event skill](../SKILL.md) explains usage.', '', '| Event | Target: owner / payload source |', '|---|---|'];
    for (const event of eventNames.filter(e => pattern.test(e))) {
      const cells = Object.entries(allRecords).flatMap(([target, records]) => records.filter(r => r.kind === 'event' && r.symbol === event).map(r => `[${target}: ${r.owner}${r.declaration.CallbackEvent ? ' (callback)' : ''}](${sourceURL(manifest.targets[target].commit, r.source.file, r.source.line)})`));
      lines.push(`| \`${event}\` | ${cells.join('; ')} |`);
    }
    lines.push('');
    outputs.set(`skills/wow-api-events/references/EVENTS-${band}.md`, lines.join('\n'));
  }
  for (const [relative, content] of outputs) {
    if (!relative.endsWith('.json') || relative.endsWith('symbols.json')) manifest.artifacts.push({ path: skillsPrefix(relative), sha256: hash(content) });
  }
  outputs.set(`${indexDir}/manifest.json`, json(manifest));
  if (write) for (const [relative, content] of outputs) { await fs.mkdir(path.dirname(path.join(base, relative)), { recursive: true }); await fs.writeFile(path.join(base, relative), content); }
  return { manifest, outputs };
}

export async function validateReferences(base = root) {
  const skills = path.join(base, 'skills');
  const manifest = JSON.parse(await fs.readFile(path.join(base, indexDir, 'manifest.json'), 'utf8'));
  const owners = JSON.parse(await fs.readFile(path.join(base, 'config/api-owners.json'), 'utf8'));
  const registry = JSON.parse(await fs.readFile(path.join(skills, 'wow-client-targets/references/targets.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.ownerConfigHash !== hash(JSON.stringify(owners))) throw new Error('Ownership config drift: regenerate references');
  if (Object.keys(manifest.targets).sort().join(',') !== Object.keys(registry.targets).sort().join(',')) throw new Error('Reference target set differs from registry');
  if (Object.keys(manifest.groups).sort().join('\0') !== Object.keys(owners.groups).sort().join('\0')) throw new Error('Incomplete system ownership');
  for (const [group,row] of Object.entries(manifest.groups)) if (row.owner !== owners.groups[group].owner || row.classification !== owners.groups[group].classification) throw new Error(`System ownership drift: ${group}`);
  const allRecords = {};
  for (const [target, m] of Object.entries(manifest.targets)) {
    if (m.commit !== registry.targets[target]?.commit || m.version !== registry.targets[target]?.version || m.branch !== registry.targets[target]?.branch) throw new Error(`Unpinned reference target: ${target}`);
    allRecords[target] = [];
  }
  const safePath = relative => {
    const full = path.resolve(skills, relative);
    if (!full.startsWith(skills + path.sep)) throw new Error('Reference manifest path escaped skills');
    return full;
  };
  for (const chunk of manifest.chunks) {
    const text = await fs.readFile(safePath(chunk.path), 'utf8');
    if (hash(text) !== chunk.sha256) throw new Error(`Reference hash drift: ${chunk.path}`);
    const data = JSON.parse(text);
    if (data.commit !== manifest.targets[chunk.target]?.commit || data.target !== chunk.target || data.owner !== chunk.owner || data.records !== chunk.records || data.declarations.length !== chunk.records) throw new Error(`Reference metadata drift: ${chunk.path}`);
    if (JSON.stringify(countKinds(data.declarations)) !== JSON.stringify(chunk.kinds)) throw new Error(`Reference kind counts drift: ${chunk.path}`);
    for (const r of data.declarations) {
      if (r.owner !== chunk.owner || owners.groups[r.group]?.owner !== r.owner || !owners.files[r.source.file]) throw new Error(`Unowned record: ${r.id}`);
      if (!Number.isInteger(r.source.line) || r.source.line < 1 || !r.parent?.metadata || !r.declaration?.Name || !r.declaration?.Type) throw new Error(`Incomplete schema: ${r.id}`);
      if (JSON.stringify(r.evidence) !== JSON.stringify(evidence)) throw new Error(`Unsupported evidence promotion: ${r.id}`);
      if (r.kind === 'event' && r.symbol !== r.declaration.LiteralName) throw new Error(`Event literal mismatch: ${r.id}`);
    }
    allRecords[chunk.target].push(...data.declarations);
  }
  for (const [target, records] of Object.entries(allRecords)) {
    const expected = manifest.targets[target];
    if (records.length !== expected.records || JSON.stringify(countKinds(records)) !== JSON.stringify(expected.kinds)) throw new Error(`Incomplete target inventory: ${target}`);
    if (new Set(records.map(r => r.id)).size !== records.length) throw new Error(`Duplicate records: ${target}`);
    const sources = manifest.sourceFiles[target];
    if (Object.keys(sources).length !== expected.sourceFiles) throw new Error(`Source file inventory drift: ${target}`);
    for (const [file, metadata] of Object.entries(sources)) {
      if (!owners.files[file] || metadata.owner !== owners.files[file].owner || !/^[a-f0-9]{40}$/.test(metadata.blob) || records.filter(r => r.source.file === file).length !== metadata.records) throw new Error(`Incomplete source definitions: ${target}/${file}`);
    }
    for (const r of records) if (!sources[r.source.file]) throw new Error(`Unknown source file: ${r.id}`);
  }
  for (const artifact of [...manifest.artifacts, manifest.symbolIndex]) {
    if (hash(await fs.readFile(safePath(artifact.path), 'utf8')) !== artifact.sha256) throw new Error(`Generated navigation drift: ${artifact.path}`);
  }
  const symbols = JSON.parse(await fs.readFile(safePath(manifest.symbolIndex.path), 'utf8'));
  for (const [target, records] of Object.entries(allRecords)) {
    const expected = records.sort((a,b)=>compare(a.id,b.id)).map(r => [r.symbol,r.kind,r.owner]);
    if (JSON.stringify(symbols.targets[target]) !== JSON.stringify(expected)) throw new Error(`Symbol index incomplete: ${target}`);
  }
  // Independent semantic anchors catch regressions in extraction, not merely
  // regenerated hashes. These are build-scoped contracts from pinned sources.
  const get = (target, symbol) => allRecords[target].find(r=>r.symbol===symbol);
  for (const target of Object.keys(allRecords)) {
    const spell = get(target, 'C_Spell.GetSpellInfo')?.declaration;
    if (spell?.Arguments?.[0]?.Name !== 'spellIdentifier' || spell?.Returns?.[0]?.Type !== 'SpellInfo' || spell?.MayReturnNothing !== true) throw new Error(`SpellInfo contract drift: ${target}`);
  }
  const aura = get('forever','C_UnitAuras.GetAuraDataByIndex')?.declaration;
  if (aura?.RequiresUnitAuraAccess !== true || aura?.SecretWhenUnitAuraRestricted !== true || aura?.Returns?.[0]?.Nilable !== true) throw new Error('Aura restrictions/nilability lost');
  if (get('forever','InCombatLockdown')?.namespace !== null || get('forever','C_StringUtil.GetDefaultAbbreviationBreakpoints')?.namespace !== 'C_StringUtil') throw new Error('Namespace override semantics lost');
  for (const target of ['retail','forever']) {
    const duration = get(target,'C_Spell.GetSpellCooldownDuration')?.declaration;
    if (duration?.Returns?.[0]?.Type !== 'LuaDurationObject' || duration?.MayReturnNothing !== true || duration?.Arguments?.[1]?.Name !== 'ignoreGCD' || duration?.Arguments?.[1]?.Default !== false) throw new Error(`Duration object contract drift: ${target}`);
    const meter = allRecords[target].filter(r=>r.group==='C_DamageMeter'&&r.kind==='function').map(r=>r.name).sort();
    const expected = ['GetAvailableCombatSessions','GetCombatSessionFromID','GetCombatSessionFromType','GetCombatSessionSourceFromID','GetCombatSessionSourceFromType','GetSessionDurationSeconds','IsDamageMeterAvailable','ResetAllCombatSessions'].sort();
    if (JSON.stringify(meter) !== JSON.stringify(expected)) throw new Error(`Damage meter function contract drift: ${target}`);
    const eventNames = allRecords[target].filter(r=>r.group==='C_DamageMeter'&&r.kind==='event').map(r=>r.symbol).sort();
    if (eventNames.join(',') !== ['DAMAGE_METER_COMBAT_SESSION_UPDATED','DAMAGE_METER_CURRENT_SESSION_UPDATED','DAMAGE_METER_RESET'].join(',')) throw new Error(`Damage meter event inventory drift: ${target}`);
    const session = get(target,'DAMAGE_METER_COMBAT_SESSION_UPDATED')?.declaration;
    if (session?.Payload?.map(p=>`${p.Name}:${p.Type}:${p.Nilable}`).join(',') !== 'type:DamageMeterType:false,sessionID:number:false') throw new Error(`Damage meter payload drift: ${target}`);
    for (const name of ['DAMAGE_METER_CURRENT_SESSION_UPDATED','DAMAGE_METER_RESET']) if ((get(target,name)?.declaration.Payload || []).length) throw new Error(`Unexpected meter payload: ${target}/${name}`);
  }
  for (const target of Object.keys(allRecords)) {
    const payload = get(target,'SPELL_UPDATE_COOLDOWN')?.declaration.Payload;
    const expected = ['spellID','baseSpellID','category','startRecoveryCategory',...(target==='classic'?[]:['itemID'])];
    if (payload?.map(p=>p.Name).join(',') !== expected.join(',') || payload.some(p=>p.Type!=='number'||p.Nilable!==true)) throw new Error(`Cooldown event contract drift: ${target}`);
  }
  const swing = get('forever','PLAYER_SWING')?.declaration;
  if (swing?.Payload?.map(p=>p.Name).join(',') !== 'swingDuration,swingType') throw new Error('PLAYER_SWING payload drift');
  const currentGuide = await fs.readFile(path.join(skills,'wow-api-index/references/CURRENT-REFERENCES.md'),'utf8');
  for (const [target,label] of [['retail','Retail'],['forever','Forever'],['classic','Classic progression']]) {
    const m=manifest.targets[target], n=value=>value.toLocaleString('en-US');
    const row=`| ${label} | ${m.version} | ${n(m.records)} | ${n(m.kinds.function)} / ${n(m.kinds.event)} / ${n(m.kinds.method)} |`;
    if (!currentGuide.includes(row)) throw new Error(`Current reference build summary drift: ${target}`);
  }
  for (const file of await filesUnder(path.join(skills, 'wow-api-events'))) if (file.endsWith('.md')) {
    const text = await fs.readFile(file,'utf8');
    if (text.split(/^#{1,6}[ \t]+[^\n]*$/m).slice(1).some(section=>!section.trim())) throw new Error(`Empty event section: ${file}`);
  }
  return { targets: Object.fromEntries(Object.entries(manifest.targets).map(([target,t])=>[target,t.kinds])), chunks: manifest.chunks.length, ownedGroups: Object.keys(manifest.groups).length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.includes('--check')) console.log(JSON.stringify(await validateReferences(),null,2));
  else if (process.argv.includes('--verify-source')) {
    const { outputs } = await generateReferences({ write: false });
    for (const [relative, content] of outputs) if (await fs.readFile(path.join(root,relative),'utf8') !== content) throw new Error(`Source-derived reference drift: ${relative}`);
    console.log(`Verified ${outputs.size} generated artifacts against pinned source checkouts.`);
  } else {
    const { manifest, outputs } = await generateReferences();
    console.log(JSON.stringify({ artifacts: outputs.size, targets: manifest.targets },null,2));
  }
}
