#!/usr/bin/env node
/**
 * Regenerate .claude/ from .cursor/ (commands, agents, references, skills, rules).
 * Run after changing .cursor/: node scripts/sync-claude-from-cursor.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CURSOR = path.join(ROOT, '.cursor');
const CLAUDE = path.join(ROOT, '.claude');

function cpDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function parseMdcFrontmatter(content) {
  if (!content.startsWith('---')) return { body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { body: content };
  const body = content.slice(end + 4).replace(/^\n/, '');
  return { body };
}

function mdcToClaudeRule(name, content) {
  if (name === 'cursor-overview.mdc') return null;
  const { body } = parseMdcFrontmatter(content);
  const text = body.replace(/\.cursor\//g, '.claude/').replace(/\.mdc/g, '.md');
  const outName = name.replace(/\.mdc$/, '.md');
  return { outName, content: text };
}

function patchClaudeSettings() {
  const settingsPath = path.join(CLAUDE, 'settings.json');
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }
  settings.rules_dir = '.claude/rules';
  settings.commands_dir = '.claude/commands';
  settings.skills_dir = '.claude/skills';
  settings.agents_dir = '.claude/agents';
  settings.references_dir = '.claude/references';
  if (!settings.note) {
    settings.note =
      'Parallels .cursor/settings.json. Claude Code loads .claude/rules/*.md and .claude/CLAUDE.md.';
  }
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

function patchCodegraphReference() {
  const codegraphRef = path.join(CLAUDE, 'references', 'codegraph.md');
  const content = `# CodeGraph reference

[CodeGraph](https://github.com/colbymchenry/codegraph) is a local, tree-sitter–parsed knowledge graph exposed to agents via MCP.

## Claude Code (included with class-ai-agent)

| Item | Path |
|------|------|
| Usage rules | \`.claude/rules/codegraph.md\` |
| Index (generated) | \`.codegraph/\` (gitignored) |

1. Install CodeGraph for Claude Code globally (see below).
2. Confirm CodeGraph MCP is available in Claude Code.
3. Use \`codegraph_*\` tools for structural questions; grep/read for literal text.

**Global install** (project scaffolding does not add Claude MCP config):

\`\`\`bash
npx @colbymchenry/codegraph
# or: npm i -g @colbymchenry/codegraph
codegraph install --target=claude --yes
\`\`\`

**Manual index:** \`codegraph init -i\` (class-ai-agent may run this on install)

## Cursor (via class-ai-agent)

- \`.cursor/mcp.json\` — CodeGraph MCP server
- \`.cursor/rules/codegraph.mdc\` — when to use \`codegraph_*\` tools

Reload Cursor after install. See \`.cursor/references/codegraph.md\`.

## Kiro (via class-ai-agent)

- \`.kiro/settings/mcp.json\` — CodeGraph MCP server
- \`.kiro/steering/codegraph.md\` — when to use \`codegraph_*\` tools

Restart Kiro after install. See \`.kiro/references/codegraph.md\`.

## Requirements

- **Node 20+** recommended for CodeGraph (class-ai-agent CLI itself supports Node 16.7+).
- Index data lives in \`.codegraph/\` — add to \`.gitignore\` (class-ai-agent does this automatically).

## Tool parameters

| Tool | Pass | Not |
|------|------|-----|
| \`codegraph_search\` | \`query\`, optional \`limit\` | — |
| \`codegraph_context\` | **\`task\`** (natural-language area), optional **\`maxNodes\`** | \`query\`, \`limit\` |

**Session handoff** (\`/resume\`, \`.agent/SESSION.md\`) is not a CodeGraph call — read those files with the editor Read tool.

## Troubleshooting

| Issue | Action |
|-------|--------|
| \`task must be a non-empty string\` | Use \`task\` (not \`query\`) on \`codegraph_context\`; use \`maxNodes\` (not \`limit\`). For \`/resume\`, read \`.agent/SESSION.md\` instead. |
| MCP "not initialized" | Run \`npx @colbymchenry/codegraph init -i\` in project root |
| Stale symbols after edit | Wait ~2s for watcher sync, or check staleness banner in tool output |

See [CodeGraph README](https://github.com/colbymchenry/codegraph) for full troubleshooting.
`;
  fs.writeFileSync(codegraphRef, content);
}

function main() {
  if (!fs.existsSync(CURSOR)) {
    console.error('Missing .cursor/ — run from repo root');
    process.exit(1);
  }

  for (const dir of ['commands', 'agents', 'references', 'skills']) {
    const src = path.join(CURSOR, dir);
    if (fs.existsSync(src)) {
      cpDir(src, path.join(CLAUDE, dir));
    }
  }

  fs.mkdirSync(path.join(CLAUDE, 'rules'), { recursive: true });
  for (const file of fs.readdirSync(path.join(CURSOR, 'rules'))) {
    if (!file.endsWith('.mdc')) continue;
    const raw = fs.readFileSync(path.join(CURSOR, 'rules', file), 'utf8');
    const converted = mdcToClaudeRule(file, raw);
    if (!converted) continue;
    const { outName, content } = converted;
    fs.writeFileSync(path.join(CLAUDE, 'rules', outName), content);
  }

  patchClaudeSettings();
  patchCodegraphReference();

  console.log('Synced .claude/ from .cursor/');
}

main();
