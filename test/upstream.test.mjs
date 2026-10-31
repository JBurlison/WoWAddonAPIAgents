import test from 'node:test';
import assert from 'node:assert/strict';
import { fingerprint, changedFiles, inspectChanges, createClient, gate } from '../scripts/upstream.mjs';
import { branches } from '../skills/wow-client-targets/scripts/targets.mjs';

const tree = entries => ({ tree: entries.map(([path,sha])=>({path,sha,type:'blob'})), truncated:false });
const before=tree([['version.txt','a'],['Interface/AddOns/API.lua','b'],['README.md','c']]);
test('fingerprint ignores irrelevant changes and order, detects API changes',()=>{
  assert.equal(fingerprint(before),fingerprint(tree([['README.md','z'],['Interface/AddOns/API.lua','b'],['version.txt','a']])));
  assert.notEqual(fingerprint(before),fingerprint(tree([['version.txt','a'],['Interface/AddOns/API.lua','x']])));
  assert.throws(()=>fingerprint({...before,truncated:true}));
});
test('diff records additions, removals and modifications without compare-API truncation',()=>{
  const changes=changedFiles(before,tree([['version.txt','z'],['Interface/new.xml','d']]));
  assert.deepEqual(changes.map(x=>x.status),['removed','added','modified']);
});
test('gates skip pending PRs and unchanged sources, fail missing credentials/validation',()=>{
  assert.equal(gate({openPR:true,changed:true}),'pending-review');
  assert.equal(gate({changed:false,hasKey:false}),'unchanged');
  assert.equal(gate({changed:true,hasKey:false}),'missing-credentials');
  assert.equal(gate({changed:true,validationPassed:false}),'validation-failed');
  assert.equal(gate({changed:true}),'review');
});
test('network failures are explicit, never treated as no changes', async()=>{
  await assert.rejects(createClient({fetcher:async()=>{throw new Error('offline');}}).api('repos/test'),/offline/);
  await assert.rejects(createClient({fetcher:async()=>({ok:false,status:403})}).api('repos/test'),/403/);
});
test('tokens are not sent to raw content host',async()=>{
  const calls=[];
  const client=createClient({token:'test-token',fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({}),text:async()=>''};}});
  await client.api('repos/test'); await client.raw('a'.repeat(40),'version.txt');
  assert.equal(calls[0].options.headers.Authorization,'Bearer test-token');
  assert.equal(calls[1].options.headers.Authorization,undefined);
});
test('inspection pins content and does not mutate stale snapshots',async()=>{
  const registry={targets:Object.fromEntries(Object.keys(branches).map(id=>[id,{commit:'a'.repeat(40),version:'1.0.0.1',fingerprint:fingerprint(before)}]))};
  const original=structuredClone(registry);
  const after=tree([['version.txt','d'],['Interface/AddOns/API.lua','c']]);
  const calls=[];
  const client={api:async endpoint=>{calls.push(endpoint);return endpoint.includes('/commits/')?{sha:'b'.repeat(40)}:endpoint.includes('a'.repeat(40))?before:after;},raw:async(commit)=>{assert.equal(commit,'b'.repeat(40));return '1.0.1.2';}};
  const updates=await inspectChanges(registry,client);
  assert.equal(updates.length,3); assert.equal(updates[0].candidate.version,'1.0.1.2');
  assert.deepEqual(registry,original);
  assert.ok(calls.some(call=>call.includes('b'.repeat(40))));
});
