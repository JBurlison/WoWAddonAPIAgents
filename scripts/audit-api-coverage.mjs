import fs from 'node:fs/promises';
import path from 'node:path';
import { root, hardenedGit, isMainModule } from './lib.mjs';

const apiPath = 'Interface/AddOns/Blizzard_APIDocumentationGenerated';
const ordinal = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function exprText(tokens) {
  let out = '';
  for (let k = 0; k < tokens.length; k++) {
    const tok = tokens[k];
    if (k > 0 && tokens[k - 1].end < tok.start) out += ' ';
    out += tok.kind === 'table' ? '{table}' : (tok.rawText ?? tok.value);
  }
  return out;
}

// Read data tables only: never execute downloaded Lua. String/comment handling
// prevents braces or misleading Type fields in prose from becoming definitions.
export function scanTables(source) {
  const tokens = [];
  const wsRe = /\s+/y;
  const longRe = /\[(=*)\[/y;
  const identRe = /[A-Za-z_][A-Za-z_0-9]*/y;
  const numRe = /-?(?:0[xX][0-9a-fA-F]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/y;
  let i = 0, line = 1;
  function consume(end) {
    const chunk = source.slice(i, end);
    let idx = -1;
    while ((idx = chunk.indexOf('\n', idx + 1)) >= 0) line++;
    i = end;
  }
  while (i < source.length) {
    wsRe.lastIndex = i;
    const ws = wsRe.exec(source);
    if (ws) { consume(i + ws[0].length); continue; }
    const c = source[i];
    const comment = source.startsWith('--', i);
    const start = comment ? i + 2 : i;
    longRe.lastIndex = start;
    const long = longRe.exec(source);
    if (long) {
      const close = `]${long[1]}]`;
      const bodyStart = start + long[0].length;
      const end = source.indexOf(close, bodyStart);
      if (end < 0) throw new Error(`Unterminated long string/comment at line ${line}`);
      if (!comment) {
        let value = source.slice(bodyStart, end);
        if (value.startsWith('\r\n')) value = value.slice(2);
        else if (value.startsWith('\n')) value = value.slice(1);
        tokens.push({ kind: 'string', value, raw: true, rawText: source.slice(i, end + close.length), start: i, end: end + close.length, line });
      }
      consume(end + close.length);
      continue;
    }
    if (comment) {
      const end = source.indexOf('\n', i);
      consume(end < 0 ? source.length : end);
      continue;
    }
    if (c === '"' || c === "'") {
      const begin = i, tokenLine = line;
      i++;
      let value = '', closed = false;
      while (i < source.length) {
        if (source[i] === c) { i++; closed = true; break; }
        if (source[i] === '\\') { value += source.slice(i, i + 2); i += 2; }
        else { if (source[i] === '\n') line++; value += source[i++]; }
      }
      if (!closed) throw new Error(`Unterminated string at line ${tokenLine}`);
      tokens.push({ kind: 'string', value, raw: false, rawText: source.slice(begin, i), start: begin, end: i, line: tokenLine });
      continue;
    }
    identRe.lastIndex = i;
    const identifier = identRe.exec(source);
    if (identifier) {
      tokens.push({ kind: 'identifier', value: identifier[0], start: i, end: i + identifier[0].length, line });
      i += identifier[0].length;
      continue;
    }
    const prev = tokens.at(-1);
    const allowUnaryMinus = !prev
      || (prev.kind === 'punctuation' && !['}', ')', ']'].includes(prev.value))
      || (prev.kind === 'identifier' && ['return', 'and', 'or', 'not'].includes(prev.value));
    if (c !== '-' || allowUnaryMinus) {
      numRe.lastIndex = i;
      const number = numRe.exec(source);
      if (number && number[0] !== '-') {
        tokens.push({ kind: 'number', value: number[0], start: i, end: i + number[0].length, line });
        i += number[0].length;
        continue;
      }
    }
    tokens.push({ kind: 'punctuation', value: c, start: i, end: i + 1, line });
    i++;
  }
  const tables = [], stack = [];
  for (const token of tokens) {
    if (token.value === '{' && token.kind === 'punctuation') {
      const table = { kind: 'table', line: token.line, start: token.start, end: token.end, entries: [], fields: Object.create(null), items: [] };
      if (stack.length) stack.at(-1).entries.push(table);
      stack.push(table);
      tables.push(table);
    } else if (token.value === '}' && token.kind === 'punctuation') {
      if (!stack.length) throw new Error(`Unexpected } at line ${token.line}`);
      const table = stack.pop();
      table.end = token.end;
      const fields = [[]];
      let parenDepth = 0, bracketDepth = 0;
      for (const entry of table.entries) {
        if (entry.kind === 'punctuation') {
          if (entry.value === '(') parenDepth++;
          else if (entry.value === ')' && parenDepth > 0) parenDepth--;
          else if (entry.value === '[') bracketDepth++;
          else if (entry.value === ']' && bracketDepth > 0) bracketDepth--;
          else if ((entry.value === ',' || entry.value === ';') && parenDepth === 0 && bracketDepth === 0) {
            fields.push([]);
            continue;
          }
        }
        fields.at(-1).push(entry);
      }
      for (const field of fields.filter(f => f.length)) {
        if (field[0].kind === 'identifier' && field[1]?.kind === 'punctuation' && field[1].value === '=') {
          const rhs = field.slice(2);
          table.fields[field[0].value] = rhs.length === 1 ? rhs[0] : { kind: 'expression', value: exprText(rhs), line: field[0].line };
        } else if (
          field[0].kind === 'punctuation' && field[0].value === '['
          && (field[1]?.kind === 'string' || field[1]?.kind === 'number')
          && field[2]?.kind === 'punctuation' && field[2].value === ']'
          && field[3]?.kind === 'punctuation' && field[3].value === '='
        ) {
          const key = String(field[1].value);
          const rhs = field.slice(4);
          if (rhs.length) {
            table.fields[key] = rhs.length === 1 ? rhs[0] : { kind: 'expression', value: exprText(rhs), line: field[0].line };
          }
        } else if (field.length === 1) table.items.push(field[0]);
        else table.items.push({ kind: 'expression', value: exprText(field), line: field[0].line });
      }
      delete table.entries;
    } else if (stack.length) stack.at(-1).entries.push(token);
  }
  if (stack.length) throw new Error('Unclosed table');
  return tables;
}

const scalar = (table, key) => table.fields[key]?.value;
const items = (table, key) => table.fields[key]?.items || [];
const fieldNames = (table, key) => items(table, key).filter(t => t.kind === 'table').map(t => ({ name: scalar(t, 'Name'), type: scalar(t, 'Type'), nilable: scalar(t, 'Nilable') === undefined ? null : scalar(t, 'Nilable') === 'true',
  ...(scalar(t, 'Default') === undefined ? {} : { default: scalar(t, 'Default') }),
  ...Object.fromEntries(Object.entries(t.fields).filter(([k, v]) => !['Name', 'Type', 'Nilable', 'Default', 'Documentation'].includes(k) && v.kind !== 'table').map(([k, v]) => [k, v.value])) }));

export function extractDefinitions(source, file) {
  const tables = scanTables(source);
  const systems = tables.filter(t => ['System', 'ScriptObject'].includes(scalar(t, 'Type')));
  const records = [];
  for (const system of systems) {
    const name = scalar(system, 'Name'), systemNamespace = scalar(system, 'Namespace') || null;
    const object = scalar(system, 'Type') === 'ScriptObject';
    for (const [section, kind] of [['Functions', 'function'], ['Events', 'event']]) {
      for (const entry of items(system, section)) {
        if (entry.kind !== 'table') throw new Error(`Non-table ${section} entry: ${file}`);
        const member = scalar(entry, 'Name');
        if (!member || scalar(entry, 'Type') !== (kind === 'function' ? 'Function' : 'Event')) throw new Error(`Unexpected ${section} entry: ${file}:${entry.line}`);
        // An explicit empty override exports a global, rather than inheriting
        // the enclosing system's namespace (e.g. InCombatLockdown).
        const namespace = entry.fields.Namespace ? scalar(entry, 'Namespace') || null : systemNamespace;
        const group = namespace || `${object ? 'Object' : 'Global'}:${name}`;
        const symbol = kind === 'event' ? scalar(entry, 'LiteralName') : namespace ? `${namespace}.${member}` : object ? `${name}:${member}` : member;
        if (!symbol) throw new Error(`Missing event literal: ${file}:${entry.line}`);
        records.push({ symbol, kind: object && kind === 'function' ? 'method' : kind, group, namespace, system: name, environment: scalar(entry, 'Environment') || scalar(system, 'Environment') || null, file, line: entry.line,
          arguments: fieldNames(entry, kind === 'event' ? 'Payload' : 'Arguments'), returns: fieldNames(entry, 'Returns'),
          annotations: Object.fromEntries(Object.entries(entry.fields).filter(([k, v]) => !['Name', 'Type', 'Arguments', 'Returns', 'Payload', 'Documentation', 'LiteralName'].includes(k) && v.kind !== 'table').map(([k, v]) => [k, v.value])) });
      }
    }
  }
  for (const [type, kind] of [['Function', 'function'], ['Event', 'event']]) {
    const expected = tables.filter(t => scalar(t, 'Type') === type).length;
    const actual = records.filter(r => kind === 'function' ? r.kind !== 'event' : r.kind === 'event').length;
    if (actual !== expected) throw new Error(`Extraction mismatch ${file}: ${type}: ${actual}/${expected}`);
  }
  return { records, systems: systems.map(t => ({ name: scalar(t, 'Name'), namespace: scalar(t, 'Namespace') || null, type: scalar(t, 'Type') })), typeCounts: Object.fromEntries(['Structure', 'Enumeration', 'CallbackType'].map(type => [type, tables.filter(t => scalar(t, 'Type') === type).length])) };
}

async function walk(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full)); else files.push(full);
  }
  return files.sort(ordinal);
}

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const mentions = (text, symbol) => new RegExp(`(?<![A-Za-z0-9_])${escape(symbol)}(?![A-Za-z0-9_])`).test(text);
export const mentionsMethod = (text, member) => new RegExp(`[.:]${escape(member)}(?![A-Za-z0-9_])`).test(text);
export const mentionsGlobal = (text, symbol) => new RegExp(`(?<![A-Za-z0-9_.:])${escape(symbol)}(?![A-Za-z0-9_])`).test(text);
const sourceURL = (commit, file, line) => `https://github.com/Gethe/wow-ui-source/blob/${commit}/${file}${line ? `#L${line}` : ''}`;
const count = (records, kind) => records.filter(r => r.kind === kind).length;

export function compareRuntime(records, sourceNamespaces, capturedNamespaces) {
  const sourceNames = new Set(sourceNamespaces);
  const capturedNames = new Set(Object.keys(capturedNamespaces).filter(n => n.startsWith('C_')));
  const sourceFunctions = new Set(records.filter(r => r.kind === 'function' && r.namespace?.startsWith('C_')).map(r => r.symbol));
  const capturedFunctions = new Set([...capturedNames].flatMap(n => capturedNamespaces[n].map(member => `${n}.${member}`)));
  const compare = (a, b) => ({ generated: a.size, captured: b.size, common: [...a].filter(x => b.has(x)).length, generatedOnly: [...a].filter(x => !b.has(x)).sort(ordinal), capturedOnly: [...b].filter(x => !a.has(x)).sort(ordinal) });
  return { namespaces: compare(sourceNames, capturedNames), functions: compare(sourceFunctions, capturedFunctions) };
}

async function readRealFile(file) {
  const stat = await fs.lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Unexpected source file type: ${file}`);
  return fs.readFile(file, 'utf8');
}

async function reconcileKit(result, kitDir, output) {
  const git = hardenedGit();
  const commit = git(kitDir, ['rev-parse', 'HEAD']);
  if (commit !== '8dc297689059dd204bf8663a05aaa36d6a628b76') throw new Error('Kit HEAD differs from the audited commit');
  const dirty = git(kitDir, ['status', '--porcelain=v1', '--untracked-files=all', '--ignored']);
  if (dirty) throw new Error('Kit checkout has modifications');
  const capture = JSON.parse(await readRealFile(path.join(kitDir, 'data/forever_api.json')));
  const sourceNamespaces = Object.keys(result.groups).filter(n => n.startsWith('C_') && result.groups[n].targets.forever);
  const comparison = compareRuntime(result.targets.forever.records, sourceNamespaces, capture.namespaces);
  const artifact = { date: result.date, interpretation: 'Set reconciliation only. A captured member missing from newer generated docs has unknown status, not established removal. A generated member absent from the old capture is not established as newly added or callable by addons. Capture has no event inventory; its top-level globals/frames are addon-contaminated and excluded.',
    generated: { repository: 'Gethe/wow-ui-source', commit: result.targets.forever.commit, version: result.targets.forever.version },
    captured: { repository: 'Thunderz96/forever-addon-kit', commit, path: 'data/forever_api.json', source: `https://github.com/Thunderz96/forever-addon-kit/blob/${commit}/data/forever_api.json`, client: capture.client }, ...comparison };
  await fs.writeFile(path.join(output, 'forever-runtime-comparison.json'), JSON.stringify(artifact, null, 2) + '\n');
  return artifact;
}

const isGeneratedDoc = rel => rel.includes('/references/generated/')
  || /\/wow-api-events\/references\/EVENTS-(?:A-F|G-L|M-R|S-Z)\.md$/.test(rel)
  || /\/wow-api-index\/references\/(?:NAMESPACE-LOOKUP|DOMAIN-SKILLS)\.md$/.test(rel);

export async function audit({ sourceRoot = path.join(root, '.cache/api-audit'), output = path.join(root, 'docs/audit') } = {}) {
  const registry = JSON.parse(await fs.readFile(path.join(root, 'skills/wow-client-targets/references/targets.json'), 'utf8'));
  const skillDirs = (await fs.readdir(path.join(root, 'skills'), { withFileTypes: true })).filter(d => d.isDirectory() && d.name.startsWith('wow-')).map(d => d.name).sort(ordinal);
  const skills = Object.create(null);
  const skillTexts = Object.create(null);
  for (const skill of skillDirs) {
    const docs = (await walk(path.join(root, 'skills', skill)))
      .filter(f => f.endsWith('.md'))
      .map(file => ({ file, rel: path.relative(root, file).replaceAll('\\', '/') }))
      .filter(({ rel }) => !isGeneratedDoc(rel));
    skills[skill] = await Promise.all(docs.map(async ({ file, rel }) => ({ path: rel, text: await fs.readFile(file, 'utf8') })));
    skillTexts[skill] = skills[skill].map(f => f.text).join('\n');
  }
  const allText = Object.values(skillTexts).join('\n');
  const lookupText = await fs.readFile(path.join(root, 'skills/wow-api-index/references/NAMESPACE-LOOKUP.md'), 'utf8');
  const routes = Object.fromEntries([...lookupText.matchAll(/\|\s*`(C_\w+)`\s*\|\s*(?:\[)?(wow-[\w-]+)/g)].map(m => [m[1], m[2]]));
  const auditResult = { schemaVersion: 1, date: new Date().toISOString().slice(0, 10), scope: 'All generated Lua documentation files in pinned source trees; source presence and lexical mention only, not in-client availability or documentation correctness.', matching: 'Functions: full namespace.member token, globals: exact unqualified identifier (excluding preceding dot/colon), events: LiteralName. Script methods: any :member or .member token (weak and object-agnostic). Corpus: maintained wow-* skill Markdown, excluding generated ledgers, package copies and audit reports.', skills: skillDirs.length, targets: {}, groups: {} };
  const git = hardenedGit();
  for (const [target, metadata] of Object.entries(registry.targets)) {
    const sourceDir = path.join(sourceRoot, target);
    const sha = git(sourceDir, ['rev-parse', 'HEAD']);
    if (sha !== metadata.commit) throw new Error(`${target}: HEAD ${sha} differs from pinned ${metadata.commit}`);
    const version = (await readRealFile(path.join(sourceDir, 'version.txt'))).trim();
    if (version !== metadata.version) throw new Error(`${target}: version mismatch`);
    const status = git(sourceDir, ['status', '--porcelain=v1', '--untracked-files=all', '--ignored']);
    if (status) throw new Error(`${target}: source checkout has modifications`);
    const trackedLua = new Set(git(sourceDir, ['ls-files', '--', apiPath]).split(/\r?\n/).filter(f => f.endsWith('.lua')));
    const files = (await walk(path.join(sourceDir, apiPath))).filter(f => f.endsWith('.lua'));
    for (const file of files) {
      const relative = path.relative(sourceDir, file).replaceAll('\\', '/');
      if (!trackedLua.has(relative)) throw new Error(`${target}: untracked source file ${relative}`);
    }
    const records = [], systems = [], types = { Structure: 0, Enumeration: 0, CallbackType: 0 };
    for (const file of files) {
      const relative = path.relative(sourceDir, file).replaceAll('\\', '/');
      const result = extractDefinitions(await readRealFile(file), relative);
      records.push(...result.records); systems.push(...result.systems);
      for (const type of Object.keys(types)) types[type] += result.typeCounts[type];
    }
    const seen = new Set();
    for (const system of systems) {
      const group = system.namespace || `${system.type === 'ScriptObject' ? 'Object' : 'Global'}:${system.name}`;
      const g = auditResult.groups[group] ??= { kind: system.namespace ? 'namespace' : system.type === 'ScriptObject' ? 'object' : 'global-system', owner: system.namespace ? routes[system.namespace] || null : null, namespaceMentioned: system.namespace ? mentions(allText, system.namespace) : null, targets: {} };
      g.targets[target] ??= { functions: 0, functionsUnmentioned: 0, methods: 0, methodsUnmentioned: 0, events: 0, eventsUnmentioned: 0, ownerFunctionMentions: 0, sources: [] };
    }
    for (const r of records) {
      const key = `${r.kind}:${r.symbol}`;
      if (seen.has(key)) throw new Error(`${target}: duplicate definition ${key}; decide deduplication explicitly`);
      seen.add(key);
      const member = r.symbol.split(':').at(-1);
      r.mentioned = r.kind === 'method' ? mentionsMethod(allText, member) : r.kind === 'function' && !r.namespace ? mentionsGlobal(allText, r.symbol) : mentions(allText, r.symbol);
      r.owner = r.namespace ? routes[r.namespace] || null : null;
      r.ownerMentioned = r.owner && skillTexts[r.owner] ? mentions(skillTexts[r.owner], r.symbol) : null;
      r.source = sourceURL(sha, r.file, r.line);
      const g = auditResult.groups[r.group] ??= { kind: r.namespace ? 'namespace' : r.kind === 'method' ? 'object' : 'global-system', owner: r.owner, namespaceMentioned: r.namespace ? mentions(allText, r.namespace) : null, targets: {} };
      const stats = g.targets[target] ??= { functions: 0, functionsUnmentioned: 0, methods: 0, methodsUnmentioned: 0, events: 0, eventsUnmentioned: 0, ownerFunctionMentions: 0, sources: [] };
      const keyName = r.kind === 'method' ? 'methods' : r.kind === 'event' ? 'events' : 'functions';
      stats[keyName]++;
      if (!r.mentioned) stats[`${keyName}Unmentioned`]++;
      if (r.kind === 'function' && r.ownerMentioned) stats.ownerFunctionMentions++;
      if (!stats.sources.includes(r.file)) stats.sources.push(r.file);
    }
    const namespaces = [...new Set(systems.map(s => s.namespace).filter(n => n?.startsWith('C_')))];
    auditResult.targets[target] = { branch: metadata.branch, commit: sha, version, generatedFiles: files.length, systems: systems.length, namespaces: namespaces.length, namespacesUnrouted: namespaces.filter(n => !routes[n]).length, namespacesUnmentioned: namespaces.filter(n => !mentions(allText, n)).length,
      functions: count(records, 'function'), functionsUnmentioned: count(records.filter(r => !r.mentioned), 'function'),
      namespacedFunctions: records.filter(r => r.kind === 'function' && r.namespace).length,
      cNamespaceFunctions: records.filter(r => r.kind === 'function' && r.namespace?.startsWith('C_')).length,
      globalFunctions: records.filter(r => r.kind === 'function' && !r.namespace).length,
      methods: count(records, 'method'), methodsUnmentioned: count(records.filter(r => !r.mentioned), 'method'),
      events: count(records, 'event'), eventsUnmentioned: count(records.filter(r => !r.mentioned), 'event'), types,
      callbackEvents: records.filter(r => r.kind === 'event' && r.annotations.CallbackEvent === 'true').length,
      extractionValidation: { functionTablesMatched: count(records, 'function') + count(records, 'method'), eventTablesMatched: count(records, 'event'), duplicateSymbols: 0,
        namespaceOverridesHandled: records.filter(r => Object.hasOwn(r.annotations, 'Namespace')).length, environmentOverridesHandled: records.filter(r => Object.hasOwn(r.annotations, 'Environment')).length },
      environments: Object.fromEntries([...new Set(records.map(r => r.environment))].sort(ordinal).map(env => [env, { functions: count(records.filter(r => r.environment === env), 'function'), methods: count(records.filter(r => r.environment === env), 'method'), events: count(records.filter(r => r.environment === env), 'event') }])),
      records: records.sort((a, b) => ordinal(`${a.kind}:${a.symbol}`, `${b.kind}:${b.symbol}`)) };
  }
  await fs.mkdir(output, { recursive: true });
  // Columnar rows retain signatures/provenance without repeating field names and
  // full URLs tens of thousands of times. Each record remains on its own line.
  const recordColumns = ['kind', 'symbol', 'group', 'sourceSystem', 'environment', 'sourceFile', 'line', 'mentioned', 'ownerMentioned', 'argumentsOrPayload', 'returns', 'scalarAnnotations'];
  const { targets, groups, ...header } = auditResult;
  const jsonParts = [JSON.stringify({ ...header, sourceBasePath: apiPath, recordColumns, parameterColumns: ['name', 'type', 'nilable', 'otherScalarFields'], groups: Object.fromEntries(Object.entries(groups).sort(([a], [b]) => ordinal(a,b))) }, null, 2).slice(0, -1), ',"targets":{'];
  let first = true;
  for (const [target, { records, ...metadata }] of Object.entries(targets)) {
    const sourceFiles = [...new Set(records.map(r => r.file.slice(apiPath.length + 1)))].sort(ordinal);
    const compactParams = params => params.map(({ name, type, nilable, ...other }) => Object.keys(other).length ? [name, type, nilable, other] : [name, type, nilable]);
    if (!first) jsonParts.push(',');
    first = false;
    jsonParts.push(`${JSON.stringify(target)}:${JSON.stringify({ ...metadata, sourceFiles }, null, 2).slice(0, -1)},"records":[`);
    jsonParts.push(records.map(r => JSON.stringify([r.kind, r.symbol, r.group, r.system, r.environment, sourceFiles.indexOf(r.file.slice(apiPath.length + 1)), r.line, r.mentioned, r.ownerMentioned, compactParams(r.arguments), compactParams(r.returns), r.annotations])).join(',\n'));
    jsonParts.push(']}');
  }
  jsonParts.push('}}\n');
  await fs.writeFile(path.join(output, 'api-coverage.json'), jsonParts.join('\n'));
  const summary = ['# Generated API coverage audit', '', `Audit date: ${auditResult.date}. This is a source-inventory and lexical-mention audit, **not** a compatibility certificate or a claim that a mentioned symbol has a correct signature, payload, restriction description, or example.`, '', 'The denominator includes every generated documentation Lua file, including shared and client-conditional systems. An absent generated definition does not establish removal; a present definition does not establish that addons can call it or subscribe to it. Runtime captures, FrameXML/global helpers, macro commands, CVars, XML attributes, and handwritten code are separate audit surfaces.', '', '## Inventory and gaps', '', '| Target | Version / pinned source | C_ namespaces (unrouted / no mention) | Functions: total / no mention | Events: total / no mention | Object methods: total / no method-name mention |', '|---|---|---:|---:|---:|---:|'];
  for (const [target, t] of Object.entries(auditResult.targets)) summary.push(`| ${target} | [${t.version}](https://github.com/Gethe/wow-ui-source/tree/${t.commit}) | ${t.namespaces} (${t.namespacesUnrouted} / ${t.namespacesUnmentioned}) | ${t.functions} / ${t.functionsUnmentioned} | ${t.events} / ${t.eventsUnmentioned} | ${t.methods} / ${t.methodsUnmentioned} |`);
  summary.push('', `Event totals include definitions marked CallbackEvent: ${Object.entries(auditResult.targets).map(([target, t]) => `${target} ${t.callbackEvents}`).join(', ')}. These must be distinguished from frame-event subscriptions. The scanner honors per-function Namespace (including explicit global exports) and Environment overrides, retains the original source system, and rejects duplicate qualified symbols.`);
  summary.push('', 'Counts distinguish global and namespaced functions from generated ScriptObject methods. Method matching is deliberately weaker: any `.Method` or `:Method` mention is credited, without validating its object type. A zero gap in that column is not object coverage. The JSON contains per-symbol arguments/returns or event payload names/types, nilability/defaults where present, scalar annotations, source lines, and owner-route/mention flags; these extracted fields are an audit aid, not a replacement for full upstream structures or semantics. Table-valued annotations and type definitions require opening the linked source. `Environment` is retained (All or SecureOnly in these inventories); neither value proves addon-facing availability.', '', '## Reproduce', '', 'Use Node.js 22+. Clone `Gethe/wow-ui-source` into ignored `.cache/api-audit/retail`, `forever`, and `classic`; check out the commits in `skills/wow-client-targets/references/targets.json`, then run:', '', '```sh', 'node scripts/audit-api-coverage.mjs', 'node --test test/audit-api-coverage.test.mjs', '```', '', 'The scanner rejects dirty or mismatched source checkouts, ignores Lua strings/comments when reading table structure, and checks that every generated Function/Event table was extracted. It does not execute upstream Lua or require additional packages. These source trees stay ignored and are not packaged.', '', `Corpus: handwritten Markdown in the ${skillDirs.length} maintained \`skills/wow-*\` directories. Generated ledgers, package copies and audit reports are excluded. Namespaced functions need an exact \`Namespace.Member\` token; global functions and event literal names need an exact identifier. Bare method listings under namespace headings can therefore appear missing and require manual review. This is a lexical screening metric, not a percentage of correctly documented APIs. Owner routes come only from the current namespace lookup; unassigned rows need a deliberate domain decision.`, '', 'The JSON uses `recordColumns` and `parameterColumns` to describe compact row arrays. `sourceFile` indexes that target\'s `sourceFiles`; combine it with `sourceBasePath`, the target commit, and row line to reconstruct a pinned GitHub link. Group owner/route metadata is in `groups`.', '', '## Namespace matrix', '', 'Each cell is **functions with no exact mention / generated functions**. Event columns are **events with no mention / generated events**. `—` means no such generated group in that source inventory; it does not mean unsupported. Prioritize source/load-condition review before filling unverified features.', '', '| Namespace | Current routed skill | Namespace mentioned? | Retail functions | Forever functions | Classic functions | Forever events |', '|---|---|---|---:|---:|---:|---:|');
  function cell(g, t, k) { const s = g.targets[t]; return s ? `${s[`${k}Unmentioned`]} / ${s[k]}` : '—'; }
  for (const [name, g] of Object.entries(auditResult.groups).sort(([a], [b]) => ordinal(a,b)).filter(([, g]) => g.kind === 'namespace')) summary.push(`| \`${name}\` | ${g.owner || '**UNROUTED**'} | ${g.namespaceMentioned ? 'yes' : '**no**'} | ${cell(g, 'retail', 'functions')} | ${cell(g, 'forever', 'functions')} | ${cell(g, 'classic', 'functions')} | ${cell(g, 'forever', 'events')} |`);
  summary.push('', '## Global API system matrix', '', '| Generated global system | Retail functions | Forever functions | Classic functions | Forever events |', '|---|---:|---:|---:|---:|');
  for (const [name, g] of Object.entries(auditResult.groups).sort(([a], [b]) => ordinal(a,b)).filter(([, g]) => g.kind === 'global-system')) summary.push(`| \`${name}\` | ${cell(g, 'retail', 'functions')} | ${cell(g, 'forever', 'functions')} | ${cell(g, 'classic', 'functions')} | ${cell(g, 'forever', 'events')} |`);
  summary.push('', '## ScriptObject matrix', '', '| Generated object | Retail methods | Forever methods | Classic methods |', '|---|---:|---:|---:|');
  for (const [name, g] of Object.entries(auditResult.groups).sort(([a], [b]) => ordinal(a,b)).filter(([, g]) => g.kind === 'object')) summary.push(`| \`${name}\` | ${cell(g, 'retail', 'methods')} | ${cell(g, 'forever', 'methods')} | ${cell(g, 'classic', 'methods')} |`);
  summary.push('', '## Exact Forever backlog', '', 'See [Forever symbol gaps](FOREVER-SYMBOL-GAPS.md) for every generated Forever function/event/method without a matching mention and pinned source links. See [machine-readable evidence](api-coverage.json) for all three inventories, including mentioned symbols and source locations.', '', 'Before filling rows, classify addon-facing eligibility: this denominator includes front-end/Glue APIs (for example `C_Glue` is labeled `Environment = All`), SecureOnly definitions, platform-specific functions, and systems whose client loading has not been traced. `All` is not an addon-permission filter. Excluding an inapplicable row with evidence is a valid resolution.', '', '## Reconcile the older runtime capture', '', 'Clone `Thunderz96/forever-addon-kit` separately at commit `8dc297689059dd204bf8663a05aaa36d6a628b76`, then run:', '', '```sh', 'node scripts/audit-api-coverage.mjs --kit PATH_TO_KIT_CHECKOUT', '```', '', `This also regenerates [runtime set differences](forever-runtime-comparison.json), including all namespace/member differences. It compares the build 69893 capture with generated build ${auditResult.targets.forever.version} definitions. It excludes contaminated top-level globals and frames; the capture has no event inventory. Missing from either set means unknown until source/loading/runtime checks explain the difference.`, '');
  await fs.writeFile(path.join(output, 'API-COVERAGE.md'), summary.join('\n'));
  const forever = auditResult.targets.forever;
  const backlog = ['# Forever generated symbols needing documentation review', '', `Pinned source: [${forever.version}](https://github.com/Gethe/wow-ui-source/tree/${forever.commit}). Generated definitions only; **availability and addon access remain unverified**. A missing exact textual mention is a review candidate, not proof that the API is undocumented under an alias. Names that are mentioned still need signature, payload, restrictions, load conditions, and current-client validation.`, '', 'Each row links directly to the definition. Current owner means the namespace routing index already assigns a skill; unrouted/global/object rows need an explicit owner. Do not mechanically publish these as supported Forever APIs.', ''];
  for (const [group, records] of Object.entries(Object.groupBy(forever.records.filter(r => !r.mentioned), r => r.group)).sort(([a], [b]) => ordinal(a,b))) {
    backlog.push(`## ${group}`, '', `Current routed skill: ${records[0].owner || 'unassigned'}.`, '', '| Kind | Symbol requiring review |', '|---|---|');
    for (const r of records) backlog.push(`| ${r.kind} | [\`${r.symbol}\`](${r.source}) |`);
    backlog.push('');
  }
  await fs.writeFile(path.join(output, 'FOREVER-SYMBOL-GAPS.md'), backlog.join('\n'));
  return auditResult;
}

if (isMainModule(import.meta.url)) {
  const result = await audit();
  const kitIndex = process.argv.indexOf('--kit');
  if (kitIndex >= 0) {
    if (!process.argv[kitIndex + 1]) throw new Error('--kit requires a local checkout path');
    const comparison = await reconcileKit(result, path.resolve(process.argv[kitIndex + 1]), path.join(root, 'docs/audit'));
    console.log(JSON.stringify({ runtimeComparison: Object.fromEntries(['namespaces', 'functions'].map(k => [k, { generated: comparison[k].generated, captured: comparison[k].captured, common: comparison[k].common, generatedOnly: comparison[k].generatedOnly.length, capturedOnly: comparison[k].capturedOnly.length }])) }));
  }
  console.log(JSON.stringify(Object.fromEntries(Object.entries(result.targets).map(([k, { records, ...summary }]) => [k, summary])), null, 2));
}
