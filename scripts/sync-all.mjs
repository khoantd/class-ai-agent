#!/usr/bin/env node
/**
 * Regenerate .claude/, .kiro/, and Antigravity layout from .cursor/ (canonical source).
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
  console.log('Syncing .claude/, .kiro/, and Antigravity layout from .cursor/ ...');
  runScript('sync-claude-from-cursor.mjs');
  runScript('sync-kiro-from-cursor.mjs');
  runScript('sync-antigravity-from-cursor.mjs');
  console.log('\nDone: .claude/, .kiro/, and Antigravity layout synced from .cursor/');
}

main();
