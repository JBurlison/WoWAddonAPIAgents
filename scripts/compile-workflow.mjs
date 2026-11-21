import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, isMainModule } from './lib.mjs';

const version = 'v1.0.1';

export async function compileWorkflow({ check = false, base = root, runner } = {}) {
  const executable = process.env.GH_AW_BIN || 'gh';
  const prefix = process.env.GH_AW_BIN ? [] : ['aw'];
  const run = runner || (args => spawnSync(executable, [...prefix, ...args], { cwd: base, encoding: 'utf8', shell: false }));
  const probe = run(['version']);
  if (probe.status !== 0 || probe.stdout.trim() !== `gh aw version ${version}`) {
    throw new Error(`Install github/gh-aw ${version}, or set GH_AW_BIN to that compiler executable. ${probe.error?.message || probe.stderr || ''}`);
  }
  const tracked = [
    path.join(base, '.github/workflows/update-wow-api.lock.yml'),
    path.join(base, '.github/aw/actions-lock.json'),
  ];
  const before = await Promise.all(tracked.map(file =>
    fs.readFile(file, 'utf8').catch(error => error.code === 'ENOENT' ? null : Promise.reject(error)),
  ));
  try {
    const result = run(['compile', 'update-wow-api', '--no-check-update']);
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) throw new Error(`gh aw compile failed with exit status ${result.status ?? 1}`);
    if (check) {
      const after = await Promise.all(tracked.map(file =>
        fs.readFile(file, 'utf8').catch(error => error.code === 'ENOENT' ? null : Promise.reject(error)),
      ));
      const drifted = tracked.filter((_, i) => before[i]?.replaceAll('\r\n', '\n') !== after[i]?.replaceAll('\r\n', '\n'));
      if (drifted.length) {
        throw new Error(`Compiled workflow differs (${drifted.map(f => path.relative(base, f).replaceAll('\\', '/')).join(', ')}). Run npm run compile:workflow and commit the lock file.`);
      }
    }
  } finally {
    if (check) {
      for (const [i, file] of tracked.entries()) {
        if (before[i] === null) await fs.rm(file, { force: true });
        else await fs.writeFile(file, before[i]);
      }
    }
  }
}

if (isMainModule(import.meta.url)) {
  compileWorkflow({ check: process.argv.includes('--check') }).catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}
