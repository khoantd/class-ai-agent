#!/usr/bin/env node
/**
 * Verify .claude/, .kiro/, and Antigravity layout stay aligned with canonical .cursor/.
 * Exit 1 on parity failures (for test:cli / CI).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CURSOR = path.join(ROOT, '.cursor');
const CLAUDE = path.join(ROOT, '.claude');
const KIRO = path.join(ROOT, '.kiro');
const AGENTS = path.join(ROOT, '.agents');
const AGENT_RULES = path.join(ROOT, '.agent', 'rules');

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

function assertAntigravityParity() {
  const cursorCommands = listFiles(path.join(CURSOR, 'commands'), { ext: '.md' });
  const workflows = listFiles(path.join(AGENTS, 'workflows'), { ext: '.md' });
  const cursorAgents = listFiles(path.join(CURSOR, 'agents'), { ext: '.md' });
  const antigravityAgents = listFiles(path.join(AGENTS, 'agents'), { ext: '.md' });
  const cursorRefs = listFiles(path.join(CURSOR, 'references'), { ext: '.md' });
  const antigravityRefs = listFiles(path.join(AGENTS, 'references'), { ext: '.md' });

  const missingWorkflows = cursorCommands.filter((f) => !workflows.includes(f));
  const extraWorkflows = workflows.filter((f) => !cursorCommands.includes(f));
  const missingAgents = cursorAgents.filter((f) => !antigravityAgents.includes(f));
  const extraAgents = antigravityAgents.filter((f) => !cursorAgents.includes(f));

  if (missingWorkflows.length) {
    errors.push(`workflows: missing in .agents/workflows/: ${missingWorkflows.join(', ')}`);
  }
  if (extraWorkflows.length) {
    errors.push(`workflows: extra in .agents/workflows/: ${extraWorkflows.join(', ')}`);
  }
  if (missingAgents.length) {
    errors.push(`agents: missing in .agents/agents/: ${missingAgents.join(', ')}`);
  }
  if (extraAgents.length) {
    errors.push(`agents: extra in .agents/agents/: ${extraAgents.join(', ')}`);
  }

  for (const ref of cursorRefs) {
    if (!antigravityRefs.includes(ref)) {
      errors.push(`references: missing in .agents/references/: ${ref}`);
    }
  }
  if (!antigravityRefs.includes('mcp-antigravity.md')) {
    errors.push('references: missing .agents/references/mcp-antigravity.md');
  }

  const mdcFiles = listFiles(path.join(CURSOR, 'rules'), { ext: '.mdc' });
  for (const file of mdcFiles) {
    if (file === 'cursor-overview.mdc') continue;
    const base = file.replace(/\.mdc$/, '.md');
    if (!fs.existsSync(path.join(AGENT_RULES, base))) {
      errors.push(`rules: missing .agent/rules/${base}`);
    }
  }
  if (!fs.existsSync(path.join(AGENT_RULES, 'antigravity-overview.md'))) {
    errors.push('rules: missing .agent/rules/antigravity-overview.md');
  }

  const cursorSkills = path.join(CURSOR, 'skills');
  const antigravitySkills = path.join(AGENTS, 'skills');
  if (fs.existsSync(cursorSkills)) {
    for (const skill of fs.readdirSync(cursorSkills)) {
      const skillMd = path.join(antigravitySkills, skill, 'SKILL.md');
      if (!fs.existsSync(skillMd)) {
        errors.push(`skills: missing .agents/skills/${skill}/SKILL.md`);
      }
    }
  }

  if (!fs.existsSync(path.join(ROOT, 'GEMINI.md'))) {
    errors.push('missing GEMINI.md');
  }
  if (!fs.existsSync(path.join(ROOT, 'scripts/sync-antigravity-from-cursor.mjs'))) {
    errors.push('missing scripts/sync-antigravity-from-cursor.mjs');
  }
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
    '.agent/rules/codegraph.md',
    '.cursor/rules/ontosight.mdc',
    '.claude/rules/ontosight.md',
    '.kiro/steering/ontosight.md',
    '.agent/rules/ontosight.md',
    '.cursor/references/ontosight.md',
    '.cursor/rules/agent-continuity.mdc',
    '.claude/rules/agent-continuity.md',
    '.kiro/steering/agent-continuity.md',
    '.agent/rules/agent-continuity.md',
    '.agent/SESSION.template.md',
    '.agent/PROJECT.template.md',
    '.cursor/commands/understand-project.md',
    '.cursor/commands/resume.md',
    '.cursor/commands/handoff.md',
    '.agents/workflows/resume.md',
    '.agents/workflows/handoff.md',
    '.agents/workflows/understand-project.md',
    '.claude/commands/resume.md',
    '.claude/commands/understand-project.md',
    '.kiro/commands/resume.md',
    '.kiro/commands/understand-project.md',
    'scripts/sync-claude-from-cursor.mjs',
    'scripts/sync-antigravity-from-cursor.mjs',
    'scripts/sync-all.mjs',
    '.agents/references/mcp-antigravity.md',
    '.cursor/rules/ui-ux-pro-max.mdc',
    '.claude/rules/ui-ux-pro-max.md',
    '.kiro/steering/ui-ux-pro-max.md',
    '.agent/rules/ui-ux-pro-max.md',
    '.cursor/skills/ui-ux-pro-max/IMPACT-DEMO.md',
    '.claude/skills/ui-ux-pro-max/IMPACT-DEMO.md',
    '.kiro/skills/ui-ux-pro-max/IMPACT-DEMO.md',
    '.agents/skills/ui-ux-pro-max/IMPACT-DEMO.md',
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
  assertAntigravityParity();
  assertMcpParity();
  assertRequiredFiles();

  if (errors.length) {
    console.error('Parity check failed:\n');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log('Parity check passed (.cursor/ ↔ .claude/ ↔ .kiro/ ↔ Antigravity)');
}

main();
