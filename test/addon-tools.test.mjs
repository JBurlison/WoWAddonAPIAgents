import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateAddon } from '../skills/wow-addon-development/scripts/validate-addon.mjs';
import { fetchPinnedSource } from '../skills/wow-client-targets/scripts/fetch-source.mjs';
import { root } from '../scripts/lib.mjs';

function makeTga(width, height, { bpp = 32, imageType = 2 } = {}) {
  const header = Buffer.alloc(18, 0);
  header[2] = imageType;
  header.writeUInt16LE(width, 12);
  header.writeUInt16LE(height, 14);
  header[16] = bpp;
  header[17] = bpp === 32 ? 8 : 0;
  const pixelBytes = width * height * (bpp / 8);
  return Buffer.concat([header, Buffer.alloc(pixelBytes, 0)]);
}

test('validateAddon validates TOC, case-exact files, TGA headers, and Lua 5.1/taint patterns', async t => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'wow-validate-addon-'));
  t.after(() => fs.rm(base, { recursive: true, force: true }));

  const validDir = path.join(base, 'MySuite');
  await fs.mkdir(path.join(validDir, 'Media'), { recursive: true });
  await fs.writeFile(path.join(validDir, 'MySuite.toc'), [
    '## Interface: 16001',
    '## Title: MySuite',
    'Core.lua',
    'Frame.xml',
  ].join('\n'));
  await fs.writeFile(path.join(validDir, 'Core.lua'), [
    '-- // goto ::notcode:: table.unpack CharacterFrame:SetScript("OnShow", fn)',
    'local msg = "http://example.com // goto ::lbl::"',
    'local tex = "Interface\\\\AddOns\\\\MySuite\\\\Media\\\\Glass.tga"',
    'local x = unpack({1, 2})',
  ].join('\n'));
  await fs.writeFile(path.join(validDir, 'Frame.xml'), '<Ui><Script file="Extra.lua"/></Ui>\n');
  await fs.writeFile(path.join(validDir, 'Extra.lua'), 'local ok = true\n');
  await fs.writeFile(path.join(validDir, 'Media/Glass.tga'), makeTga(32, 32, { bpp: 32, imageType: 2 }));

  const ok = await validateAddon({ addonDir: validDir, target: 'forever' });
  assert.deepEqual(ok.errors, []);
  assert.deepEqual(ok.warnings, []);
  assert.equal(ok.texturesChecked, 1);

  // Target interface mismatch
  const wrongTarget = await validateAddon({ addonDir: validDir, target: 'retail' });
  assert.ok(wrongTarget.errors.some(e => e.includes('requires ## Interface')));

  // Bad TGA (fake PNG + non-pow2), Lua 5.2 syntax, warnings, and missing XML/media files
  const badDir = path.join(base, 'BadSuite');
  await fs.mkdir(path.join(badDir, 'Media'), { recursive: true });
  await fs.writeFile(path.join(badDir, 'BadSuite.toc'), '## Interface: 16001\nCore.lua\nFrame.xml\nMissing.lua\n');
  await fs.writeFile(path.join(badDir, 'Core.lua'), [
    'local a = 10 // 3',
    'goto skip',
    '::skip::',
    'local b = table.unpack({1})',
    'CharacterFrame:SetScript("OnShow", function() end)',
    'local png = "Interface\\\\AddOns\\\\BadSuite\\\\Media\\\\Icon.png"',
    'local missingTex = "Interface\\\\AddOns\\\\BadSuite\\\\Media\\\\Absent.tga"',
  ].join('\n'));
  await fs.writeFile(path.join(badDir, 'Frame.xml'), '<Ui><Include file="NoSuch.xml"/></Ui>\n');
  await fs.writeFile(path.join(badDir, 'Media/Fake.tga'), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]));
  await fs.writeFile(path.join(badDir, 'Media/NonPow2.tga'), makeTga(30, 32));
  await fs.writeFile(path.join(badDir, 'Media/Compressed.tga'), makeTga(16, 16, { bpp: 24, imageType: 10 }));

  const bad = await validateAddon({ addonDir: badDir, target: 'forever' });
  assert.ok(bad.errors.some(e => e.includes('Missing.lua')));
  assert.ok(bad.errors.some(e => e.includes('NoSuch.xml')));
  assert.ok(bad.errors.some(e => e.includes('Absent.tga')));
  assert.ok(bad.errors.some(e => e.includes('PNG bytes')));
  assert.ok(bad.errors.some(e => e.includes('30x32')));
  assert.ok(bad.errors.some(e => e.includes("integer division '//'")));
  assert.ok(bad.errors.some(e => e.includes("'goto'")));
  assert.ok(bad.errors.some(e => e.includes('label')));
  assert.ok(bad.warnings.some(w => w.includes('table.unpack')));
  assert.ok(bad.warnings.some(w => w.includes(':SetScript')));
  assert.ok(bad.warnings.some(w => w.includes('.png')));
  assert.ok(bad.warnings.some(w => w.includes('24-bit TGA')));
  assert.ok(bad.warnings.some(w => w.includes('RLE-compressed TGA')));
});

test('fetchPinnedSource pins commit URLs, caches remotely, slices lines, searches, and blocks traversal', async t => {
  const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wow-fetch-cache-'));
  t.after(() => fs.rm(cacheDir, { recursive: true, force: true }));

  const registry = JSON.parse(await fs.readFile(path.join(root, 'skills/wow-client-targets/references/targets.json'), 'utf8'));
  const expectedCommit = registry.targets.forever.commit;
  let calls = 0;
  const fetcher = async (url, init) => {
    calls++;
    assert.equal(url, `https://raw.githubusercontent.com/Gethe/wow-ui-source/${expectedCommit}/Interface/AddOns/Blizzard_SharedXML/PixelUtil.lua`);
    assert.equal(init.headers.Authorization, undefined);
    return { ok: true, status: 200, text: async () => 'line1\nlocal PixelUtil = {}\nline3\n' };
  };

  const remote = await fetchPinnedSource({
    target: 'forever',
    repoPath: 'Interface\\AddOns\\Blizzard_SharedXML\\PixelUtil.lua',
    startLine: 2,
    endLine: 3,
    cacheDir,
    localRoot: null,
    fetcher,
  });
  assert.equal(calls, 1);
  assert.equal(remote.source, 'remote');
  assert.equal(remote.content, '2: local PixelUtil = {}\n3: line3');

  const cached = await fetchPinnedSource({
    target: 'forever',
    repoPath: 'Interface/AddOns/Blizzard_SharedXML/PixelUtil.lua',
    search: 'pixelutil',
    cacheDir,
    localRoot: null,
    fetcher: async () => { throw new Error('Should not fetch when cached'); },
  });
  assert.equal(cached.source, 'cache');
  assert.equal(cached.matches.length, 1);
  assert.equal(cached.matches[0].line, 2);

  await assert.rejects(fetchPinnedSource({ target: 'forever', repoPath: '../secret.txt', localRoot: null, cacheDir }), /Invalid repository path/);
  await assert.rejects(fetchPinnedSource({ target: 'bogus', repoPath: 'version.txt', localRoot: null, cacheDir }), /TARGET must be/);
});
