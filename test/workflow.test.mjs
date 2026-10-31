import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import YAML from 'yaml';
import { root, frontmatter } from '../scripts/lib.mjs';

test('compiled publication requires agent success, including post-agent validation',async()=>{
  const source=YAML.parse(frontmatter(await fs.readFile(root+'.github/workflows/update-wow-api.md','utf8')).yaml);
  const compiled=YAML.parse(await fs.readFile(root+'.github/workflows/update-wow-api.lock.yml','utf8'));
  assert.equal(source.jobs.safe_outputs.if,"needs.agent.result == 'success'");
  assert.match(compiled.jobs.safe_outputs.if,/needs\.agent\.result == 'success'/);
  const validation=compiled.jobs.agent.steps.find(step=>step.name==='Validate proposed content before safe outputs');
  assert.ok(validation); assert.equal(validation['continue-on-error'],undefined);
  assert.match(validation.run,/npm run check/); assert.match(validation.run,/npm test/);
  assert.equal(compiled.jobs.agent.permissions.contents,'read');
  const allowed=source['safe-outputs']['create-pull-request']['allowed-files'];
  assert.ok(allowed.includes('skills/wow-client-targets/references/targets.json'));
  assert.ok(allowed.includes('skills/wow-*/SKILL.md'));
  assert.ok(allowed.every(file=>!file.startsWith('.github/skills/')&&!file.startsWith('agents/ai-builder')));
});

test('compiled updater uses Copilot Sonnet and personal Copilot credentials with bounded inference',async()=>{
  const lock=await fs.readFile(root+'.github/workflows/update-wow-api.lock.yml','utf8');
  const compiled=YAML.parse(lock);
  const steps=compiled.jobs.agent.steps;
  const inference=steps.find(step=>step.env?.COPILOT_MODEL);
  assert.equal(inference.env.COPILOT_MODEL,'sonnet');
  assert.equal(inference.env.GH_AW_LLM_PROVIDER,'github');
  assert.equal(inference.env.COPILOT_GITHUB_TOKEN,'${{ secrets.COPILOT_GITHUB_TOKEN }}');
  assert.equal(inference['timeout-minutes'],20);
  const detection=compiled.jobs.detection.steps.find(step=>step.env?.COPILOT_MODEL);
  assert.equal(detection.env.COPILOT_MODEL,'sonnet');
  assert.equal(detection.env.COPILOT_GITHUB_TOKEN,'${{ secrets.COPILOT_GITHUB_TOKEN }}');
  assert.match(lock,/secrets\.COPILOT_GITHUB_TOKEN/);
  assert.doesNotMatch(lock,/OPENAI_API_KEY|CODEX_API_KEY|ANTHROPIC_API_KEY/);
  assert.equal(compiled.jobs.agent.permissions['copilot-requests'],undefined);
  const preflight=steps.find(step=>step.name==='Check upstream before inference');
  assert.equal(preflight.env.COPILOT_GITHUB_TOKEN,'${{ secrets.COPILOT_GITHUB_TOKEN }}');
});
