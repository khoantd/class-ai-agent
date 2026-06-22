#!/usr/bin/env node
/**
 * Regenerate .kiro/ from .cursor/ (commands, agents, references, skills, MCP, steering).
 * Run after changing .cursor/: node scripts/sync-kiro-from-cursor.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CURSOR = path.join(ROOT, '.cursor');
const KIRO = path.join(ROOT, '.kiro');

const KIRO_OVERVIEW_STEERING = `---
inclusion: always
description: "Kiro agent workflow, principles, and where project guidance lives"
---

# Kiro agent — project workflow

This repo mirrors Claude Code’s \`.claude/\` and Cursor’s \`.cursor/\` layout under **\`.kiro/\`** for Kiro (IDE and CLI).

## Development workflow

Use the same phase order as in \`.kiro/KIRO.md\`:

1. **Define** — prompt from \`.kiro/commands/spec.md\` (paste, attach, or \`#\` reference)
2. **Plan** — \`.kiro/commands/plan.md\`
3. **Build** — \`.kiro/commands/build.md\` (TDD: \`.kiro/skills/tdd/\`)
4. **Verify** — \`.kiro/commands/test.md\`
5. **Review** — \`.kiro/commands/review.md\` (five-axis: \`.kiro/skills/code-review/\`)
6. **Ship** — \`.kiro/commands/deploy.md\`

Supporting prompts: \`debug\`, \`simplify\`, \`fix-issue\`, \`handoff\`, \`resume\`, \`understand-project\` in \`.kiro/commands/\`. Maintainers: \`publish-npm\` (say **push to npm repo** to draft README release notes and publish).

**First run:** if **\`.agent/onboarding.complete\`** is missing, agents automatically run **\`/understand\`** (\`.kiro/commands/understand-project.md\`) before other work.

**Agent continuity:** committed **\`.agent/SESSION.md\`** — read at session start (\`/resume\`), update at end (\`/handoff\`). See **\`.kiro/steering/agent-continuity.md\`**.

## Mandatory standards

- Follow **\`.kiro/steering/\`** (\`*.md\` with YAML frontmatter). **\`security.md\`**, **\`codegraph.md\`**, **\`ontosight.md\`**, and **\`agent-continuity.md\`** use \`inclusion: always\`; others often use \`fileMatch\`.
- Prefer **tests first** and **small vertical slices** (see \`.kiro/skills/incremental-implementation/\`).
- Use **\`.kiro/references/\`** for checklists (security, testing, performance, accessibility).
- For **structural** code questions, prefer **CodeGraph** MCP tools per **\`.kiro/steering/codegraph.md\`**.
- When the user wants a **visual call graph**, use **OntoSight CLI** per **\`.kiro/steering/ontosight.md\`** (\`royalsolution-ontosight\`).
- For **UI/UX work** (design, build, review, fix, improve — components, pages, layouts, styling, accessibility), read and follow the **ui-ux-pro-max** skill per **\`.kiro/steering/ui-ux-pro-max.md\`**.

## Agents (personas)

Specialized instructions live in **\`.kiro/agents/\`**. Reference files in chat (paste or attach).

## Relation to \`.claude/\`, \`.cursor/\`, and Antigravity

Keep all four trees aligned when you change workflows or standards. After editing \`.cursor/\`, run \`npm run sync:all\`.
`;

function rmIfExists(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function cpDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function parseMdcFrontmatter(content) {
  if (!content.startsWith('---')) return { meta: {}, body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: content };
  const raw = content.slice(4, end).trim();
  const body = content.slice(end + 4).replace(/^\n/, '');
  const meta = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[m[1]] = val;
  }
  return { meta, body };
}

function mdcToKiroSteering(name, content) {
  const { meta, body } = parseMdcFrontmatter(content);
  const lines = ['---'];
  if (meta.alwaysApply === 'true' || meta.alwaysApply === true) {
    lines.push('inclusion: always');
  } else if (meta.globs) {
    lines.push('inclusion: fileMatch');
    lines.push(`fileMatchPattern: "${meta.globs.replace(/"/g, '\\"')}"`);
  } else {
    lines.push('inclusion: always');
  }
  if (meta.description) {
    lines.push(`description: "${meta.description.replace(/"/g, '\\"')}"`);
  }
  lines.push('---', '');

  let text = body;
  if (name === 'cursor-overview.mdc') {
    return null;
  } else {
    text = text.replace(/\.cursor\//g, '.kiro/').replace(/\.mdc/g, '.md');
  }

  const outName = name === 'cursor-overview.mdc' ? 'kiro-overview.md' : name.replace(/\.mdc$/, '.md');
  return { outName, content: lines.join('\n') + text };
}

function main() {
  if (!fs.existsSync(CURSOR)) {
    console.error('Missing .cursor/ — run from repo root');
    process.exit(1);
  }

  for (const dir of ['commands', 'agents', 'references', 'skills']) {
    const src = path.join(CURSOR, dir);
    if (fs.existsSync(src)) {
      cpDir(src, path.join(KIRO, dir));
    }
  }

  fs.mkdirSync(path.join(KIRO, 'settings'), { recursive: true });
  fs.copyFileSync(path.join(CURSOR, 'mcp.json'), path.join(KIRO, 'settings', 'mcp.json'));

  const settings = {
    steering_dir: '.kiro/steering',
    commands_dir: '.kiro/commands',
    skills_dir: '.kiro/skills',
    agents_dir: '.kiro/agents',
    references_dir: '.kiro/references',
    note: 'Parallels .cursor/settings.json. Kiro loads .kiro/steering/*.md and .kiro/settings/mcp.json.',
  };
  fs.writeFileSync(path.join(KIRO, 'settings.json'), `${JSON.stringify(settings, null, 2)}\n`);

  fs.mkdirSync(path.join(KIRO, 'steering'), { recursive: true });
  for (const file of fs.readdirSync(path.join(CURSOR, 'rules'))) {
    if (!file.endsWith('.mdc')) continue;
    const raw = fs.readFileSync(path.join(CURSOR, 'rules', file), 'utf8');
    const converted = mdcToKiroSteering(file, raw);
    if (!converted) continue;
    const { outName, content } = converted;
    fs.writeFileSync(path.join(KIRO, 'steering', outName), content);
  }

  fs.writeFileSync(path.join(KIRO, 'steering', 'kiro-overview.md'), KIRO_OVERVIEW_STEERING);

  const codegraphRef = path.join(KIRO, 'references', 'codegraph.md');
  if (fs.existsSync(codegraphRef)) {
    let ref = fs.readFileSync(codegraphRef, 'utf8');
    ref = ref.replace(/## Cursor \(included with class-ai-agent\)/, '## Kiro (included with class-ai-agent)');
    ref = ref.replace(/\| MCP config \| `\.cursor\/mcp\.json` \|/g, '| MCP config | `.kiro/settings/mcp.json` |');
    ref = ref.replace(/\| Usage rules \| `\.cursor\/rules\/codegraph\.mdc` \|/g, '| Usage rules | `.kiro/steering/codegraph.md` |');
    ref = ref.replace(/Reload the Cursor window/g, 'Restart Kiro');
    ref = ref.replace(/under MCP in Cursor settings/g, 'under MCP in Kiro (IDE or CLI)');
    ref = ref.replace(
      /## Claude Code[\s\S]*?## Requirements/,
      `## Claude Code

Project scaffolding does **not** add Claude MCP config. Install CodeGraph globally:

\`\`\`bash
npx @colbymchenry/codegraph
codegraph install --target=claude --yes
\`\`\`

## Cursor

Cursor users get \`.cursor/mcp.json\` and \`.cursor/rules/codegraph.mdc\` from the same package. See \`.cursor/references/codegraph.md\`.

## Requirements`
    );
    fs.writeFileSync(codegraphRef, ref);
  }

  console.log('Synced .kiro/ from .cursor/');
}

main();
