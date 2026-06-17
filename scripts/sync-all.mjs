#!/usr/bin/env node
/**
 * Regenerate .claude/ and .kiro/ from .cursor/ (canonical source).
 * Run after changing .cursor/: npm run sync:all
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function runScript(name) {
  const scriptPath = path.join(ROOT, 'scripts', name);
  console.log(`\n→ ${name}`);
  const result = spawnSync('node', [scriptPath], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function main() {
  console.log('Syncing .claude/ and .kiro/ from .cursor/ ...');
  runScript('sync-claude-from-cursor.mjs');
  runScript('sync-kiro-from-cursor.mjs');
  console.log('\nDone: .claude/ and .kiro/ synced from .cursor/');
}

main();
