import { scanTables } from './audit-api-coverage.mjs';

const value = (node, name) => node.fields[name]?.value;
const definitionTypes = new Set(['Function', 'Event', 'Structure', 'Enumeration', 'CallbackType', 'Constants', 'Precondition', 'Secret']);

export function luaValue(node, { includeProse = false } = {}) {
  if (node.kind === 'table') {
    const fields = Object.fromEntries(Object.entries(node.fields).filter(([k]) => includeProse || k !== 'Documentation').map(([k, v]) => [k, luaValue(v, { includeProse })]));
    const values = node.items.map(v => luaValue(v, { includeProse }));
    if (Object.keys(fields).length) return values.length ? { luaFields: fields, luaValues: values } : fields;
    return values;
  }
  if (node.kind === 'number') {
    if (/^-0[xX]/.test(node.value)) return -Number(node.value.slice(1));
    return Number(node.value);
  }
  if (node.kind === 'identifier') {
    if (node.value === 'true') return true;
    if (node.value === 'false') return false;
    if (node.value === 'nil') return null;
  }
  if (node.kind === 'string') return (!node.raw && node.value.includes('\\')) ? { luaStringBody: node.value } : node.value;
  return { luaExpression: node.value };
}

function findUnextractedDefinitions(node, extractedTables, out = []) {
  if (!node || node.kind !== 'table' || extractedTables.has(node)) return out;
  if (definitionTypes.has(value(node, 'Type'))) out.push(node);
  for (const child of Object.values(node.fields)) findUnextractedDefinitions(child, extractedTables, out);
  for (const child of node.items) findUnextractedDefinitions(child, extractedTables, out);
  return out;
}

export function extractReferenceRecords(text, file) {
  const tables = scanTables(text);
  const nested = new Set(tables.flatMap(t => [...Object.values(t.fields), ...t.items]).filter(t => t.kind === 'table'));
  const roots = tables.filter(t => !nested.has(t));
  const records = [], systems = [], extractedTables = new Set();
  for (const system of roots) {
    const name = value(system, 'Name') || file.replace(/Documentation\.lua$/, '');
    const namespace = value(system, 'Namespace') || null;
    const type = value(system, 'Type') || 'DataDefinitions';
    const systemGroup = namespace || `${type === 'ScriptObject' ? 'Object' : type === 'System' ? 'Global' : 'Data'}:${name}`;
    const metadata = Object.fromEntries(Object.entries(system.fields).filter(([k]) => !['Functions', 'Events', 'Tables', 'Predicates', 'Documentation'].includes(k)).map(([k, v]) => [k, luaValue(v)]));
    systems.push({ name, group: systemGroup, namespace, type, metadata, line: system.line });
    for (const section of ['Functions', 'Events', 'Tables', 'Predicates']) {
      for (const entry of system.fields[section]?.items || []) {
        if (entry.kind !== 'table' || !value(entry, 'Name') || !value(entry, 'Type')) throw new Error(`Malformed ${section} in ${file}:${entry.line}`);
        extractedTables.add(entry);
        const declaration = luaValue(entry);
        const effectiveNamespace = Object.hasOwn(entry.fields, 'Namespace') ? value(entry, 'Namespace') || null : namespace;
        const entryType = value(entry, 'Type');
        const kind = entryType === 'Function' ? type === 'ScriptObject' ? 'method' : 'function' : entryType === 'Event' ? 'event' : entryType.toLowerCase();
        const symbol = kind === 'event' ? declaration.LiteralName : kind === 'function' ? effectiveNamespace ? `${effectiveNamespace}.${declaration.Name}` : declaration.Name : kind === 'method' ? `${name}:${declaration.Name}` : declaration.Name;
        if (!symbol) throw new Error(`Missing symbol in ${file}:${entry.line}`);
        records.push({ id: `${kind}:${symbol}@${file}`, kind, symbol, name: declaration.Name,
          group: ['function', 'method', 'event'].includes(kind) ? effectiveNamespace || `${type === 'ScriptObject' ? 'Object' : 'Global'}:${name}` : systemGroup,
          namespace: effectiveNamespace, environment: value(entry, 'Environment') || value(system, 'Environment') || null,
          parent: { name, type, group: systemGroup, section, metadata },
          source: { file, line: entry.line }, declaration });
      }
    }
  }
  const unextracted = roots.flatMap(r => findUnextractedDefinitions(r, extractedTables));
  if (unextracted.length) throw new Error(`Unextracted definitions in ${file}: ${records.length}/${records.length + unextracted.length}`);
  return { records, systems };
}
