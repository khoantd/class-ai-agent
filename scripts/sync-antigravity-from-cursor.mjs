#!/usr/bin/env node
/**
 * Regenerate Antigravity layout from .cursor/ (workflows, skills, agents, references, rules, GEMINI.md).
 * Run after changing .cursor/: node scripts/sync-antigravity-from-cursor.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CURSOR = path.join(ROOT, '.cursor');
const AGENTS = path.join(ROOT, '.agents');
const AGENT_RULES = path.join(ROOT, '.agent', 'rules');

const ANTIGRAVITY_OVERVIEW_RULE = `---
trigger: always_on
description: "Antigravity agent workflow, principles, and where project guidance lives"
---

# Antigravity agent — project workflow

This repo mirrors Cursor's \`.cursor/\` layout into Antigravity-native paths: **\`.agents/\`** (workflows, skills, agents) and **\`.agent/rules/\`** (supplement rules).

## Development workflow

Use the same phase order as in \`GEMINI.md\`:

1. **Define** — \`/spec\` workflow (\`.agents/workflows/spec.md\`)
2. **Plan** — \`/plan\` workflow
3. **Build** — \`/build\` workflow (TDD: \`.agents/skills/tdd/\`)
4. **Verify** — \`/test\` workflow
5. **Review** — \`/review\` workflow (five-axis: \`.agents/skills/code-review/\`)
6. **Ship** — \`/deploy\` workflow

Supporting workflows: \`debug\`, \`simplify\`, \`fix-issue\`, \`handoff\`, \`resume\`, \`understand-project\` in \`.agents/workflows/\`. Maintainers: \`publish-npm\` (say **push to npm repo** to draft README release notes and publish).

**First run:** if **\`.agent/onboarding.complete\`** is missing, agents automatically run **\`/understand\`** (\`.agents/workflows/understand-project.md\`) before other work.

**Agent continuity:** committed **\`.agent/SESSION.md\`** — read at session start (\`/resume\`), update at end (\`/handoff\`). See **\`.agent/rules/agent-continuity.md\`**.

## Mandatory standards

- Follow **\`.agent/rules/\`** (\`*.md\` with YAML frontmatter). **\`security.md\`**, **\`codegraph.md\`**, **\`ontosight.md\`**, and **\`agent-continuity.md\`** use \`trigger: always_on\`; others often use \`trigger: glob\`.
- Prefer **tests first** and **small vertical slices** (see \`.agents/skills/incremental-implementation/\`).
- Use **\`.agents/references/\`** for checklists (security, testing, performance, accessibility).
- For **structural** code questions, prefer **CodeGraph** MCP tools per **\`.agent/rules/codegraph.md\`**.
- When the user wants a **visual call graph**, use **OntoSight CLI** per **\`.agent/rules/ontosight.md\`** (\`royalsolution-ontosight\`).
- For **UI/UX work** (design, build, review, fix, improve — components, pages, layouts, styling, accessibility), read and follow the **ui-ux-pro-max** skill per **\`.agent/rules/ui-ux-pro-max.md\`**.

## Agents (personas)

Specialized instructions live in **\`.agents/agents/\`**. Reference files in chat (paste or attach).

## Relation to \`.cursor/\`, \`.claude/\`, and \`.kiro/\`

Keep all four trees aligned when you change workflows or standards. After editing \`.cursor/\`, run \`npm run sync:all\`.
`;

function cpDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function rewriteAntigravityPaths(text) {
  return text
    .replace(/\.cursor\/commands\//g, '.agents/workflows/')
    .replace(/\.cursor\/skills\//g, '.agents/skills/')
    .replace(/\.cursor\/agents\//g, '.agents/agents/')
    .replace(/\.cursor\/references\//g, '.agents/references/')
    .replace(/\.cursor\/rules\//g, '.agent/rules/')
    .replace(/\.cursor\/rules\//g, '.agent/rules/')
    .replace(/\.cursor\//g, '.agents/')
    .replace(/\.mdc\b/g, '.md')
    .replace(/\.kiro\/commands\//g, '.agents/workflows/')
    .replace(/\.kiro\/steering\//g, '.agent/rules/')
    .replace(/\.kiro\//g, '.agents/')
    .replace(/\.claude\/commands\//g, '.agents/workflows/')
    .replace(/\.claude\/rules\//g, '.agent/rules/')
    .replace(/\.claude\//g, '.agents/');
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

function parseMdFrontmatter(content) {
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

function globsToAntigravity(globs) {
  const brace = globs.match(/\{([^}]+)\}/);
  if (brace) {
    const exts = brace[1].split(',').map((e) => e.trim().replace(/^\./, ''));
    return `{${exts.join(',')}}`;
  }
  const starDot = globs.match(/\*\.(\w+)/);
  if (starDot) return `{${starDot[1]}}`;
  return '{ts,tsx,js,jsx,mjs,cjs,json,md,prisma,yml,yaml}';
}

function mdcToAntigravityRule(name, content) {
  if (name === 'cursor-overview.mdc') return null;

  const { meta, body } = parseMdcFrontmatter(content);
  const lines = ['---'];

  if (meta.alwaysApply === 'true' || meta.alwaysApply === true) {
    lines.push('trigger: always_on');
  } else if (meta.globs) {
    lines.push('trigger: glob');
    lines.push(`globs: ${globsToAntigravity(meta.globs)}`);
  } else {
    lines.push('trigger: always_on');
  }

  if (meta.description) {
    lines.push(`description: "${meta.description.replace(/"/g, '\\"')}"`);
  }

  lines.push('---', '');

  const text = rewriteAntigravityPaths(body);
  const outName = name.replace(/\.mdc$/, '.md');
  return { outName, content: lines.join('\n') + text };
}

function commandToWorkflow(name, content) {
  const { meta, body } = parseMdFrontmatter(content);
  const description = meta.description || meta.name || name.replace(/\.md$/, '');
  const lines = ['---', `description: "${description.replace(/"/g, '\\"')}"`, '---', ''];
  const text = rewriteAntigravityPaths(body);
  return lines.join('\n') + text;
}

function rewriteTreePaths(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteTreePaths(full);
    } else if (entry.isFile() && /\.(md|mdc|txt|json)$/i.test(entry.name)) {
      const raw = fs.readFileSync(full, 'utf8');
      fs.writeFileSync(full, rewriteAntigravityPaths(raw));
    }
  }
}

function writeGeminiMd() {
  const content = `# Antigravity AI agent configuration

## Overview

This project uses **Google Antigravity** with the same structured workflows, specialized agent personas, and coding standards as **\`.cursor/\`**, **\`.claude/\`**, and **\`.kiro/\`**. Antigravity-specific files live under **\`.agents/\`**, **\`.agent/rules/\`**, and this hub (**\`GEMINI.md\`**).

Root **\`AGENTS.md\`** provides cross-tool rules read by Antigravity, Cursor, and Claude Code. **\`GEMINI.md\`** holds Antigravity-specific overrides and takes precedence over \`AGENTS.md\` when rules conflict.

---

## Development workflow

Follow this workflow for feature development:

\`\`\`
/spec  →  /plan  →  /build  →  /test  →  /review  →  Ship
\`\`\`

| Phase | Workflow | Purpose |
|-------|----------|---------|
| **Define** | \`.agents/workflows/spec.md\` (\`/spec\`) | PRD: objectives, scope, boundaries |
| **Plan** | \`.agents/workflows/plan.md\` (\`/plan\`) | Vertical slices, acceptance criteria |
| **Build** | \`.agents/workflows/build.md\` (\`/build\`) | Incremental implementation, TDD |
| **Verify** | \`.agents/workflows/test.md\` (\`/test\`) | Tests and verification |
| **Review** | \`.agents/workflows/review.md\` (\`/review\`) | Five-axis review before merge |
| **Ship** | \`.agents/workflows/deploy.md\` (\`/deploy\`) | Build, test, deploy |

### Supporting workflows

| File | Purpose |
|------|---------|
| \`workflows/debug.md\` (\`/debug\`) | Systematic diagnosis |
| \`workflows/simplify.md\` (\`/simplify\`) | Reduce complexity, same behavior |
| \`workflows/fix-issue.md\` (\`/fix-issue\`) | Analyze and fix reported issues |
| \`workflows/handoff.md\` (\`/handoff\`) | End session — update \`.agent/SESSION.md\` for cross-tool continuity |
| \`workflows/resume.md\` (\`/resume\`) | Start session — load \`.agent/SESSION.md\` and continue prior work |
| \`workflows/understand-project.md\` (\`/understand\`) | First run — map project structure to \`.agent/PROJECT.md\` (auto if \`onboarding.complete\` missing) |
| \`workflows/publish-npm.md\` | **Maintainers:** draft release notes, bump version, update README, publish to npm |

**How to use:** Type the slash command (e.g. \`/build\`) in Antigravity, or open the workflow file and paste/attach in chat.

---

## Core principles

- **TDD** — Failing tests first, then implementation (\`.agents/skills/tdd/\`)
- **Incremental implementation** — Small vertical slices (\`.agents/skills/incremental-implementation/\`)
- **Five-axis review** — Correctness, readability, architecture, security, performance (\`.agents/skills/code-review/\`)

---

## Mandatory standards (rules)

Project standards are **\`.agent/rules/*.md\`**. They use YAML frontmatter:

- **\`trigger: always_on\`** — Loaded every session (\`antigravity-overview.md\`, \`security.md\`, \`codegraph.md\`, \`ontosight.md\`, \`agent-continuity.md\`)
- **\`trigger: glob\`** — Loaded when active files match \`globs\`
- **\`trigger: model_decision\`** — Activated by intent (persona rules)

| Topic | Rule file |
|-------|-----------|
| Clean code, style, errors | \`clean-code\`, \`code-style\`, \`error-handling\` |
| Stack, structure, APIs | \`tech-stack\`, \`project-structure\`, \`api-conventions\` |
| Data & naming | \`naming-conventions\`, \`database\` |
| Ops & quality | \`security\`, \`monitoring\`, \`testing\`, \`git-workflow\`, \`system-design\` |
| Code intelligence | \`codegraph\` (MCP usage; see below) |
| Code visualization | \`ontosight\` (CLI; see below) |
| UI/UX | \`ui-ux-pro-max\` (design-system search, UX checklist; see below) |
| Agent continuity | \`agent-continuity\` (\`.agent/SESSION.md\` handoff) |

---

## Agent continuity

Cross-tool handoff lives in **\`.agent/SESSION.md\`** (committed). Use **\`/resume\`** at session start and **\`/handoff\`** at session end when switching chats or tools. See **\`.agents/references/agent-continuity.md\`** and **\`.agent/rules/agent-continuity.md\`**.

---

## Code intelligence (CodeGraph)

This project includes **[CodeGraph](https://github.com/colbymchenry/codegraph)** for local, structural code search via MCP.

| Item | Location |
|------|----------|
| MCP server config | \`~/.gemini/antigravity/mcp_config.json\` (user-level; see \`.agents/references/mcp-antigravity.md\`) |
| Usage rules | \`.agent/rules/codegraph.md\` |
| Symbol index (generated) | \`.codegraph/\` (gitignored) |
| Setup reference | \`.agents/references/codegraph.md\` |

After configuring MCP, **restart Antigravity** so the CodeGraph MCP server connects. Use \`codegraph_*\` tools for structural questions (callers, callees, traces, impact); use grep/read for literal text in comments or strings.

If the index is missing, run \`npx @colbymchenry/codegraph init -i\` in the project root.

---

## Code visualization (OntoSight)

This project includes **[OntoSight](https://www.npmjs.com/package/royalsolution-ontosight)** for interactive CodeGraph call subgraphs in the browser.

| Item | Location |
|------|----------|
| Usage rules | \`.agent/rules/ontosight.md\` |
| Setup reference | \`.agents/references/ontosight.md\` |
| Shared index | \`.codegraph/\` (same as CodeGraph) |

Use \`codegraph_*\` MCP tools to gather structural facts in chat; run \`royalsolution-ontosight "<workspace-root>"\` when the user wants a visual call graph. For **impact analysis demos**, follow \`skills/ui-ux-pro-max/IMPACT-DEMO.md\` (search → \`codegraph_impact\` → summary → graph). Requires Node 20+, Python 3.11+, and uv or pipx.

---

## Agent personas

Instructions live in **\`.agents/agents/\`**. Invoke by **referencing** the file (paste or attach in chat).

| Area | File |
|------|------|
| Frontend, backend, architecture | \`frontend.md\`, \`backend.md\`, \`systems-architect.md\` |
| Quality | \`code-reviewer.md\`, \`test-engineer.md\`, \`qa.md\`, \`security-auditor.md\` |
| Product & content | \`business-analyst.md\`, \`project-manager.md\`, \`ui-ux-designer.md\`, \`copywriter-seo.md\` |

---

## Skills

Reusable playbooks: **\`.agents/skills/*/SKILL.md\`** (and related \`.md\` files where present).

| Skill | Use for |
|-------|---------|
| \`tdd\` | Red–green–refactor |
| \`code-review\` | Five-axis review |
| \`incremental-implementation\` | Vertical slices |
| \`deploy\` | Deployment pipeline |
| \`security-review\` | Security audit |
| \`agent-continuity\` | Cross-tool session handoff via \`.agent/SESSION.md\` |
| \`supabase\` | Supabase products, Auth, CLI, MCP, migrations, RLS |
| \`supabase-postgres-best-practices\` | Postgres performance, indexes, RLS tuning |
| \`ui-ux-pro-max\` | UI/UX design systems, styling, accessibility, pre-delivery checklist |

---

## Reference checklists

**\`.agents/references/\`**

| File | Use for |
|------|---------|
| \`security-checklist.md\` | Pre-deploy security |
| \`testing-patterns.md\` | Test structure |
| \`performance-checklist.md\` | Performance |
| \`accessibility-checklist.md\` | WCAG-oriented checks |
| \`codegraph.md\` | CodeGraph setup (all tools) |
| \`ontosight.md\` | OntoSight CLI for visual call graphs |
| \`mcp-antigravity.md\` | Antigravity MCP config (\`mcp_config.json\`) |
| \`agent-continuity.md\` | Session handoff and \`/resume\` / \`/handoff\` |
| \`supabase.md\` | Supabase skills, MCP OAuth, secrets |

---

## Config parity

Antigravity loads root **\`AGENTS.md\`**, **\`GEMINI.md\`**, **\`.agent/rules/*.md\`**, **\`.agents/workflows/\`**, and **\`.agents/skills/\`**. MCP servers are configured in user-level **\`~/.gemini/antigravity/mcp_config.json\`** — see \`.agents/references/mcp-antigravity.md\`.

---

## Agent behavior

1. Follow the workflow and use slash commands when starting a phase.
2. If **\`.agent/SESSION.md\`** exists, read it before planning or coding; run **\`/resume\`** when continuing prior work.
3. Apply **\`.agent/rules/\`**; treat **\`security.md\`** as non-negotiable.
4. Prefer tests first and small, buildable changes.
5. **Reference** the right **\`.agents/agents/\`** file when the task matches that role.
6. Update **\`.agent/SESSION.md\`** (or **\`/handoff\`**) before ending a session.
`;
  fs.writeFileSync(path.join(ROOT, 'GEMINI.md'), content);
}

function writeMcpAntigravityReference() {
  const content = `# Antigravity MCP reference

Antigravity reads MCP server configuration from a **user-level** file (not committed to the project):

| Platform | Path |
|----------|------|
| macOS / Linux | \`~/.gemini/antigravity/mcp_config.json\` |
| Windows | \`C:\\Users\\<USERNAME>\\.gemini\\antigravity\\mcp_config.json\` |

**Open in IDE:** Agent panel → **...** → **MCP Servers** → **Manage MCP Servers** → **View raw config**.

After editing, save and restart Antigravity (or refresh MCP servers in the UI).

## Important differences from Cursor

| Cursor (\`.cursor/mcp.json\`) | Antigravity (\`mcp_config.json\`) |
|-------------------------------|-----------------------------------|
| Project-level file | User-level file |
| HTTP servers use \`url\` | HTTP servers use \`serverUrl\` |
| \`\${workspaceFolder}\` in args | Use absolute project path or cwd-relative paths |

## Example configuration

Derived from class-ai-agent's bundled Cursor MCP. **Do not commit secrets** — use environment variables.

\`\`\`json
{
  "mcpServers": {
    "codegraph": {
      "command": "npx",
      "args": [
        "-y",
        "@colbymchenry/codegraph",
        "serve",
        "--mcp",
        "--path",
        "/absolute/path/to/your/project"
      ]
    },
    "supabase": {
      "serverUrl": "https://mcp.supabase.com/mcp?features=docs"
    }
  }
}
\`\`\`

Replace \`/absolute/path/to/your/project\` with your workspace root so CodeGraph indexes the correct tree.

**Supabase:** Complete OAuth in the browser the first time you use Supabase MCP tools.

## CodeGraph without MCP

Install globally for CLI use:

\`\`\`bash
npx @colbymchenry/codegraph
codegraph install --target=claude --yes
\`\`\`

Per-project index: \`npx @colbymchenry/codegraph init -i\` (class-ai-agent runs this on install).

## Troubleshooting

| Issue | Action |
|-------|--------|
| MCP tools missing | Restart Antigravity; verify JSON syntax |
| HTTP server fails | Use \`serverUrl\` not \`url\` |
| CodeGraph stale | Wait ~2s after edits; run \`codegraph init -i\` if index missing |
| Too many tools | Antigravity recommends keeping enabled tools under ~50 |

See also \`.agents/references/codegraph.md\`.
`;
  fs.mkdirSync(path.join(AGENTS, 'references'), { recursive: true });
  fs.writeFileSync(path.join(AGENTS, 'references', 'mcp-antigravity.md'), content);
}

function patchCodegraphReference() {
  const codegraphRef = path.join(AGENTS, 'references', 'codegraph.md');
  if (!fs.existsSync(codegraphRef)) return;

  let ref = fs.readFileSync(codegraphRef, 'utf8');
  ref = ref.replace(/## Cursor \(included with class-ai-agent\)/, '## Antigravity (included with class-ai-agent)');
  ref = ref.replace(/\| MCP config \| `\.cursor\/mcp\.json` \|/g, '| MCP config | `~/.gemini/antigravity/mcp_config.json` |');
  ref = ref.replace(/\| Usage rules \| `\.cursor\/rules\/codegraph\.mdc` \|/g, '| Usage rules | `.agent/rules/codegraph.md` |');
  ref = ref.replace(/Reload the Cursor window after install/g, 'Restart Antigravity after configuring MCP');
  ref = ref.replace(/under MCP in Cursor settings/g, 'under MCP in Antigravity (Agent panel → Manage MCP Servers)');
  ref = ref.replace(
    /## Kiro \(included with class-ai-agent\)[\s\S]*?See `\.kiro\/references\/codegraph\.md` for full notes\./,
    `## Cursor

| Item | Path |
|------|------|
| MCP config | \`.cursor/mcp.json\` |
| Usage rules | \`.cursor/rules/codegraph.mdc\` |

Reload Cursor after install. See \`.cursor/references/codegraph.md\`.

## Kiro

| Item | Path |
|------|------|
| MCP config | \`.kiro/settings/mcp.json\` |
| Usage rules | \`.kiro/steering/codegraph.md\` |

Restart Kiro after install. See \`.kiro/references/codegraph.md\`.`
  );
  ref = ref.replace(
    /## Claude Code[\s\S]*?## Requirements/,
    `## Claude Code

Project scaffolding does **not** add Claude MCP config. Install CodeGraph globally:

\`\`\`bash
npx @colbymchenry/codegraph
codegraph install --target=claude --yes
\`\`\`

## MCP setup for Antigravity

See \`.agents/references/mcp-antigravity.md\` for \`mcp_config.json\` example (CodeGraph + Supabase).

## Requirements`
  );
  fs.writeFileSync(codegraphRef, ref);
}

function main() {
  if (!fs.existsSync(CURSOR)) {
    console.error('Missing .cursor/ — run from repo root');
    process.exit(1);
  }

  const commandsSrc = path.join(CURSOR, 'commands');
  const workflowsDest = path.join(AGENTS, 'workflows');
  fs.mkdirSync(workflowsDest, { recursive: true });

  for (const file of fs.readdirSync(commandsSrc)) {
    if (!file.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join(commandsSrc, file), 'utf8');
    fs.writeFileSync(path.join(workflowsDest, file), commandToWorkflow(file, raw));
  }

  for (const dir of ['agents', 'skills']) {
    const src = path.join(CURSOR, dir);
    if (fs.existsSync(src)) {
      cpDir(src, path.join(AGENTS, dir));
    }
  }

  const refsSrc = path.join(CURSOR, 'references');
  if (fs.existsSync(refsSrc)) {
    cpDir(refsSrc, path.join(AGENTS, 'references'));
  }

  rewriteTreePaths(path.join(AGENTS, 'agents'));
  rewriteTreePaths(path.join(AGENTS, 'skills'));

  fs.mkdirSync(AGENT_RULES, { recursive: true });
  for (const file of fs.readdirSync(path.join(CURSOR, 'rules'))) {
    if (!file.endsWith('.mdc')) continue;
    const raw = fs.readFileSync(path.join(CURSOR, 'rules', file), 'utf8');
    const converted = mdcToAntigravityRule(file, raw);
    if (!converted) continue;
    const { outName, content } = converted;
    fs.writeFileSync(path.join(AGENT_RULES, outName), content);
  }

  fs.writeFileSync(path.join(AGENT_RULES, 'antigravity-overview.md'), ANTIGRAVITY_OVERVIEW_RULE);

  writeMcpAntigravityReference();
  patchCodegraphReference();
  writeGeminiMd();

  console.log('Synced Antigravity layout from .cursor/ (GEMINI.md, .agents/, .agent/rules/)');
}

main();
