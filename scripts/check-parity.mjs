#!/usr/bin/env node
/**
 * Verify .claude/ and .kiro/ stay aligned with canonical .cursor/.
 * Exit 1 on parity failures (for test:cli / CI).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CURSOR = path.join(ROOT, '.cursor');
const CLAUDE = path.join(ROOT, '.claude');
const KIRO = path.join(ROOT, '.kiro');

const errors = [];

function listFiles(dir, { ext } = {}) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => !ext || f.endsWith(ext))
    .sort();
}

function assertSameFilenames(label, cursorDir, claudeDir, kiroDir) {
  const cursor = listFiles(path.join(CURSOR, cursorDir));
  const claude = listFiles(path.join(CLAUDE, claudeDir));
  const kiro = listFiles(path.join(KIRO, kiroDir));

  const onlyClaude = claude.filter((f) => !cursor.includes(f));
  const onlyKiro = kiro.filter((f) => !cursor.includes(f));
  const missingClaude = cursor.filter((f) => !claude.includes(f));
  const missingKiro = cursor.filter((f) => !kiro.includes(f));

  if (onlyClaude.length) errors.push(`${label}: extra in .claude/: ${onlyClaude.join(', ')}`);
  if (onlyKiro.length) errors.push(`${label}: extra in .kiro/: ${onlyKiro.join(', ')}`);
  if (missingClaude.length) errors.push(`${label}: missing in .claude/: ${missingClaude.join(', ')}`);
  if (missingKiro.length) errors.push(`${label}: missing in .kiro/: ${missingKiro.join(', ')}`);
}

function assertRuleParity() {
  const mdcFiles = listFiles(path.join(CURSOR, 'rules'), { ext: '.mdc' });
  for (const file of mdcFiles) {
    if (file === 'cursor-overview.mdc') continue;
    const base = file.replace(/\.mdc$/, '.md');
    const claudeRule = path.join(CLAUDE, 'rules', base);
    const kiroSteering = path.join(KIRO, 'steering', base);
    if (!fs.existsSync(claudeRule)) errors.push(`rules: missing .claude/rules/${base}`);
    if (!fs.existsSync(kiroSteering)) errors.push(`rules: missing .kiro/steering/${base}`);
  }
  if (!fs.existsSync(path.join(KIRO, 'steering', 'kiro-overview.md'))) {
    errors.push('rules: missing .kiro/steering/kiro-overview.md');
  }
}

function assertMcpParity() {
  const cursorMcp = JSON.parse(fs.readFileSync(path.join(CURSOR, 'mcp.json'), 'utf8'));
  const kiroMcp = JSON.parse(fs.readFileSync(path.join(KIRO, 'settings', 'mcp.json'), 'utf8'));
  const a = JSON.stringify(cursorMcp);
  const b = JSON.stringify(kiroMcp);
  if (a !== b) errors.push('MCP: .cursor/mcp.json !== .kiro/settings/mcp.json');
}

function assertRequiredFiles() {
  const required = [
    '.cursor/rules/codegraph.mdc',
    '.claude/rules/codegraph.md',
    '.kiro/steering/codegraph.md',
    '.cursor/rules/agent-continuity.mdc',
    '.claude/rules/agent-continuity.md',
    '.kiro/steering/agent-continuity.md',
    '.agent/SESSION.template.md',
    '.cursor/commands/resume.md',
    '.cursor/commands/handoff.md',
    '.claude/commands/resume.md',
    '.kiro/commands/resume.md',
    'scripts/sync-claude-from-cursor.mjs',
    'scripts/sync-all.mjs',
  ];
  for (const rel of required) {
    if (!fs.existsSync(path.join(ROOT, rel))) errors.push(`required file missing: ${rel}`);
  }
}

function main() {
  assertSameFilenames('commands', 'commands', 'commands', 'commands');
  assertSameFilenames('agents', 'agents', 'agents', 'agents');
  assertSameFilenames('references', 'references', 'references', 'references');
  assertRuleParity();
  assertMcpParity();
  assertRequiredFiles();

  if (errors.length) {
    console.error('Parity check failed:\n');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log('Parity check passed (.cursor/ ↔ .claude/ ↔ .kiro/)');
}

main();
