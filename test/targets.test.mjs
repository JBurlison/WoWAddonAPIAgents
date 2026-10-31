import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTargets, interfaceFromVersion, apiDecision } from '../skills/wow-client-targets/scripts/targets.mjs';
import { validateRegistry, validateSkill } from '../scripts/validate.mjs';
import { readJSON, root } from '../scripts/lib.mjs';
import { registryPath } from '../scripts/upstream.mjs';

for (const target of ['retail','forever','classic']) test(`single ${target}`, () => assert.deepEqual(resolveTargets([target]), [target]));
test('all and mixed targets have stable ordering and no duplicates', () => {
  assert.deepEqual(resolveTargets(['all']), ['retail','forever','classic']);
  assert.deepEqual(resolveTargets(['classic','retail','classic']), ['retail','classic']);
  assert.deepEqual(resolveTargets(['forever'], ['retail']), ['forever']);
  assert.deepEqual(resolveTargets([], ['classic']), ['classic']);
});
test('ambiguous or unsupported clients are not silently mapped', () => {
  for (const input of [[], ['era'], ['classic_era'], ['anniversary'], ['ptr'], ['all','beta']]) assert.throws(() => resolveTargets(input));
});
test('interface values follow version and reject malformed versions', () => {
  assert.equal(interfaceFromVersion('12.1.5.70688'),120105);
  assert.equal(interfaceFromVersion('1.60.1.70532'),16001);
  assert.equal(interfaceFromVersion('5.5.4.70631'),50504);
  assert.throws(() => interfaceFromVersion('latest'));
});
test('availability requires loading, signature and access evidence per client', () => {
  assert.equal(apiDecision({availability:'unavailable'}),'unsupported');
  assert.equal(apiDecision({availability:'present'}),'verify');
  const verified = {availability:'present',loadedForTarget:true,signatureVerified:true,addonAccessVerified:true};
  assert.equal(apiDecision(verified),'supported');
  assert.equal(apiDecision({...verified,requiresAdapter:true}),'adapter');
  assert.equal(apiDecision({...verified,addonAccessVerified:false}),'verify');
});
test('snapshot validation rejects mismatched branches, versions and unpinned evidence', async () => {
  const registry=await readJSON(root + registryPath);
  validateRegistry(registry);
  for (const mutation of [r=>r.targets.forever.branch='classic_era',r=>r.targets.retail.interface=120000,r=>r.targets.classic.sources.api='https://github.com/Gethe/wow-ui-source/tree/classic/Interface']) {
    const copy=structuredClone(registry); mutation(copy); assert.throws(()=>validateRegistry(copy));
  }
});
test('fenced skill frontmatter cannot masquerade as discoverable skill', () => {
  assert.throws(()=>validateSkill('```skill\n---\nname: example\ndescription: Example\n---\n```','example'));
});
