import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { extractReferenceRecords } from '../scripts/reference-data.mjs';
import { validateReferences, serializeSymbolIndex, root } from '../scripts/generate-api-references.mjs';
import { queryReferences } from '../skills/wow-api-index/scripts/query.mjs';

test('one changed symbol produces a small patch without changing the index schema',async()=>{
  const index=JSON.parse(await fs.readFile(path.join(root,'skills/wow-api-index/references/generated/symbols.json'),'utf8'));
  const before=serializeSymbolIndex(index);
  assert.deepEqual(JSON.parse(before),index);
  const changed=structuredClone(index);
  changed.rows[Math.floor(changed.rows.length/2)][0]+='_PATCH_SIZE_REGRESSION';
  const after=serializeSymbolIndex(changed);
  assert.deepEqual(JSON.parse(after),changed);
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'wow-symbol-diff-test-'));
  try {
    const oldFile=path.join(temp,'before.json'), newFile=path.join(temp,'after.json');
    await fs.writeFile(oldFile,before); await fs.writeFile(newFile,after);
    const diff=spawnSync('git',['diff','--no-index','--no-ext-diff','--no-textconv','--',oldFile,newFile],{encoding:'utf8',maxBuffer:16*1024*1024});
    assert.equal(diff.status,1,diff.error?.message || diff.stderr);
    assert.ok(Buffer.byteLength(diff.stdout)<4096,'A single export change must not replace the entire multi-megabyte symbol index');
  } finally {
    if(path.dirname(path.resolve(temp))!==path.resolve(os.tmpdir()) || !path.basename(temp).startsWith('wow-symbol-diff-test-')) throw new Error('Unsafe temporary cleanup path');
    await fs.rm(temp,{recursive:true,force:true});
  }
});

test('complete schemas retain nested secrecy, optional/default fields, enums, callbacks and predicates',()=>{
  const source=`local X={Name="X",Type="System",Namespace="C_X",Environment="All",
    Functions={{Name="Read",Type="Function",Namespace="",Environment="SecureOnly",MayReturnNothing=true,
      SecretReturnsForAspect={Enum.SecretAspect.Cooldown},Arguments={{Name="flag",Type="bool",Nilable=false,Default=false,NeverSecret=true}},
      Returns={{Name="data",Type="Data",Nilable=true}},Documentation={"prose is source linked"}}},
    Events={{Name="Changed",Type="Event",LiteralName="X_CHANGED",CallbackEvent=true,Payload={{Name="data",Type="Data",Nilable=false}}}},
    Tables={{Name="Data",Type="Structure",Fields={{Name="values",Type="table",InnerType="number",Nilable=true,Default=1,Secret=true}}},
      {Name="Mode",Type="Enumeration",Fields={{Name="Enabled",Type="Mode",EnumValue=2}}},
      {Name="ResultCallback",Type="CallbackType",Arguments={{Name="ok",Type="bool",Nilable=false}}}},
    Predicates={{Name="HasAccess",Type="Precondition",FailureMode="ReturnNothing"}}};`;
  const {records}=extractReferenceRecords(source,'FixtureDocumentation.lua');
  assert.equal(records.length,6);
  const call=records.find(r=>r.kind==='function');
  assert.equal(call.symbol,'Read');
  assert.equal(call.namespace,null);
  assert.equal(call.parent.metadata.Namespace,'C_X');
  assert.equal(call.environment,'SecureOnly');
  assert.deepEqual(call.declaration.Arguments,[{Name:'flag',Type:'bool',Nilable:false,Default:false,NeverSecret:true}]);
  assert.deepEqual(call.declaration.SecretReturnsForAspect,[{luaExpression:'Enum.SecretAspect.Cooldown'}]);
  assert.equal(call.declaration.Documentation,undefined);
  assert.deepEqual(records.find(r=>r.kind==='structure').declaration.Fields[0],{Name:'values',Type:'table',InnerType:'number',Nilable:true,Default:1,Secret:true});
  assert.equal(records.find(r=>r.kind==='enumeration').declaration.Fields[0].EnumValue,2);
  assert.equal(records.find(r=>r.kind==='callbacktype').declaration.Arguments[0].Name,'ok');
  assert.equal(records.find(r=>r.kind==='event').declaration.CallbackEvent,true);
  assert.equal(records.find(r=>r.kind==='precondition').declaration.FailureMode,'ReturnNothing');
});

test('data-only roots and multiple systems retain file provenance without inheriting namespaces',()=>{
  const {records}=extractReferenceRecords(`local X={Tables={{Name="Value",Type="Structure",Fields={{Name="escape",Type="string",Default="\\n"}}}}}
  local Y={Name="Y",Type="System",Namespace="C_Y",Functions={{Name="Fn",Type="Function"}}}
  local Z={Name="Z",Type="System",Functions={{Name="GlobalFn",Type="Function"}}}`,'MixedDocumentation.lua');
  assert.equal(records[0].parent.type,'DataDefinitions');
  assert.deepEqual(records[0].declaration.Fields[0].Default,{luaStringBody:'\\n'});
  assert.equal(records[1].symbol,'C_Y.Fn');
  assert.equal(records[2].symbol,'GlobalFn');
  assert.ok(records.every(r=>r.source.file==='MixedDocumentation.lua'&&r.source.line>0));
  assert.throws(()=>extractReferenceRecords('local X={Unexpected={{Name="Lost",Type="Function"}}}','Lost.lua'),/Unextracted definitions/);
});

test('packaged query exposes target payload differences and preserves unknown runtime evidence',async()=>{
  const result=await queryReferences({target:'all',query:'SPELL_UPDATE_COOLDOWN',kind:'event'});
  assert.deepEqual(result.map(t=>t.results[0].declaration.Payload.length),[5,5,4]);
  assert.ok(result.every(t=>t.results[0].evidence.runtime==='unknown'&&t.results[0].source.url.includes(t.commit)));
  const duration=await queryReferences({target:'forever',query:'C_Spell.GetSpellCooldownDuration'});
  assert.equal(duration.results[0].declaration.Returns[0].Type,'LuaDurationObject');
  const missing=await queryReferences({target:'forever',query:'C_NotAnAPI.Unknown'});
  assert.equal(missing.matches,0);
  assert.match(missing.note,/does not establish removal/);
});

test('offline checks reject a dropped target and a changed registry commit before trusting ledgers',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'wow-references-test-'));
  try {
    for(const relative of ['config/api-owners.json','skills/wow-client-targets/references/targets.json','skills/wow-api-index/references/generated/manifest.json','skills/wow-api-index/references/generated/provenance.json']) {
      await fs.mkdir(path.dirname(path.join(temp,relative)),{recursive:true});
      await fs.copyFile(path.join(root,relative),path.join(temp,relative));
    }
    const file=path.join(temp,'skills/wow-api-index/references/generated/manifest.json');
    const manifest=JSON.parse(await fs.readFile(file,'utf8'));
    const original=structuredClone(manifest);
    delete manifest.targets.classic;
    await fs.writeFile(file,JSON.stringify(manifest));
    await assert.rejects(validateReferences(temp),/target set differs/);
    await fs.writeFile(file,JSON.stringify(original));
    const registryPath=path.join(temp,'skills/wow-client-targets/references/targets.json');
    const registry=JSON.parse(await fs.readFile(registryPath,'utf8'));
    registry.targets.forever.commit='0'.repeat(40);
    await fs.writeFile(registryPath,JSON.stringify(registry));
    await assert.rejects(validateReferences(temp),/Unpinned reference target: forever/);
  } finally {
    if (path.dirname(path.resolve(temp)) !== path.resolve(os.tmpdir()) || !path.basename(temp).startsWith('wow-references-test-')) throw new Error('Unsafe temporary cleanup path');
    await fs.rm(temp,{recursive:true,force:true});
  }
});

test('parser handles negative hex, floats, long strings, comments, bracketed keys, nested Function types, and Object.prototype keys', () => {
  const source = `--[[ leading block comment ]]
  local Edge = {
    Name = "Edge", Type = "System", Namespace = "C_Edge",
    Functions = {
      {
        Name = "Check", Type = "Function",
        Arguments = {
          { Name = "toString", Type = "number", Default = -0x10 },
          { Name = "constructor", Type = "number", Default = 1.5e-2 },
          { Name = "hasOwnProperty", Type = "number", Default = .5 },
          { Name = "cb", Type = "Function" },
        },
        Returns = { { Name = "note", Type = "string", Default = [[raw\nbody]] } },
      },
    },
    Tables = {
      {
        Name = "Flags", Type = "Structure",
        ["toString"] = 'escaped\\'quote',
        [0x10] = true,
        Fields = { { Name = "hasOwnProperty", Type = "bool", Default = false } },
      },
    },
  };`;
  const { records } = extractReferenceRecords(source, 'EdgeDocumentation.lua');
  assert.equal(records.length, 2);
  const fn = records.find(r => r.kind === 'function');
  assert.equal(fn.symbol, 'C_Edge.Check');
  assert.equal(fn.declaration.Arguments[0].Default, -16);
  assert.equal(fn.declaration.Arguments[1].Default, 0.015);
  assert.equal(fn.declaration.Arguments[2].Default, 0.5);
  assert.equal(fn.declaration.Arguments[3].Type, 'Function');
  assert.equal(fn.declaration.Returns[0].Default, 'raw\nbody');
  const tbl = records.find(r => r.kind === 'structure');
  assert.deepEqual(tbl.declaration.toString, { luaStringBody: "escaped\\'quote" });
  assert.equal(tbl.declaration['0x10'], true);
});

test('query.mjs supports compact, diff, resolveTypes, Enum member lookup, filters, pagination, ranking, and strict errors', async () => {
  const compact = await queryReferences({ target: 'forever', query: 'C_Spell.GetSpellCooldownDuration', compact: true });
  assert.ok(compact.results[0].signature.includes('LuaDurationObject'));
  assert.equal(compact.results[0].declaration, undefined);

  const diffed = await queryReferences({ target: 'all', query: 'SPELL_UPDATE_COOLDOWN', kind: 'event', diff: true, compact: true });
  assert.equal(diffed.mode, 'diff');
  assert.equal(diffed.results[0].identical, false);
  const same = await queryReferences({ target: 'all', query: 'ADDON_LOADED', kind: 'event', diff: true, compact: true });
  assert.equal(same.results[0].identical, true);

  const resolved = await queryReferences({ target: 'retail', query: 'C_AddOnProfiler.GetTopKAddOnsForMetric', resolveTypes: true, compact: true });
  assert.ok(resolved.referencedTypes.AddOnProfilerResult);
  assert.ok(resolved.referencedTypes.AddOnProfilerMetric);

  const enumMember = await queryReferences({ target: 'retail', query: 'Enum.AddOnEnableState.None', compact: true });
  assert.equal(enumMember.results[0].symbol, 'AddOnEnableState');
  assert.match(enumMember.results[0].signature, /None=0/);

  const ranked = await queryReferences({ target: 'retail', query: 'GetSpellInfo', kind: 'function', compact: true });
  if (ranked.results.length > 1) assert.ok(ranked.results[0].symbol.endsWith('GetSpellInfo'));

  const page1 = await queryReferences({ target: 'retail', domain: 'wow-api-combat', secret: true, limit: 2, offset: 0, compact: true });
  const page2 = await queryReferences({ target: 'retail', domain: 'wow-api-combat', secret: true, limit: 2, offset: 2, compact: true });
  assert.ok(page1.matches >= 4 && page1.results.length === 2);
  assert.notEqual(page1.results[0].symbol, page2.results[0].symbol);

  const restrictedOnly = await queryReferences({ target: 'forever', domain: 'wow-api-settings-system', restricted: true, limit: 5, compact: true });
  assert.ok(restrictedOnly.matches > 0);

  await assert.rejects(queryReferences({ target: 'retail', query: 'C_Spell', kind: 'bogus' }), /Invalid --kind/);
  await assert.rejects(queryReferences({ target: 'retail', query: 'C_Spell', domain: 'not-a-skill' }), /Invalid --domain/);
  await assert.rejects(queryReferences({ target: 'retail', query: 'C_Spell', environment: 'Bogus' }), /Environment/);
});
