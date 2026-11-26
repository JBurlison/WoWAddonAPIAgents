import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultTargetsPath = fileURLToPath(new URL('../references/targets.json', import.meta.url));
const defaultRepoCacheRoot = fileURLToPath(new URL('../../../.cache/api-audit', import.meta.url));
const defaultDiskCacheDir = path.join(os.tmpdir(), 'wow-ui-source-cache');
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

function normalizeRepoPath(raw) {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('REPO_PATH is required');
  const norm = raw.trim().replaceAll('\\', '/');
  if (norm.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(norm)) {
    throw new Error(`Invalid repository path: ${raw}`);
  }
  const parts = norm.split('/');
  if (parts.some(p => !p || p === '.' || p === '..')) {
    throw new Error(`Invalid repository path segments: ${raw}`);
  }
  const clean = parts.join('/');
  if (clean !== 'version.txt' && !clean.startsWith('Interface/')) {
    throw new Error(`Path must be version.txt or under Interface/: ${raw}`);
  }
  return clean;
}

export async function fetchPinnedSource({
  target,
  repoPath,
  startLine = 1,
  endLine,
  search,
  cacheDir = defaultDiskCacheDir,
  localRoot = defaultRepoCacheRoot,
  noCache = false,
  fetcher = fetch,
  targetsPath = defaultTargetsPath,
} = {}) {
  if (!validTargets.includes(target)) {
    throw new Error('TARGET must be retail, forever, or classic');
  }
  const cleanPath = normalizeRepoPath(repoPath);
  if (!Number.isInteger(startLine) || startLine < 1) throw new Error('--lines start must be >= 1');
  if (endLine !== undefined && (!Number.isInteger(endLine) || endLine < startLine)) {
    throw new Error('--lines end must be an integer >= start');
  }

  const registry = JSON.parse(await fs.readFile(targetsPath, 'utf8'));
  const pin = registry.targets?.[target];
  if (!pin || !/^[a-f0-9]{40}$/.test(pin.commit || '')) throw new Error(`Missing pinned commit for ${target}`);
  const sourceUrl = `https://github.com/${registry.repository}/blob/${pin.commit}/${cleanPath}`;
  const rawUrl = `https://raw.githubusercontent.com/${registry.repository}/${pin.commit}/${cleanPath}`;

  let text = null;
  let source = null;

  if (localRoot) {
    const localCheckout = path.join(localRoot, target);
    const localVer = await fs.readFile(path.join(localCheckout, 'version.txt'), 'utf8').catch(() => null);
    if (localVer && localVer.trim() === pin.version) {
      const localFile = await fs.readFile(path.join(localCheckout, cleanPath), 'utf8').catch(() => null);
      if (localFile !== null) {
        text = localFile;
        source = 'local';
      }
    }
  }

  const cachedFile = path.join(cacheDir, pin.commit, cleanPath);
  if (text === null && !noCache) {
    const cached = await fs.readFile(cachedFile, 'utf8').catch(() => null);
    if (cached !== null) {
      text = cached;
      source = 'cache';
    }
  }

  if (text === null) {
    const response = await fetcher(rawUrl, {
      headers: { 'User-Agent': 'wow-addon-api-agents' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanPath} at ${pin.commit} (${response.status})`);
    }
    text = await response.text();
    source = 'remote';
    if (!noCache) {
      await fs.mkdir(path.dirname(cachedFile), { recursive: true });
      await fs.writeFile(cachedFile, text, 'utf8');
    }
  }

  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (search !== undefined) {
    const needle = String(search).toLowerCase();
    const allMatches = [];
    lines.forEach((lineText, idx) => {
      if (lineText.toLowerCase().includes(needle)) allMatches.push({ line: idx + 1, text: lineText });
    });
    const capped = allMatches.slice(0, 200);
    return {
      target,
      version: pin.version,
      commit: pin.commit,
      path: cleanPath,
      source,
      sourceUrl,
      mode: 'search',
      query: search,
      totalMatches: allMatches.length,
      truncated: allMatches.length > capped.length,
      matches: capped,
    };
  }

  const effectiveEnd = Math.min(lines.length, endLine ?? (startLine + 399));
  const slice = lines.slice(startLine - 1, effectiveEnd);
  return {
    target,
    version: pin.version,
    commit: pin.commit,
    path: cleanPath,
    source,
    sourceUrl,
    mode: 'lines',
    startLine,
    endLine: effectiveEnd,
    totalLines: lines.length,
    truncated: effectiveEnd < lines.length,
    content: slice.map((l, i) => `${startLine + i}: ${l}`).join('\n'),
  };
}

function printUsage() {
  console.log([
    'Usage: node fetch-source.mjs <TARGET> <REPO_PATH> [options]',
    '  TARGET: retail | forever | classic',
    '  REPO_PATH: version.txt or Interface/... path in Gethe/wow-ui-source',
    '  Options:',
    '    --lines START:END   1-based inclusive line range (default 1:400)',
    '    --search PATTERN    Case-insensitive line search (up to 200 matches)',
    '    --cache-dir DIR     Override disk cache directory',
    '    --no-cache          Bypass disk cache',
    '    --json              Output JSON instead of plain text',
    '    --help              Show this help message',
  ].join('\n'));
}

if (isMainModule(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (!args.length || args.includes('--help')) {
      printUsage();
    } else {
      const opts = {};
      let jsonOut = false;
      const positional = [];
      while (args.length) {
        const arg = args.shift();
        if (arg === '--json') jsonOut = true;
        else if (arg === '--no-cache') opts.noCache = true;
        else if (arg === '--lines') {
          const val = args.shift();
          const m = /^(\d+):(\d+)$/.exec(val || '');
          if (!m) throw new Error('--lines requires START:END (e.g. 1:120)');
          opts.startLine = Number(m[1]);
          opts.endLine = Number(m[2]);
        } else if (arg === '--search') {
          const val = args.shift();
          if (!val || val.startsWith('--')) throw new Error('--search requires a pattern');
          opts.search = val;
        } else if (arg === '--cache-dir') {
          const val = args.shift();
          if (!val || val.startsWith('--')) throw new Error('--cache-dir requires a directory');
          opts.cacheDir = val;
        } else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
        else positional.push(arg);
      }
      if (positional.length !== 2) throw new Error('Provide <TARGET> and <REPO_PATH>');
      opts.target = positional[0];
      opts.repoPath = positional[1];
      const res = await fetchPinnedSource(opts);
      if (jsonOut) {
        console.log(JSON.stringify(res, null, 2));
      } else {
        console.log(`# ${res.target} ${res.version} (${res.commit}) [${res.source}]`);
        console.log(`# ${res.sourceUrl}`);
        if (res.mode === 'search') {
          for (const m of res.matches) console.log(`${m.line}: ${m.text}`);
          if (res.truncated) console.log(`# ... truncated (${res.totalMatches} total matches)`);
        } else {
          console.log(res.content);
          if (res.truncated) console.log(`# ... truncated at line ${res.endLine} of ${res.totalLines}`);
        }
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
