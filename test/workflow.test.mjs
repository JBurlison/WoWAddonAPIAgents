import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import YAML from 'yaml';
import { root, frontmatter } from '../scripts/lib.mjs';
import { versionFiles } from '../scripts/version.mjs';

function publicationConfigs(jobs) {
  const setup=jobs.agent.steps.find(step=>step.env?.GH_AW_SAFE_OUTPUTS_CONFIG);
  const publish=jobs.safe_outputs.steps.find(step=>step.id==='process_safe_outputs');
  return [
    JSON.parse(setup.env.GH_AW_SAFE_OUTPUTS_CONFIG).create_pull_request,
    JSON.parse(publish.env.GH_AW_SAFE_OUTPUTS_HANDLER_CONFIG).create_pull_request,
  ];
}

test('publication budgets fit complete generated snapshots and reach the compiled handlers',async()=>{
  const source=YAML.parse(frontmatter(await fs.readFile(root+'.github/workflows/update-wow-api.md','utf8')).yaml);
  const compiled=YAML.parse(await fs.readFile(root+'.github/workflows/update-wow-api.lock.yml','utf8'));
  const manifest=JSON.parse(await fs.readFile(root+'skills/wow-api-index/references/generated/manifest.json','utf8'));
  const references=new Set([...manifest.chunks,...manifest.artifacts].map(entry=>entry.path));
  references.add('wow-api-index/references/generated/manifest.json');
  references.add('wow-client-targets/references/targets.json');
  references.add('wow-client-targets/references/SOURCE-EVIDENCE.md');
  const files=new Set([...versionFiles,'config/api-owners.json']);
  for(const file of references) {
    files.add('skills/'+file); files.add('plugins/wow-addon-dev/skills/'+file);
  }
  const policy=source['safe-outputs']['create-pull-request'];
  // Reserve room for 16 handwritten guides and their packaged copies.
  assert.ok(Number.isInteger(policy['max-patch-files']) && policy['max-patch-files']>=files.size+32,
    `A complete refresh and guide updates need at least ${files.size+32} output paths`);
  assert.ok(policy['max-patch-size']>0 && policy['max-patch-size']<=10240);
  for(const config of publicationConfigs(compiled.jobs)) {
    assert.equal(config.max_patch_files,policy['max-patch-files']);
    assert.equal(config.max_patch_size,policy['max-patch-size']);
  }
});

test('compiled publication exempts only the generated README paths in the manifest and package',async()=>{
  const compiled=YAML.parse(await fs.readFile(root+'.github/workflows/update-wow-api.lock.yml','utf8'));
  const manifest=JSON.parse(await fs.readFile(root+'skills/wow-api-index/references/generated/manifest.json','utf8'));
  const generatedReadmes=manifest.artifacts.map(entry=>entry.path)
    .filter(path=>path.endsWith('/references/generated/README.md'));
  assert.ok(generatedReadmes.length>0);
  const expected=generatedReadmes.flatMap(path=>['skills/'+path,'plugins/wow-addon-dev/skills/'+path]).sort();
  for(const config of publicationConfigs(compiled.jobs)) {
    assert.equal(config.protected_files_policy,'blocked');
    assert.ok(config.protected_files.includes('README.md'),'Keep basename protection for root and other READMEs');
    const exactPaths=config.protected_files_path_exclude;
    // gh-aw v1.0.1 uses literal path equality for these exceptions in both protection checks.
    assert.ok(exactPaths.every(path=>!/[?*\[]/.test(path)),'Protected-file exceptions must be exact paths');
    const exemptReadmes=exactPaths.filter(path=>path.split('/').at(-1)==='README.md').sort();
    assert.deepEqual(exemptReadmes,expected,'Exempt every generated copy and no other README');
    for(const file of [...versionFiles,'.github/agents/wow-addon.agent.md']) {
      assert.ok(exactPaths.includes(file),`Missing protected-file exception: ${file}`);
    }
    for(const prefix of ['skills/','plugins/wow-addon-dev/skills/']) {
      assert.ok(config.allowed_files.includes(prefix+'wow-*/references/generated/README.md'));
    }
  }
});

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
    if(!file.includes('*')) assert.ok(exclusions.includes('/'+file),`Missing protected-file exclusion: ${file}`);
    if(file.startsWith('skills/')) {
      assert.ok(allowed.includes('plugins/wow-addon-dev/'+file));
      if(!file.includes('*')) assert.ok(exclusions.includes('/plugins/wow-addon-dev/'+file));
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

test('unchanged pre-activation decisions skip activation, inference and detection',async()=>{
  const compiled=YAML.parse(await fs.readFile(root+'.github/workflows/update-wow-api.lock.yml','utf8'));
  const gate=compiled.jobs.pre_activation;
  const decision=gate.steps.find(step=>step.id==='upstream');
  assert.equal(decision.run,'node scripts/check-upstream.mjs --gate');
  assert.equal(decision['continue-on-error'],undefined);
  assert.equal(decision.env.GH_AW_SAFE_OUTPUTS,undefined);
  assert.equal(gate.outputs.review_required,'${{ steps.upstream.outputs.review_required }}');
  assert.deepEqual(gate.permissions,{contents:'read','pull-requests':'read'});
  assert.equal(compiled.jobs.activation.needs,'pre_activation');
  assert.equal(compiled.jobs.activation.if,"needs.pre_activation.outputs.activated == 'true' && (needs.pre_activation.outputs.review_required == 'true')");
  assert.equal(compiled.jobs.agent.needs,'activation');
  assert.ok(!/always\(\)|!cancelled\(\)/.test(compiled.jobs.agent.if));
  assert.equal(compiled.jobs.detection.if,"always() && needs.agent.result != 'skipped'");
  const verdict=compiled.jobs.detection.steps.find(step=>step.id==='detection_conclusion');
  assert.equal(verdict.env.GH_AW_DETECTION_CONTINUE_ON_ERROR,'false');
  assert.notEqual(verdict['continue-on-error'],true);
  assert.match(compiled.jobs.safe_outputs.if,/needs\.agent\.result == 'success'/);
  assert.match(compiled.jobs.safe_outputs.if,/needs\.detection\.result == 'success'/);
});
