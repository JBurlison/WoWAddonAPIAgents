import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build, expectedFiles } from '../scripts/build-plugin.mjs';
import { root, files, write } from '../scripts/lib.mjs';
import { validateLinks } from '../scripts/validate.mjs';

test('package generation is deterministic and host adapters relocate references', async () => {
  const a = await expectedFiles();
  const b = await expectedFiles();
  assert.deepEqual(a, b);
  assert.ok(a.get('plugins/wow-addon-dev/com.github.copilot/agents/wow-addon.agent.md').includes('../../skills/wow-client-targets/'));
  assert.ok(a.get('.github/agents/wow-addon.agent.md').includes('../../plugins/wow-addon-dev/skills/wow-client-targets/'));
  assert.ok(a.get('plugins/wow-addon-dev/com.github.copilot/rules/wow-api.instructions.md').includes('../../skills/wow-client-targets/'));
  assert.ok(a.get('plugins/wow-addon-dev/com.github.copilot/rules/wow-api.instructions.md').includes('applyTo: "**/*.lua,**/*.xml,**/*.toc"'));
  assert.ok(a.get('.github/instructions/wow-api-important.instructions.md').includes('../../plugins/wow-addon-dev/skills/wow-client-targets/'));
  const antigravity = JSON.parse(a.get('plugins/wow-addon-dev/.antigravity-plugin/plugin.json'));
  assert.equal(antigravity.displayName, 'WoW Addon Development');
  assert.equal(antigravity.logo, 'assets/logo.svg');
  assert.equal(antigravity.suggestedPrompts.length, 3);
  const rules = await fs.readFile(path.join(root, 'plugins/wow-addon-dev/rules/AGENTS.md'), 'utf8');
  assert.ok(!/^---\r?\n/.test(rules));
  assert.ok(rules.includes('../skills/wow-client-targets/'));
  const packagedFiles = (await files(path.join(root, 'plugins/wow-addon-dev'))).map(f => path.relative(root, f).replaceAll('\\', '/'));
  assert.ok(packagedFiles.includes('plugins/wow-addon-dev/assets/logo.svg'));
  assert.ok(packagedFiles.includes('plugins/wow-addon-dev/agents/wow-addon.md'));
  assert.ok(!packagedFiles.some(key => key.includes('ai-builder') || key.includes('agent-file-specs')));
  await build({ check: true });
});

test('isolated plugin references are complete and cannot escape the package', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'wow-package-test-'));
  try {
    const pluginRoot = path.join(root, 'plugins/wow-addon-dev');
    await fs.cp(pluginRoot, temp, { recursive: true });
    for (const file of await files(temp)) {
      if (file.endsWith('.md')) {
        assert.deepEqual(await validateLinks(file, temp), [], path.relative(temp, file));
      }
    }
    await write(path.join(temp, 'target.md'), '# Real_Heading\n');
    await write(path.join(temp, 'bad.md'), '[missing](../outside.md)\n[wrong](skills/WOW-client-targets/SKILL.md)\n[ok](target.md#real_heading)\n[broken](target.md#missing)\n`[ignored](target.md#nope)`\n');
    assert.equal((await validateLinks(path.join(temp, 'bad.md'), temp)).length, 3);
  } finally {
    const resolved = path.resolve(temp);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('wow-package-test-')) throw new Error('Unexpected temporary directory');
    await fs.rm(resolved, { recursive: true, force: true });
  }
});

test('check detects drift without rewriting, preserves canonical sources, and prunes obsolete empty directories', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'wow-package-test-'));
  try {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    await write(path.join(temp, 'LICENSE'), 'Fixture license\n');
    await write(path.join(temp, 'config/plugin.json'), await fs.readFile(path.join(root, 'config/plugin.json'), 'utf8'));
    await write(path.join(temp, 'plugins/wow-addon-dev/assets/logo.svg'), await fs.readFile(path.join(root, 'plugins/wow-addon-dev/assets/logo.svg'), 'utf8'));
    await write(path.join(temp, 'plugins/wow-addon-dev/rules/AGENTS.md'), 'Apply these rules when working on World of Warcraft addons.\n\n# Fixture\n\nSee [workflow](../skills/wow-addon-development/SKILL.md).\n');
    await write(path.join(temp, 'plugins/wow-addon-dev/agents/wow-addon.md'), '---\nname: wow-addon\ndescription: Fixture\n---\n\nRead [workflow](../skills/wow-addon-development/SKILL.md).\n');
    await write(path.join(temp, 'plugins/wow-addon-dev/skills/wow-addon-development/SKILL.md'), '---\nname: wow-addon-development\ndescription: Fixture\n---\n# Fixture\n');
    await write(path.join(temp, 'plugins/wow-addon-dev/skills/wow-addon-development/assets/icon.png'), pngBytes);
    await build({ base: temp });
    const preservedPng = await fs.readFile(path.join(temp, 'plugins/wow-addon-dev/skills/wow-addon-development/assets/icon.png'));
    assert.ok(preservedPng.equals(pngBytes));
    const output = path.join(temp, 'plugins/wow-addon-dev/com.github.copilot/agents/wow-addon.agent.md');
    await fs.appendFile(output, 'Manual edit\n');
    await assert.rejects(build({ base: temp, check: true }), /Generated content differs/);
    assert.match(await fs.readFile(output, 'utf8'), /Manual edit/);
    const obsolete = path.join(temp, 'plugins/wow-addon-dev/obsolete/nested/old.md');
    await write(obsolete, 'Obsolete');
    await build({ base: temp });
    assert.doesNotMatch(await fs.readFile(output, 'utf8'), /Manual edit/);
    await assert.rejects(fs.access(obsolete));
    await assert.rejects(fs.access(path.join(temp, 'plugins/wow-addon-dev/obsolete')));
    assert.ok((await fs.readFile(path.join(temp, 'plugins/wow-addon-dev/skills/wow-addon-development/assets/icon.png'))).equals(pngBytes));
    await build({ base: temp, check: true });
  } finally {
    const resolved = path.resolve(temp);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('wow-package-test-')) throw new Error('Unexpected temporary directory');
    await fs.rm(resolved, { recursive: true, force: true });
  }
});
