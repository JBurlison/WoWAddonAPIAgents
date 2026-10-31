import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from './lib.mjs';

const version = 'v1.0.1';
const executable = process.env.GH_AW_BIN || 'gh';
const prefix = process.env.GH_AW_BIN ? [] : ['aw'];
const run = args => spawnSync(executable, [...prefix,...args], {cwd:root,encoding:'utf8',shell:false});
const probe=run(['version']);
if(probe.status!==0 || probe.stdout.trim() !== `gh aw version ${version}`) {
  console.error(`Install github/gh-aw ${version}, or set GH_AW_BIN to that compiler executable. ${probe.error?.message || probe.stderr || ''}`);
  process.exit(1);
}
const lock=path.join(root,'.github/workflows/update-wow-api.lock.yml');
const before=await fs.readFile(lock,'utf8').catch(()=>null);
const result=run(['compile','update-wow-api','--no-check-update']);
process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
if(result.status!==0) process.exit(result.status || 1);
if(process.argv.includes('--check')) {
  const after=await fs.readFile(lock,'utf8');
  if(before?.replaceAll('\r\n','\n')!==after.replaceAll('\r\n','\n')) {
    console.error('Compiled workflow differs. Run npm run compile:workflow and commit the lock file.');
    process.exit(1);
  }
}
