import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultTargetsPath = fileURLToPath(new URL('../../wow-client-targets/references/targets.json', import.meta.url));
const validTargets = ['retail', 'forever', 'classic'];

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

async function listDirCached(dir, cache) {
  const resolved = path.resolve(dir);
  if (cache.has(resolved)) return cache.get(resolved);
  const entries = new Set(await fs.readdir(resolved));
  cache.set(resolved, entries);
  return entries;
}

async function existsExactCase(baseDir, relPath, dirCache) {
  const baseResolved = path.resolve(baseDir);
  const target = path.resolve(baseResolved, relPath);
  const rel = path.relative(baseResolved, target);
  if (!rel || path.isAbsolute(rel) || rel.startsWith('..')) return false;
  let cursor = baseResolved;
  for (const seg of rel.split(path.sep).filter(Boolean)) {
    try {
      const entries = await listDirCached(cursor, dirCache);
      if (!entries.has(seg)) return false;
      cursor = path.join(cursor, seg);
    } catch {
      return false;
    }
  }
  return true;
}

async function walkFiles(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) out.push(...await walkFiles(full));
    else out.push(full);
  }
  return out.sort();
}

function parseToc(text) {
  const interfaces = [];
  const entries = [];
  const metadata = {};
  for (const rawLine of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('##')) {
      const m = /^##\s*([^:]+?)\s*:\s*(.*)$/.exec(line);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim();
        metadata[key] = val;
        if (/^Interface(?:-[A-Za-z0-9_-]+)?$/i.test(key)) {
          const suffix = key.includes('-') ? key.slice(key.indexOf('-') + 1).toLowerCase() : null;
          for (const part of val.split(',')) {
            const num = Number(part.trim());
            if (Number.isInteger(num) && num > 0) interfaces.push({ key, flavor: suffix, value: num });
          }
        }
      }
      continue;
    }
    if (line.startsWith('#')) continue;
    // Strip optional trailing inline load selectors like `[AllowLoad...]` if present.
    const filePart = line.replace(/\s+\[[^\]]+\]\s*$/, '').trim();
    if (filePart) entries.push(filePart);
  }
  return { interfaces, entries, metadata };
}

function parseXmlRefs(xmlText) {
  const refs = [];
  for (const m of xmlText.matchAll(/<(Script|Include)\b[^>]*\bfile\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    refs.push({ tag: m[1], file: m[2].trim() });
  }
  return refs;
}

function stripLuaCommentsAndStrings(source) {
  let out = '';
  let i = 0;
  const longRe = /\[(=*)\[/y;
  while (i < source.length) {
    const c = source[i];
    if (source.startsWith('--', i)) {
      longRe.lastIndex = i + 2;
      const long = longRe.exec(source);
      if (long) {
        const close = `]${long[1]}]`;
        const end = source.indexOf(close, i + 2 + long[0].length);
        const stop = end < 0 ? source.length : end + close.length;
        out += source.slice(i, stop).replace(/[^\n]/g, ' ');
        i = stop;
      } else {
        const nl = source.indexOf('\n', i);
        const stop = nl < 0 ? source.length : nl;
        out += ' '.repeat(stop - i);
        i = stop;
      }
      continue;
    }
    longRe.lastIndex = i;
    const longStr = longRe.exec(source);
    if (longStr) {
      const close = `]${longStr[1]}]`;
      const end = source.indexOf(close, i + longStr[0].length);
      const stop = end < 0 ? source.length : end + close.length;
      out += ' ' + source.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      i++;
      let buf = ' ';
      while (i < source.length) {
        if (source[i] === c) { i++; break; }
        if (source[i] === '\\') { buf += '  '; i += 2; continue; }
        buf += source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      out += buf;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function scanLua(text, relFile, errors, warnings) {
  const stripped = stripLuaCommentsAndStrings(text);
  const lines = stripped.split('\n');
  lines.forEach((line, idx) => {
    const loc = `${relFile}:${idx + 1}`;
    if (line.includes('//')) errors.push(`${loc}: Lua 5.2+ integer division '//' is invalid in WoW Lua 5.1`);
    if (/\bgoto\s+[A-Za-z_]\w*/.test(line)) errors.push(`${loc}: Lua 5.2+ 'goto' statement is invalid in WoW Lua 5.1`);
    if (/::[A-Za-z_]\w*::/.test(line)) errors.push(`${loc}: Lua 5.2+ label '::...::' is invalid in WoW Lua 5.1`);
    if (/\btable\.unpack\b/.test(line)) warnings.push(`${loc}: 'table.unpack' is Lua 5.2+; WoW Lua 5.1 uses global 'unpack'`);
    if (/\b(?:CharacterFrame|SpellBookFrame|GameTooltip|PlayerFrame|TargetFrame|CompactUnitFrame\w*|ChatFrame\d*|ActionButton\d*)\s*:\s*SetScript\s*\(/.test(line)) {
      warnings.push(`${loc}: Direct ':SetScript' on Blizzard frame can taint or drop native handlers; prefer hooksecurefunc or addon-owned overlays`);
    }
    if (/\bUIParent\s*:\s*SetScale\s*\(/.test(line)) {
      warnings.push(`${loc}: Avoid mutating UIParent:SetScale; scale addon-owned frames instead`);
    }
  });
}

function inspectTga(buf, relFile, errors, warnings) {
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    errors.push(`${relFile}: File has PNG bytes inside a .tga file; export a real 32-bit RGBA .tga`);
    return;
  }
  if (buf.length < 18) {
    errors.push(`${relFile}: Truncated TGA header (${buf.length} bytes)`);
    return;
  }
  const imageType = buf[2];
  const width = buf.readUInt16LE(12);
  const height = buf.readUInt16LE(14);
  const bpp = buf[16];
  const isPow2 = n => n > 0 && (n & (n - 1)) === 0;
  if (!isPow2(width) || !isPow2(height) || width > 1024 || height > 1024) {
    errors.push(`${relFile}: TGA dimensions ${width}x${height} must be powers of two <= 1024x1024`);
  }
  if (bpp !== 24 && bpp !== 32) {
    errors.push(`${relFile}: Unsupported TGA bit depth ${bpp} (expected 32-bit RGBA or 24-bit RGB)`);
  } else if (bpp === 24) {
    warnings.push(`${relFile}: 24-bit TGA has no alpha channel; use 32-bit RGBA for alpha-blended textures`);
  }
  if (imageType === 10) {
    warnings.push(`${relFile}: RLE-compressed TGA (type 10); prefer uncompressed type 2 for reliable rendering`);
  } else if (imageType !== 2 && imageType !== 3) {
    warnings.push(`${relFile}: Unexpected TGA image type ${imageType}`);
  }
}

export async function validateAddon({ addonDir, target, targetsPath = defaultTargetsPath } = {}) {
  if (!addonDir) throw new Error('addonDir is required');
  if (target !== undefined && !validTargets.includes(target)) {
    throw new Error(`Unsupported --target "${target}". Choose retail, forever, or classic`);
  }
  const resolvedDir = path.resolve(addonDir);
  const stat = await fs.stat(resolvedDir).catch(() => null);
  if (!stat?.isDirectory()) throw new Error(`Addon directory not found: ${addonDir}`);

  const registry = JSON.parse(await fs.readFile(targetsPath, 'utf8'));
  const knownInterfaces = new Map(Object.entries(registry.targets).map(([id, meta]) => [meta.interface, id]));
  const addonFolder = path.basename(resolvedDir);
  const errors = [];
  const warnings = [];
  const dirCache = new Map();

  const rootEntries = await fs.readdir(resolvedDir, { withFileTypes: true });
  const tocFiles = rootEntries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.toc')).map(e => e.name).sort();
  if (!tocFiles.length) {
    errors.push('No .toc file found in addon root directory');
  }

  const luaFilesToScan = new Set();
  const xmlVisited = new Set();
  let filesChecked = 0;

  async function checkXml(xmlRelPath) {
    const normalized = xmlRelPath.replaceAll('\\', '/');
    if (xmlVisited.has(normalized)) return;
    xmlVisited.add(normalized);
    const fullXml = path.resolve(resolvedDir, normalized);
    const xmlText = await fs.readFile(fullXml, 'utf8').catch(() => null);
    if (xmlText === null) return;
    const xmlDir = path.dirname(fullXml);
    for (const ref of parseXmlRefs(xmlText)) {
      const refClean = ref.file.replaceAll('\\', '/');
      filesChecked++;
      if (!(await existsExactCase(xmlDir, refClean, dirCache))) {
        errors.push(`${normalized}: Missing or wrong-case <${ref.tag}> file "${ref.file}"`);
        continue;
      }
      const childRel = path.relative(resolvedDir, path.resolve(xmlDir, refClean)).replaceAll('\\', '/');
      if (ref.tag.toLowerCase() === 'script' && childRel.toLowerCase().endsWith('.lua')) {
        luaFilesToScan.add(childRel);
      } else if (ref.tag.toLowerCase() === 'include' && childRel.toLowerCase().endsWith('.xml')) {
        await checkXml(childRel);
      }
    }
    if (/\.png\b/i.test(xmlText)) {
      for (const m of xmlText.matchAll(/Interface[/\\]+AddOns[/\\]+[^"'\s<>]+\.png/gi)) {
        warnings.push(`${normalized}: Direct .png texture reference (${m[0]}); WoW requires .tga or .blp`);
      }
    }
  }

  const allParsedInterfaces = [];
  for (const tocFile of tocFiles) {
    const tocText = await fs.readFile(path.join(resolvedDir, tocFile), 'utf8');
    const parsed = parseToc(tocText);
    if (!parsed.interfaces.length) errors.push(`${tocFile}: Missing ## Interface metadata`);
    allParsedInterfaces.push(...parsed.interfaces.map(i => ({ tocFile, ...i })));

    for (const entry of parsed.entries) {
      const rel = entry.replaceAll('\\', '/');
      filesChecked++;
      if (!(await existsExactCase(resolvedDir, rel, dirCache))) {
        errors.push(`${tocFile}: Missing or wrong-case TOC entry "${entry}"`);
        continue;
      }
      if (rel.toLowerCase().endsWith('.lua')) luaFilesToScan.add(rel);
      else if (rel.toLowerCase().endsWith('.xml')) await checkXml(rel);
    }
  }

  if (target) {
    const expectedIf = registry.targets[target].interface;
    if (allParsedInterfaces.length && !allParsedInterfaces.some(i => i.value === expectedIf)) {
      const found = [...new Set(allParsedInterfaces.map(i => `${i.key}:${i.value}`))].join(', ');
      errors.push(`Target ${target} requires ## Interface ${expectedIf} (found: ${found})`);
    }
  } else {
    for (const item of allParsedInterfaces) {
      if (!knownInterfaces.has(item.value)) {
        warnings.push(`${item.tocFile}: Interface ${item.value} (${item.key}) is not in bundled targets.json pins`);
      }
    }
  }

  const escapedAddon = addonFolder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mediaRe = new RegExp(`Interface(?:\\\\+|/+)AddOns(?:\\\\+|/+)${escapedAddon}(?:\\\\+|/+)([^"'\\s<>\\r\\n]+)`, 'gi');
  for (const relLua of [...luaFilesToScan].sort()) {
    const text = await fs.readFile(path.join(resolvedDir, relLua), 'utf8');
    scanLua(text, relLua, errors, warnings);
    for (const m of text.matchAll(mediaRe)) {
      const rawMedia = m[1].replace(/\\\\/g, '/').replaceAll('\\', '/');
      if (rawMedia.toLowerCase().endsWith('.png')) {
        warnings.push(`${relLua}: Direct .png texture path (${m[0]}); WoW requires .tga or .blp`);
      }
      filesChecked++;
      if (!(await existsExactCase(resolvedDir, rawMedia, dirCache))) {
        errors.push(`${relLua}: Missing or wrong-case addon media path "${m[0]}"`);
      }
    }
  }

  const allFiles = await walkFiles(resolvedDir);
  let texturesChecked = 0;
  for (const full of allFiles) {
    if (!full.toLowerCase().endsWith('.tga')) continue;
    texturesChecked++;
    const rel = path.relative(resolvedDir, full).replaceAll('\\', '/');
    const buf = await fs.readFile(full);
    inspectTga(buf, rel, errors, warnings);
  }

  return {
    addonDir: resolvedDir,
    target: target ?? null,
    tocFiles,
    filesChecked,
    texturesChecked,
    errors,
    warnings,
    evidence: 'Static checks only; does not replace in-game client validation.',
  };
}

function printUsage() {
  console.log([
    'Usage: node validate-addon.mjs <ADDON_DIR> [--target retail|forever|classic] [--json]',
    '  Runs static TOC, exact-case file/media, .tga header/dimension, and Lua 5.1/taint checks.',
  ].join('\n'));
}

if (isMainModule(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (!args.length || args.includes('--help')) {
      printUsage();
    } else {
      let target;
      let jsonOut = false;
      const positional = [];
      while (args.length) {
        const arg = args.shift();
        if (arg === '--json') jsonOut = true;
        else if (arg === '--target') {
          target = args.shift();
          if (!target || target.startsWith('--')) throw new Error('--target requires retail, forever, or classic');
        } else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
        else positional.push(arg);
      }
      if (positional.length !== 1) throw new Error('Provide exactly one <ADDON_DIR>');
      const report = await validateAddon({ addonDir: positional[0], target });
      if (jsonOut) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`Checked ${report.tocFiles.length} TOC(s), ${report.filesChecked} reference(s), ${report.texturesChecked} TGA texture(s).`);
        for (const w of report.warnings) console.log(`WARN: ${w}`);
        for (const e of report.errors) console.error(`ERROR: ${e}`);
        console.log(report.evidence);
      }
      if (report.errors.length) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
