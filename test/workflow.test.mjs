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
  assert.equal(validation.if,"steps.upstream.outputs.review_required == 'true'");
  assert.match(validation.run,/npm run check/); assert.match(validation.run,/npm test/);
  const trustedPaths='scripts/ test/ .github/workflows/ skills/wow-api-index/scripts/ plugins/wow-addon-dev/skills/wow-api-index/scripts/ skills/wow-client-targets/scripts/ plugins/wow-addon-dev/skills/wow-client-targets/scripts/';
  assert.ok(validation.run.includes('git diff --exit-code "$GITHUB_SHA" -- '+trustedPaths));
  assert.ok(validation.run.includes('test -z "$(git ls-files --others -- '+trustedPaths+')"'));
  assert.match(validation.run,/node scripts\/prepare-api-sources\.mjs/);
  assert.match(validation.run,/node scripts\/generate-api-references\.mjs --check/);
  assert.match(validation.run,/node scripts\/generate-api-references\.mjs --verify-source/);
  assert.equal(compiled.jobs.agent.permissions.contents,'read');
  const allowed=source['safe-outputs']['create-pull-request']['allowed-files'];
  assert.ok(allowed.includes('skills/wow-client-targets/references/targets.json'));
  assert.ok(allowed.includes('skills/wow-*/SKILL.md'));
  const exclusions=source['safe-outputs']['create-pull-request']['protected-files'].exclude;
  for (const file of ['config/api-owners.json','skills/wow-*/references/generated/retail.json','skills/wow-*/references/generated/forever.json','skills/wow-*/references/generated/classic.json','skills/wow-*/references/generated/README.md','skills/wow-api-index/references/generated/manifest.json','skills/wow-api-index/references/generated/symbols.json']) {
    assert.ok(allowed.includes(file),`Missing output path: ${file}`);
    assert.ok(exclusions.includes('/'+file),`Missing protected-file exclusion: ${file}`);
    if(file.startsWith('skills/')) {
      assert.ok(allowed.includes('plugins/wow-addon-dev/'+file));
      assert.ok(exclusions.includes('/plugins/wow-addon-dev/'+file));
    }
  }
  assert.ok(allowed.every(file=>!file.startsWith('scripts/')&&!file.includes('/scripts/')&&!file.startsWith('test/')&&file!=='config/*.json'));
  assert.ok(exclusions.every(file=>!file.includes('/scripts/')));
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

test('compiled preflight writes no-op results to the same channel consumed by the harness',async()=>{
  const compiled=YAML.parse(await fs.readFile(root+'.github/workflows/update-wow-api.lock.yml','utf8'));
  const steps=compiled.jobs.agent.steps;
  const preflight=steps.find(step=>step.id==='upstream');
  const paths=steps.find(step=>step.id==='set-runtime-paths');
  const inference=steps.find(step=>step.env?.COPILOT_MODEL);
  assert.ok(preflight); assert.ok(paths); assert.ok(inference);
  assert.ok(steps.indexOf(paths)<steps.indexOf(preflight));
  assert.ok(steps.indexOf(preflight)<steps.indexOf(inference));
  assert.equal(preflight.env.GH_AW_SAFE_OUTPUTS,'${{ steps.set-runtime-paths.outputs.GH_AW_SAFE_OUTPUTS }}');
  assert.equal(preflight.env.GH_AW_SAFE_OUTPUTS,inference.env.GH_AW_SAFE_OUTPUTS);
  assert.match(paths.run,/GH_AW_SAFE_OUTPUTS=.+outputs\.jsonl/);
  assert.equal(preflight['continue-on-error'],undefined);
});
