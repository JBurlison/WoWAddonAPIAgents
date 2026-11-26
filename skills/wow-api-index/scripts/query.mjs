import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const defaultSkillsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const hash = text => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');
const aliases = { enum: 'enumeration', callback: 'callbacktype', struct: 'structure' };
const validKinds = ['function', 'event', 'method', 'structure', 'enumeration', 'callbacktype', 'constants', 'precondition', 'secret'];
const targetOrder = ['retail', 'forever', 'classic'];
const targetCodes = { retail: 'r', forever: 'f', classic: 'c' };
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function isMainModule(metaUrl) {
  if (!process.argv[1]) return false;
  try {
    const entry = fsSync.realpathSync(process.argv[1]);
    const self = fsSync.realpathSync(fileURLToPath(metaUrl));
    return process.platform === 'win32' ? entry.toLowerCase() === self.toLowerCase() : entry === self;
  } catch {
    return false;
  }
}

function safePath(skillsRoot, relative) {
  const base = path.resolve(skillsRoot);
  const full = path.resolve(base, relative);
  const rel = path.relative(base, full);
  if (!rel || path.isAbsolute(rel) || rel.startsWith('..')) throw new Error(`Invalid catalog path: ${relative}`);
  return full;
}

function hasSecretAnnotation(node) {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some(hasSecretAnnotation);
  for (const [k, v] of Object.entries(node)) {
    if (k === 'NeverSecret' || k === 'Documentation') continue;
    if ((k.startsWith('Secret') || k === 'ConditionalSecret' || k === 'ConditionalSecretContents') && v !== false && v !== 'NotAllowed') return true;
    if (hasSecretAnnotation(v)) return true;
  }
  return false;
}

function formatParam(p) {
  const typeName = p.InnerType ? `${p.Type}<${p.InnerType}>` : p.Type;
  const opt = p.Nilable ? '?' : '';
  const def = Object.hasOwn(p, 'Default') ? `=${JSON.stringify(p.Default)}` : '';
  return `${p.Name}: ${typeName}${opt}${def}`;
}

function formatAnnotations(record) {
  const d = record.declaration;
  const skip = new Set(['Name', 'Type', 'Arguments', 'Returns', 'Payload', 'Fields', 'Values', 'LiteralName', 'Namespace']);
  const tags = [];
  if (record.environment && record.environment !== 'All') tags.push(`Environment=${record.environment}`);
  for (const [k, v] of Object.entries(d)) {
    if (skip.has(k)) continue;
    tags.push(v === true ? k : `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
  return tags;
}

function formatSignature(record) {
  const d = record.declaration;
  const tags = formatAnnotations(record);
  const suffix = tags.length ? ` [${tags.join(', ')}]` : '';
  if (record.kind === 'function' || record.kind === 'method') {
    const args = (d.Arguments || []).map(formatParam).join(', ');
    const rets = (d.Returns || []).map(formatParam).join(', ');
    return `${record.symbol}(${args})${rets ? ` -> ${rets}` : ''}${suffix}`;
  }
  if (record.kind === 'event') {
    const payload = (d.Payload || []).map(formatParam).join(', ');
    return `${record.symbol}(${payload})${suffix}`;
  }
  if (record.kind === 'enumeration') {
    const members = (d.Fields || []).map(f => `${f.Name}=${f.EnumValue}`).join(', ');
    return `${record.symbol} { ${members} }${suffix}`;
  }
  if (record.kind === 'structure') {
    const fields = (d.Fields || []).map(formatParam).join(', ');
    return `${record.symbol} { ${fields} }${suffix}`;
  }
  if (record.kind === 'callbacktype') {
    const args = (d.Arguments || []).map(formatParam).join(', ');
    const rets = (d.Returns || []).map(formatParam).join(', ');
    return `callback ${record.symbol}(${args})${rets ? ` -> ${rets}` : ''}${suffix}`;
  }
  if (record.kind === 'constants') {
    const vals = (d.Values || []).map(v => `${v.Name}=${typeof v.Value === 'object' ? JSON.stringify(v.Value) : v.Value}`).join(', ');
    return `constants ${record.symbol} { ${vals} }${suffix}`;
  }
  return `${record.kind} ${record.symbol}${suffix}`;
}

function toCompactRecord(record) {
  const out = {
    symbol: record.symbol,
    kind: record.kind,
    owner: record.owner,
    classification: record.classification,
    signature: formatSignature(record),
    source: record.source,
  };
  if (record.matchedMember) out.matchedMember = record.matchedMember;
  return out;
}

function collectReferencedTypeNames(declaration, names = new Set()) {
  for (const listKey of ['Arguments', 'Returns', 'Payload', 'Fields']) {
    for (const item of declaration?.[listKey] || []) {
      if (item?.Type) names.add(item.Type);
      if (item?.InnerType) names.add(item.InnerType);
    }
  }
  return names;
}

function rehydrateDeclaration(catalog, entry, targetId, commit) {
  const tMeta = entry.targets[targetId];
  const parent = catalog.systems[tMeta.system];
  return {
    id: `${entry.kind}:${entry.symbol}@${tMeta.file}`,
    kind: entry.kind,
    symbol: entry.symbol,
    name: entry.declaration.Name,
    group: entry.group,
    namespace: entry.namespace,
    environment: entry.environment,
    parent,
    source: {
      file: tMeta.file,
      line: tMeta.line,
      url: `https://github.com/${catalog.repository}/blob/${commit}/${catalog.sourceBasePath}/${tMeta.file}#L${tMeta.line}`,
    },
    declaration: entry.declaration,
    owner: catalog.owner,
    classification: entry.classification,
    evidence: catalog.evidence,
  };
}

function parseQueryInput(rawQuery, explicitKind) {
  const trimmed = rawQuery.trim();
  let normalized = trimmed;
  let scopedKind = null;
  let memberFilter = null;

  if (/^Enum\./i.test(trimmed)) {
    const rest = trimmed.slice(5);
    const dot = rest.indexOf('.');
    if (dot > 0) {
      normalized = rest.slice(0, dot);
      memberFilter = rest.slice(dot + 1);
    } else {
      normalized = rest;
    }
    scopedKind = 'enumeration';
  } else if (/^Constants\./i.test(trimmed)) {
    const rest = trimmed.slice(10);
    const dot = rest.indexOf('.');
    if (dot > 0) {
      normalized = rest.slice(0, dot);
      memberFilter = rest.slice(dot + 1);
    } else {
      normalized = rest;
    }
    scopedKind = 'constants';
  }

  let effectiveKind = explicitKind;
  if (scopedKind) {
    if (explicitKind && explicitKind !== scopedKind) effectiveKind = '__conflict__';
    else effectiveKind = scopedKind;
  }
  return { trimmed, normalized, effectiveKind, memberFilter };
}

function rankMatch(symbol, group, trimmed, normalized) {
  if (!normalized) return 1;
  const qLower = normalized.toLowerCase();
  const rawLower = trimmed.toLowerCase();
  const symLower = symbol.toLowerCase();
  const grpLower = group.toLowerCase();

  if (symLower === qLower) return 1;
  if (
    symLower.startsWith(qLower + '.')
    || symLower.startsWith(qLower + ':')
    || symLower.endsWith(':' + qLower)
    || symLower.endsWith('.' + qLower)
    || grpLower === rawLower
    || grpLower === qLower
  ) return 2;

  const member = symLower.includes(':') ? symLower.split(':').at(-1) : symLower.includes('.') ? symLower.split('.').at(-1) : symLower;
  if (symLower.startsWith(qLower) || member.startsWith(qLower)) return 3;

  const tokens = qLower.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    if (tokens.every(tok => symLower.includes(tok) || grpLower.includes(tok))) return 4;
    return 0;
  }
  if (symLower.includes(qLower) || grpLower.includes(qLower)) return 4;

  if (qLower.includes(':') && symLower.includes(':')) {
    const qParts = qLower.split(':');
    const sParts = symLower.split(':');
    if (qParts.length === 2 && sParts.length === 2 && qParts[0] && qParts[1] && sParts[0] && sParts[1]) {
      const [qObj, qMember] = qParts;
      const [sObj, sMember] = sParts;
      const qObjBare = qObj.endsWith('api') ? qObj.slice(0, -3) : qObj;
      const sObjBare = sObj.endsWith('api') ? sObj.slice(0, -3) : sObj;
      if (sObjBare === qObjBare && sMember === qMember) return 1;
      if (sObjBare === 'simple' + qObjBare && sMember === qMember) return 2;
      if ((sObjBare === qObjBare || sObjBare === 'simple' + qObjBare) && sMember.startsWith(qMember)) return 3;
    }
  }
  return 0;
}

async function resolveReferencedTypes(records, id, code, commit, { compact, typeLookup, loadCatalog }) {
  const queue = [];
  const visited = new Set(records.map(r => r.symbol));
  for (const rec of records) {
    for (const typeName of collectReferencedTypeNames(rec.declaration)) {
      if (!visited.has(typeName)) queue.push(typeName);
    }
  }
  const resolvedTypes = {};
  while (queue.length) {
    const typeName = queue.shift();
    if (visited.has(typeName)) continue;
    visited.add(typeName);
    const candidateRows = (typeLookup.get(typeName) || []).filter(r => r[4].includes(code));
    for (const [sym, knd, owner] of candidateRows) {
      const catalog = await loadCatalog(owner);
      for (const match of catalog.declarations) {
        if (match.kind !== knd || match.symbol !== sym || !match.targets[id]) continue;
        const rec = rehydrateDeclaration(catalog, match, id, commit);
        const key = Object.hasOwn(resolvedTypes, sym) ? `${sym}@${match.targets[id].file}` : sym;
        resolvedTypes[key] = compact ? toCompactRecord(rec) : rec;
        for (const nested of collectReferencedTypeNames(rec.declaration)) {
          if (!visited.has(nested)) queue.push(nested);
        }
      }
    }
  }
  return resolvedTypes;
}

export async function queryReferences({
  target,
  query = '',
  kind,
  domain,
  limit = 20,
  offset = 0,
  full = false,
  list = false,
  compact = false,
  diff = false,
  onlyDiffs = false,
  resolveTypes = false,
  secret = false,
  restricted = false,
  callback = false,
  environment,
  skillsRoot = defaultSkillsRoot,
}) {
  if (!['retail', 'forever', 'classic', 'all'].includes(target)) {
    throw new Error('Target must be retail, forever, classic, or all');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be an integer from 1 to 100');
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error('Offset must be a non-negative integer');
  }
  if (kind !== undefined) {
    kind = aliases[kind] || kind;
    if (!validKinds.includes(kind)) {
      throw new Error(`Invalid --kind "${kind}". Valid kinds: ${validKinds.join(', ')} (aliases: ${Object.keys(aliases).join(', ')})`);
    }
  }
  if (environment !== undefined && !['All', 'SecureOnly'].includes(environment)) {
    throw new Error('Environment must be All or SecureOnly');
  }
  if (diff && target !== 'all') {
    throw new Error('--diff requires TARGET=all');
  }
  if (diff && list) {
    throw new Error('--diff cannot be combined with --list; use --compact for concise cross-target diffs');
  }
  if (onlyDiffs && !diff) {
    throw new Error('--only-diffs requires --diff');
  }

  const manifest = JSON.parse(await fs.readFile(path.join(skillsRoot, 'wow-api-index/references/generated/manifest.json'), 'utf8'));
  const validDomains = new Set(manifest.chunks.map(c => c.owner));
  if (domain !== undefined && !validDomains.has(domain)) {
    throw new Error(`Invalid --domain "${domain}". Valid domains: ${[...validDomains].sort().join(', ')}`);
  }
  if (!query && !domain && !secret && !restricted && !environment && !callback) {
    throw new Error('Supply a symbol/namespace/type name or --domain / --secret / --restricted / --callback / --environment');
  }

  const indexText = await fs.readFile(safePath(skillsRoot, manifest.symbolIndex.path), 'utf8');
  if (hash(indexText) !== manifest.symbolIndex.sha256) throw new Error('Symbol index hash mismatch');
  const index = JSON.parse(indexText);

  const catalogCache = new Map();
  async function loadCatalog(owner) {
    if (catalogCache.has(owner)) return catalogCache.get(owner);
    const chunk = manifest.chunks.find(c => c.owner === owner);
    if (!chunk) throw new Error(`Missing catalog chunk for ${owner}`);
    const content = await fs.readFile(safePath(skillsRoot, chunk.path), 'utf8');
    if (hash(content) !== chunk.sha256) throw new Error(`Catalog hash mismatch: ${chunk.path}`);
    const parsed = JSON.parse(content);
    catalogCache.set(owner, parsed);
    return parsed;
  }

  const { trimmed, normalized, effectiveKind, memberFilter } = parseQueryInput(query, kind);
  const typeLookup = new Map();
  for (const row of index.rows) {
    if (['structure', 'enumeration', 'callbacktype'].includes(row[1])) {
      const key = row[0];
      const bucket = typeLookup.get(key) || [];
      bucket.push(row);
      typeLookup.set(key, bucket);
    }
  }

  const needsDeclarationCheck = Boolean(secret || restricted || environment || callback || memberFilter);
  const rowMatchesFilters = row => {
    const [, rowKind, owner, , , flags] = row;
    if (effectiveKind && rowKind !== effectiveKind) return false;
    if (domain && owner !== domain) return false;
    if (secret && !flags.includes('S')) return false;
    if (restricted && !flags.includes('P')) return false;
    if (callback && !flags.includes('C')) return false;
    if (environment === 'SecureOnly' && !flags.includes('O')) return false;
    return true;
  };
  const recordMatchesFilters = record => {
    if (secret && !hasSecretAnnotation(record.declaration)) return false;
    if (restricted && !(record.declaration.IsProtectedFunction || record.declaration.HasRestrictions)) return false;
    if (environment && record.environment !== environment) return false;
    if (callback && !record.declaration.CallbackEvent) return false;
    if (memberFilter) {
      const items = record.declaration.Fields || record.declaration.Values || [];
      const found = items.find(m => m.Name?.toLowerCase() === memberFilter.toLowerCase());
      if (!found) return false;
      record.matchedMember = found;
    }
    return true;
  };

  if (diff) {
    const unified = [];
    if (effectiveKind !== '__conflict__') {
      for (const row of index.rows) {
        if (!rowMatchesFilters(row)) continue;
        const [symbol, , , group, targets] = row;
        if (!targetOrder.some(t => targets.includes(targetCodes[t]))) continue;
        const tier = rankMatch(symbol, group, trimmed, normalized);
        if (!tier) continue;
        unified.push({ row, tier });
      }
    }

    const exact = normalized ? unified.filter(r => r.tier === 1) : [];
    const selected = exact.length ? exact : unified;
    selected.sort((a, b) => (a.tier - b.tier) || compare(a.row[0], b.row[0]) || compare(a.row[1], b.row[1]) || compare(a.row[2], b.row[2]) || compare(a.row[3], b.row[3]));

    const inspectAll = needsDeclarationCheck || onlyDiffs;
    const rowsToInspect = inspectAll ? selected : selected.slice(offset, offset + limit);
    const ownerMatches = new Map();
    for (const { row } of rowsToInspect) {
      const [symbol, rowKind, owner, group] = row;
      let set = ownerMatches.get(owner);
      if (!set) { set = new Set(); ownerMatches.set(owner, set); }
      set.add(`${rowKind}\0${symbol}\0${group}`);
    }

    const byKey = new Map();
    for (const [owner, wanted] of ownerMatches) {
      const catalog = await loadCatalog(owner);
      for (const decl of catalog.declarations) {
        const k = `${decl.kind}\0${decl.symbol}\0${decl.group}`;
        if (!wanted.has(k)) continue;
        for (const id of targetOrder) {
          if (!decl.targets[id]) continue;
          const record = rehydrateDeclaration(catalog, decl, id, manifest.targets[id].commit);
          if (!recordMatchesFilters(record)) continue;
          let targetMap = byKey.get(k);
          if (!targetMap) { targetMap = {}; byKey.set(k, targetMap); }
          if (!targetMap[id]) targetMap[id] = record;
        }
      }
    }

    const canonicalContract = r => JSON.stringify({ environment: r.environment, classification: r.classification, declaration: r.declaration });
    const diffEntries = [];
    for (const { row: [symbol, rowKind, owner, group] } of rowsToInspect) {
      const byTarget = byKey.get(`${rowKind}\0${symbol}\0${group}`);
      if (!byTarget) continue;
      const presentIn = targetOrder.filter(t => Boolean(byTarget[t]));
      if (!presentIn.length) continue;
      const missingIn = targetOrder.filter(t => !presentIn.includes(t));
      const identical = missingIn.length === 0 && new Set(presentIn.map(t => canonicalContract(byTarget[t]))).size === 1;
      if (onlyDiffs && identical) continue;

      let item;
      if (identical) {
        const first = byTarget[presentIn[0]];
        item = {
          symbol: first.symbol,
          kind: first.kind,
          owner: first.owner,
          presentIn,
          missingIn,
          identical: true,
          contract: compact ? toCompactRecord(first).signature : first.declaration,
          ...(compact ? { classification: first.classification } : {}),
          sources: Object.fromEntries(presentIn.map(t => [t, byTarget[t].source])),
        };
      } else {
        item = {
          symbol: byTarget[presentIn[0]].symbol,
          kind: byTarget[presentIn[0]].kind,
          owner: byTarget[presentIn[0]].owner,
          presentIn,
          missingIn,
          identical: false,
          targets: Object.fromEntries(presentIn.map(t => {
            const r = byTarget[t];
            return [t, compact
              ? { signature: toCompactRecord(r).signature, classification: r.classification, source: r.source }
              : { environment: r.environment, classification: r.classification, declaration: r.declaration, source: r.source }];
          })),
        };
      }
      diffEntries.push({ item, byTarget });
    }

    const totalMatches = inspectAll ? diffEntries.length : selected.length;
    const pageEntries = inspectAll ? diffEntries.slice(offset, offset + limit) : diffEntries;
    const referencedTypesByTarget = {};
    if (resolveTypes && pageEntries.length) {
      for (const id of targetOrder) {
        const targetRecords = pageEntries.map(e => e.byTarget[id]).filter(Boolean);
        if (!targetRecords.length) continue;
        const resolved = await resolveReferencedTypes(targetRecords, id, targetCodes[id], manifest.targets[id].commit, { compact, typeLookup, loadCatalog });
        if (Object.keys(resolved).length) referencedTypesByTarget[id] = resolved;
      }
    }

    return {
      mode: 'diff',
      query: trimmed || null,
      targets: Object.fromEntries(targetOrder.map(id => [id, { version: manifest.targets[id].version, commit: manifest.targets[id].commit }])),
      evidence: 'Source-declared only. Loading, runtime behavior and addon access remain unknown unless a curated reference supplies separate evidence.',
      matches: totalMatches,
      returned: pageEntries.length,
      offset,
      truncated: totalMatches > offset + pageEntries.length,
      results: pageEntries.map(e => e.item),
      ...(Object.keys(referencedTypesByTarget).length ? { referencedTypes: referencedTypesByTarget } : {}),
    };
  }

  const targetsToRun = target === 'all' ? targetOrder : [target];
  const result = [];

  for (const id of targetsToRun) {
    const code = targetCodes[id];
    const ranked = [];
    if (effectiveKind !== '__conflict__') {
      for (const row of index.rows) {
        if (!rowMatchesFilters(row)) continue;
        const [symbol, , , group, targets] = row;
        if (!targets.includes(code)) continue;
        const tier = rankMatch(symbol, group, trimmed, normalized);
        if (!tier) continue;
        ranked.push({ row, tier });
      }
    }

    const exact = normalized ? ranked.filter(r => r.tier === 1) : [];
    const selected = exact.length ? exact : ranked;
    selected.sort((a, b) => (a.tier - b.tier) || compare(a.row[0], b.row[0]) || compare(a.row[1], b.row[1]));

    const needsFullSchema = !list && (full || compact || resolveTypes || exact.length > 0 || (selected.length === 1 && !domain));

    const entry = {
      target: id,
      commit: manifest.targets[id].commit,
      version: manifest.targets[id].version,
      evidence: 'Source-declared only. Loading, runtime behavior and addon access remain unknown unless a curated reference supplies separate evidence.',
      matches: 0,
      returned: 0,
      offset,
      truncated: false,
    };

    if (!needsDeclarationCheck && !needsFullSchema) {
      const visible = selected.slice(offset, offset + limit);
      entry.matches = selected.length;
      entry.returned = visible.length;
      entry.truncated = selected.length > offset + visible.length;
      entry.results = visible.map(({ row: [symbol, rowKind, owner, group] }) => ({ symbol, kind: rowKind, owner, group }));
    } else {
      // Load declarations for matching owners (and filter strictly per target when flags are set).
      const rowsToLoad = needsDeclarationCheck ? selected : selected.slice(offset, offset + limit);
      const ownerMatches = new Map();
      for (const { row } of rowsToLoad) {
        const [symbol, rowKind, owner, group] = row;
        let set = ownerMatches.get(owner);
        if (!set) { set = new Set(); ownerMatches.set(owner, set); }
        set.add(`${rowKind}\0${symbol}\0${group}`);
      }

      const loadedByKey = new Map();
      for (const [owner, wanted] of ownerMatches) {
        const catalog = await loadCatalog(owner);
        for (const decl of catalog.declarations) {
          if (!decl.targets[id]) continue;
          const k = `${decl.kind}\0${decl.symbol}\0${decl.group}`;
          if (!wanted.has(k)) continue;
          const record = rehydrateDeclaration(catalog, decl, id, entry.commit);
          if (!recordMatchesFilters(record)) continue;
          let bucket = loadedByKey.get(k);
          if (!bucket) { bucket = []; loadedByKey.set(k, bucket); }
          bucket.push(record);
        }
      }

      const orderedRecords = [];
      const seenKeys = new Set();
      for (const { row: [symbol, rowKind, , group] } of rowsToLoad) {
        const k = `${rowKind}\0${symbol}\0${group}`;
        if (seenKeys.has(k)) continue;
        seenKeys.add(k);
        const recs = loadedByKey.get(k);
        if (recs) orderedRecords.push(...recs);
      }

      const pageRecords = needsDeclarationCheck ? orderedRecords.slice(offset, offset + limit) : orderedRecords;
      entry.matches = needsDeclarationCheck ? orderedRecords.length : selected.length;
      entry.returned = pageRecords.length;
      entry.truncated = entry.matches > offset + pageRecords.length;
      entry.results = list
        ? pageRecords.map(r => ({ symbol: r.symbol, kind: r.kind, owner: r.owner, group: r.group, ...(r.matchedMember ? { matchedMember: r.matchedMember } : {}) }))
        : compact ? pageRecords.map(toCompactRecord) : pageRecords;

      if (resolveTypes && pageRecords.length && !list) {
        const resolvedTypes = await resolveReferencedTypes(pageRecords, id, code, entry.commit, { compact, typeLookup, loadCatalog });
        if (Object.keys(resolvedTypes).length) entry.referencedTypes = resolvedTypes;
      }
    }

    if (!entry.matches) {
      entry.note = 'Not found in this generated inventory. This does not establish removal or lack of runtime availability; inspect loaded FrameXML and runtime evidence.';
    }
    result.push(entry);
  }

  return target === 'all' ? result : result[0];
}

function printUsage() {
  console.log([
    'Usage: node query.mjs TARGET [SYMBOL_OR_NAMESPACE] [options]',
    '  TARGET: retail | forever | classic | all',
    '  Options (any position):',
    '    --kind <function|event|method|structure|enumeration|callbacktype|constants|precondition|secret>',
    '           (aliases: enum, callback, struct)',
    '    --domain <wow-SKILL>',
    '    --limit <1..100>          (default 20)',
    '    --offset <N>              (default 0)',
    '    --full                    Return complete schemas even for multi-match searches',
    '    --list                    Return summary rows only',
    '    --compact                 Emit token-efficient signatures and source locations',
    '    --diff                    Compare matching contracts across targets (requires TARGET=all)',
    '    --only-diffs              With --diff, return only entries that differ across targets',
    '    --resolve-types           Include referenced Structure/Enumeration/CallbackType definitions',
    '    --secret                  Filter to declarations with secret-value/argument annotations',
    '    --restricted              Filter to protected or restricted declarations',
    '    --callback                Filter to CallbackEvent declarations',
    '    --environment <All|SecureOnly>',
    '    --help                    Show this help message',
  ].join('\n'));
}

if (isMainModule(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (!args.length || args.includes('--help')) {
      printUsage();
    } else {
      const valueFlags = new Set(['--kind', '--domain', '--limit', '--offset', '--environment']);
      const boolFlags = new Map([
        ['--full', 'full'],
        ['--list', 'list'],
        ['--compact', 'compact'],
        ['--diff', 'diff'],
        ['--only-diffs', 'onlyDiffs'],
        ['--resolve-types', 'resolveTypes'],
        ['--secret', 'secret'],
        ['--restricted', 'restricted'],
        ['--callback', 'callback'],
      ]);
      const positional = [];
      const options = {};
      while (args.length) {
        const arg = args.shift();
        if (boolFlags.has(arg)) {
          options[boolFlags.get(arg)] = true;
        } else if (valueFlags.has(arg)) {
          const val = args.shift();
          if (!val || val.startsWith('--')) throw new Error(`${arg} requires a value`);
          const key = arg.slice(2);
          options[key] = (arg === '--limit' || arg === '--offset') ? Number(val) : val;
        } else if (arg.startsWith('--')) {
          throw new Error(`Unknown option: ${arg}`);
        } else {
          positional.push(arg);
        }
      }
      if (!positional.length) throw new Error('TARGET is required (retail, forever, classic, or all)');
      if (positional.length > 2) throw new Error(`Unexpected extra positional arguments: ${positional.slice(2).join(' ')}`);
      options.target = positional[0];
      options.query = positional[1] || '';
      console.log(JSON.stringify(await queryReferences(options), null, 2));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
