import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultSkillsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const hash = text => createHash('sha256').update(text).digest('hex');
const aliases = { enum: 'enumeration', callback: 'callbacktype', struct: 'structure' };

export async function queryReferences({ target, query = '', kind, domain, limit = 20, full = false, list = false, skillsRoot = defaultSkillsRoot }) {
  if (!['retail','forever','classic','all'].includes(target)) throw new Error('Target must be retail, forever, classic, or all');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Limit must be an integer from 1 to 100');
  if (!query && !domain) throw new Error('Supply a symbol/namespace/type name or --domain');
  kind = aliases[kind] || kind;
  const safePath = relative => {
    const file = path.resolve(skillsRoot, relative);
    if (!file.startsWith(path.resolve(skillsRoot) + path.sep)) throw new Error('Invalid catalog path');
    return file;
  };
  const manifest = JSON.parse(await fs.readFile(path.join(skillsRoot,'wow-api-index/references/generated/manifest.json'),'utf8'));
  const indexText = await fs.readFile(safePath(manifest.symbolIndex.path),'utf8');
  if (hash(indexText) !== manifest.symbolIndex.sha256) throw new Error('Symbol index hash mismatch');
  const index = JSON.parse(indexText);
  const normalized = query.replace(/^Enum\./,'');
  const result = [];
  for (const id of target === 'all' ? ['retail','forever','classic'] : [target]) {
    const candidates = index.targets[id].filter(([symbol, type, owner]) => (!kind || type === kind) && (!domain || owner === domain));
    const exact = candidates.filter(([symbol]) => symbol === query || symbol === normalized);
    const selected = exact.length ? exact : candidates.filter(([symbol]) => !query || symbol.startsWith(query + '.') || symbol.startsWith(query + ':') || symbol.endsWith(':' + query) || symbol.toLowerCase().includes(normalized.toLowerCase()));
    const visible = selected.slice(0,limit);
    const summaries = visible.map(([symbol, type, owner]) => ({ symbol, kind: type, owner }));
    const entry = { target: id, commit: manifest.targets[id].commit, version: manifest.targets[id].version,
      evidence: 'Source-declared only. Loading, runtime behavior and addon access remain unknown unless a curated reference supplies separate evidence.',
      matches: selected.length, returned: visible.length, truncated: selected.length > visible.length };
    if (!selected.length) entry.note = 'Not found in this generated inventory. This does not establish removal or lack of runtime availability; inspect loaded FrameXML and runtime evidence.';
    if (list || (!full && !exact.length)) entry.results = summaries;
    else {
      const matchedKeys = new Set(visible.map(([symbol,type,owner])=>`${symbol}\0${type}\0${owner}`));
      const declarations = [];
      for (const owner of [...new Set(visible.map(row=>row[2]))]) {
        const chunk = manifest.chunks.find(c=>c.target===id&&c.owner===owner);
        if (!chunk) throw new Error(`Missing catalog chunk for ${id}/${owner}`);
        const content = await fs.readFile(safePath(chunk.path),'utf8');
        if (hash(content) !== chunk.sha256) throw new Error(`Catalog hash mismatch: ${chunk.path}`);
        for (const record of JSON.parse(content).declarations) if (matchedKeys.has(`${record.symbol}\0${record.kind}\0${record.owner}`)) {
          declarations.push({ ...record, source: { ...record.source, url: `https://github.com/${manifest.sourceRepository}/blob/${entry.commit}/${manifest.sourceBasePath}/${record.source.file}#L${record.source.line}` } });
        }
      }
      entry.results = declarations;
    }
    result.push(entry);
  }
  return target === 'all' ? result : result[0];
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) {
    console.log('Usage: node query.mjs TARGET SYMBOL_OR_NAMESPACE [--kind function|event|method|structure|enum|callback|constants|precondition|secret] [--domain wow-SKILL] [--limit 20] [--full|--list]\nTARGET: retail, forever, classic, all. Exact matches return complete schemas; broad searches return summaries unless --full is requested. No network access.');
  } else {
    const target = args.shift();
    const query = args[0] && !args[0].startsWith('--') ? args.shift() : '';
    const options = { target, query };
    while (args.length) {
      const flag = args.shift();
      if (flag === '--full') options.full = true;
      else if (flag === '--list') options.list = true;
      else if (['--kind','--domain','--limit'].includes(flag)) {
        const v = args.shift();
        if (!v || v.startsWith('--')) throw new Error(`${flag} needs a value`);
        options[flag.slice(2)] = flag === '--limit' ? Number(v) : v;
      } else throw new Error(`Unknown option: ${flag}`);
    }
    console.log(JSON.stringify(await queryReferences(options),null,2));
  }
}
