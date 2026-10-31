import { scanTables } from './audit-api-coverage.mjs';

const value = (node, name) => node.fields[name]?.value;
export function luaValue(node, { includeProse = false } = {}) {
  if (node.kind === 'table') {
    const fields = Object.fromEntries(Object.entries(node.fields).filter(([k]) => includeProse || k !== 'Documentation').map(([k, v]) => [k, luaValue(v, { includeProse })]));
    const values = node.items.map(v => luaValue(v, { includeProse }));
    if (Object.keys(fields).length) return values.length ? { luaFields: fields, luaValues: values } : fields;
    return values;
  }
  if (node.kind === 'number') return Number(node.value);
  if (node.kind === 'identifier') {
    if (node.value === 'true') return true;
    if (node.value === 'false') return false;
    if (node.value === 'nil') return null;
  }
  if (node.kind === 'string') return node.value.includes('\\') ? { luaStringBody: node.value } : node.value;
  return { luaExpression: node.value };
}

export function extractReferenceRecords(text, file) {
  const tables = scanTables(text);
  const nested = new Set(tables.flatMap(t => [...Object.values(t.fields), ...t.items]).filter(t => t.kind === 'table'));
  const roots = tables.filter(t => !nested.has(t));
  const records = [], systems = [];
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
  const expected = tables.filter(t => ['Function', 'Event', 'Structure', 'Enumeration', 'CallbackType', 'Constants', 'Precondition', 'Secret'].includes(value(t, 'Type'))).length;
  if (records.length !== expected) throw new Error(`Unextracted definitions in ${file}: ${records.length}/${expected}`);
  return { records, systems };
}
