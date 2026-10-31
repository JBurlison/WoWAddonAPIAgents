import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build, expectedFiles } from '../scripts/build-plugin.mjs';
import { root, write } from '../scripts/lib.mjs';
import { validateLinks } from '../scripts/validate.mjs';

test('package generation is deterministic and host adapters relocate references',async()=>{
  const a=await expectedFiles(); const b=await expectedFiles();
  assert.deepEqual(a,b);
  assert.ok(a.get('plugins/wow-addon-dev/agents/wow-addon.md').includes('../skills/wow-client-targets/'));
  assert.ok(a.get('plugins/wow-addon-dev/com.github.copilot/agents/wow-addon.agent.md').includes('../../skills/wow-client-targets/'));
  assert.ok(a.get('.github/agents/wow-addon.agent.md').includes('../../skills/wow-client-targets/'));
  assert.ok(![...a.keys()].filter(key=>key.startsWith('plugins/')).some(key=>key.includes('ai-builder')||key.includes('agent-file-specs')));
  await build({check:true});
});
test('isolated plugin references are complete and cannot escape the package',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'wow-package-test-'));
  try {
    const expected=await expectedFiles();
    for(const [file,content] of expected) if(file.startsWith('plugins/wow-addon-dev/')) await write(path.join(temp,file.slice('plugins/wow-addon-dev/'.length)),content);
    for(const [file] of expected) if(file.startsWith('plugins/wow-addon-dev/')&&file.endsWith('.md')) {
      assert.deepEqual(await validateLinks(path.join(temp,file.slice('plugins/wow-addon-dev/'.length)),temp),[],file);
    }
    await write(path.join(temp,'bad.md'),'[missing](../outside.md)\n[wrong](skills/WOW-client-targets/SKILL.md)');
    assert.equal((await validateLinks(path.join(temp,'bad.md'),temp)).length,2);
  } finally {
    const resolved = path.resolve(temp);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('wow-package-test-')) throw new Error('Unexpected temporary directory');
    await fs.rm(resolved,{recursive:true,force:true});
  }
});

test('check detects drift without rewriting and build removes obsolete generated files',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'wow-package-test-'));
  try {
    await write(path.join(temp,'LICENSE'),'Fixture license\n');
    await write(path.join(temp,'config/plugin.json'),await fs.readFile(root+'config/plugin.json','utf8'));
    await write(path.join(temp,'instructions/wow-api.instructions.md'),'---\napplyTo: "**/*.lua"\n---\nFixture\n');
    await write(path.join(temp,'agents/wow-addon.md'),'---\nname: wow-addon\ndescription: Fixture\n---\nRead [workflow](../skills/wow-addon-development/SKILL.md).\n');
    await write(path.join(temp,'agents/ai-builder.md'),'---\nname: ai-builder\ndescription: Fixture\n---\nMaintainer only.\n');
    await write(path.join(temp,'skills/wow-addon-development/SKILL.md'),'---\nname: wow-addon-development\ndescription: Fixture\n---\n# Fixture\n');
    await build({base:temp});
    const output=path.join(temp,'plugins/wow-addon-dev/skills/wow-addon-development/SKILL.md');
    await fs.appendFile(output,'Manual edit\n');
    await assert.rejects(build({base:temp,check:true}),/Generated content differs/);
    assert.match(await fs.readFile(output,'utf8'),/Manual edit/);
    const obsolete=path.join(temp,'plugins/wow-addon-dev/obsolete.md');
    await write(obsolete,'Obsolete');
    await build({base:temp});
    assert.doesNotMatch(await fs.readFile(output,'utf8'),/Manual edit/);
    await assert.rejects(fs.access(obsolete));
    await build({base:temp,check:true});
  } finally {
    const resolved=path.resolve(temp);
    if(path.dirname(resolved)!==path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('wow-package-test-')) throw new Error('Unexpected temporary directory');
    await fs.rm(resolved,{recursive:true,force:true});
  }
});
