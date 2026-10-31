import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDefinitions, mentions, mentionsMethod, mentionsGlobal, compareRuntime, scanTables } from '../scripts/audit-api-coverage.mjs';

test('data scanner ignores fake definitions in comments/strings and preserves event payloads', () => {
  const source = `-- { Type = "Function", Name = "Fake" }
  local Example = { Name="Example", Type="System", Namespace="C_Example",
    Documentation={ [=[{ Type = "Event" }]=] },
    Functions={{Name="Real",Type="Function", Arguments={{Name="unit", Type="UnitToken", Nilable=false}}, SecretArguments="AllowedWhenTainted"}},
    Events={{Name="Changed",Type="Event", LiteralName="EXAMPLE_CHANGED", Payload={{Name="id",Type="number",Nilable=true}}}},
  }`;
  const { records } = extractDefinitions(source, 'Example.lua');
  assert.deepEqual(records.map(r => r.symbol), ['C_Example.Real', 'EXAMPLE_CHANGED']);
  assert.deepEqual(records[1].arguments, [{ name: 'id', type: 'number', nilable: true }]);
  assert.equal(records[0].annotations.SecretArguments, 'AllowedWhenTainted');
});

test('object methods remain distinct from globals and unhandled definitions fail closed', () => {
  const { records } = extractDefinitions('local X={Name="Widget",Type="ScriptObject",Functions={{Name="SetFoo",Type="Function"}}}', 'Object.lua');
  assert.equal(records[0].kind, 'method');
  assert.equal(records[0].symbol, 'Widget:SetFoo');
  assert.throws(() => extractDefinitions('{Name="Lost",Type="Function"}', 'Bad.lua'), /Extraction mismatch/);
  assert.throws(() => scanTables('{Name="broken"'), /Unclosed table/);
});

test('multiple systems in one file do not leak namespaces into later global definitions', () => {
  const { records } = extractDefinitions(`local Namespaced={Name="StringUtil",Type="System",Namespace="C_StringUtil",Functions={{Name="Format",Type="Function"}}}
  local Globals={Name="StringUtilGlobal",Type="System",Functions={{Name="AbbreviateNumbers",Type="Function"}}}`, 'Shared.lua');
  assert.deepEqual(records.map(r=>r.symbol), ['C_StringUtil.Format', 'AbbreviateNumbers']);
  assert.equal(records[1].namespace, null);
});

test('per-function namespace overrides include explicit globals', () => {
  const { records } = extractDefinitions(`local X={Name="Restrictions",Type="System",Namespace="C_Restrictions",Functions={
    {Name="GetState",Type="Function"},
    {Name="InCombatLockdown",Type="Function",Namespace=""},
    {Name="Format",Type="Function",Namespace="C_StringUtil"}
  }}`, 'Overrides.lua');
  assert.deepEqual(records.map(r=>r.symbol), ['C_Restrictions.GetState', 'InCombatLockdown', 'C_StringUtil.Format']);
  assert.deepEqual(records.map(r=>r.namespace), ['C_Restrictions', null, 'C_StringUtil']);
});

test('mention matching rejects longer identifiers and accepts qualified calls', () => {
  assert.equal(mentions('C_Spell.GetSpellInfoExtra()', 'C_Spell.GetSpellInfo'), false);
  assert.equal(mentions('C_Spell.GetSpellInfo(id)', 'C_Spell.GetSpellInfo'), true);
  assert.equal(mentions('ON_EXAMPLE_CHANGED', 'EXAMPLE_CHANGED'), false);
  assert.equal(mentionsMethod('frame:SetFoo()', 'SetFoo'), true);
  assert.equal(mentionsMethod('frame.SetFooExtra()', 'SetFoo'), false);
  assert.equal(mentionsGlobal('C_Spell.GetSpellInfo()', 'GetSpellInfo'), false);
  assert.equal(mentionsGlobal('GetSpellInfo()', 'GetSpellInfo'), true);
});

test('runtime reconciliation excludes global/object functions and keeps missing members uncertain', () => {
  const result = compareRuntime([
    {kind:'function', namespace:'C_A', symbol:'C_A.Shared'},
    {kind:'function', namespace:'C_A', symbol:'C_A.GeneratedOnly'},
    {kind:'function', namespace:null, symbol:'Global'},
    {kind:'method', namespace:null, symbol:'Widget:Shared'},
  ], ['C_A', 'C_Empty'], {C_A:['Shared', 'CapturedOnly']});
  assert.equal(result.functions.common, 1);
  assert.deepEqual(result.functions.generatedOnly, ['C_A.GeneratedOnly']);
  assert.deepEqual(result.functions.capturedOnly, ['C_A.CapturedOnly']);
  assert.deepEqual(result.namespaces.generatedOnly, ['C_Empty']);
});
