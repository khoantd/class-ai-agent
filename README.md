# class-ai-agent

**Give your AI coding agents the same discipline your team expects from production software.**

AI assistants like [Cursor](https://cursor.com), [Claude Code](https://code.claude.com/docs), [Kiro](https://kiro.dev), and [Antigravity](https://antigravity.google) move fast—but without shared rules, workflows, and handoff, every session starts from zero and quality depends on whoever wrote the prompt last. **class-ai-agent** is open-source scaffolding you drop into any repository: structured workflows, security guardrails, specialized agent personas, and code intelligence that stays with the project—not in a single chat thread.

Install once with `npx class-ai-agent`. You get four parallel layouts (`.cursor/`, `.claude/`, `.kiro/`, `.agents/` + `GEMINI.md`) wired to the same habits: Spec → Plan → Build → Test → Review → Ship. Session continuity lives in committed [`.agent/SESSION.md`](.agent/SESSION.md), so you can switch IDE, teammate, or model and resume with `/handoff` and `/resume`. CodeGraph and OntoSight rules, **UI/UX Pro Max** (v2.6.3), Supabase and Loop Library skills, and MCP configs ship pre-configured for Cursor and Kiro.

**Built for:** developers who want AI speed without sacrificing standards · teams aligning multiple AI tools · repos where security, TDD, and review are non-negotiable.

<div align="center">

<p>
  <img src="royal-solution-logo-v2.svg" alt="Royal Solution" width="280" />
</p>

### Royal Solution

Open-source AI agent scaffolding by **Royal Solution** — use it in your own projects and teams.

<sub>Adapted from <a href="https://github.com/fdhhhdjd/Class-AI-Agent">fdhhhdjd/Class-AI-Agent</a> · Community &amp; docs · <a href="https://codewebkhongkho.com/portfolios">Code Web Khong Kho</a></sub>

<p>
  <a href="https://www.npmjs.com/package/class-ai-agent"><img src="https://img.shields.io/npm/v/class-ai-agent?label=npm&logo=npm&style=flat-square" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D16.7-339933?logo=node.js&logoColor=white&style=flat-square" alt="Node.js 16.7+" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License MIT" />
  <img src="https://img.shields.io/badge/version-1.7.1-blue?style=flat-square" alt="Version" />
</p>

</div>

---

> **New in 1.7.0 — [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) v2.6.3**
>
> Stop guessing colors, fonts, and layout patterns. class-ai-agent now vendors **UI/UX Pro Max** across Cursor, Claude Code, Kiro, and Antigravity — a searchable design intelligence skill agents query **before** writing UI code.
>
> | Highlight | What you get |
> |-----------|----------------|
> | **Design-system search** | `python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "<product> <industry>" --design-system` → pattern, palette, typography, effects, anti-patterns |
> | **161 palettes + 161 reasoning rules** | Industry-specific recommendations (SaaS, fintech, healthcare, e-commerce, and more) |
> | **17 tech stacks** | `html-tailwind` (default), `nextjs`, `react`, `shadcn`, `angular`, `laravel`, `threejs`, `javafx`, and more |
> | **Tiered workflow** | Full design-system pass for **new UI**; targeted `--domain ux` / `--stack` for fixes; checklist-only for trivial edits |
> | **Impact demos** | `IMPACT-DEMO.md` pairs with CodeGraph + OntoSight — ranked blast-radius table before opening the graph |
> | **Maintainers** | `npm run sync:ui-ux-pro-max-skill` (pin in `scripts/ui-ux-pro-max-skills.lock.json`) |
>
> Try in chat: *"Use ui-ux-pro-max to build a fintech SaaS dashboard — run design-system search first."* · [Upstream repo](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) · Details below in [UI/UX Pro Max](#uiux-pro-max-design-intelligence)

> **Also in 1.6.9 — [Loop Library](https://signals.forwardfuture.ai/loop-library/) skill** · [section below](#loop-library-repeatable-agent-workflows)

---

## Contents

- [Why use this](#why-use-this)
- [Install (quick)](#install-quick)
- [CodeGraph (code intelligence)](#codegraph-code-intelligence)
- [OntoSight (code visualization)](#ontosight-code-visualization)
- [UI/UX Pro Max (design intelligence)](#uiux-pro-max-design-intelligence)
- [Loop Library (repeatable agent workflows)](#loop-library-repeatable-agent-workflows)
- [Agent continuity (cross-tool)](#agent-continuity-cross-tool)
- [Overview](#overview)
- [Development workflow](#development-workflow)
- [Project structure](#project-structure)
- [Specialized agents](#specialized-agents)
- [Approved tech stack](#approved-tech-stack)
- [Mandatory rules](#mandatory-rules)
- [Using commands & agents](#using-commands--agents)
- [Key concepts](#key-concepts)
- [Security](#security)
- [Release notes](#release-notes)
- [Contributing](#contributing)
- [Publishing to npm (maintainers)](#publishing-to-npm-maintainers)
- [Credits](#credits)

---

## Why use this

| You get | Details |
|--------|---------|
| **Four layouts** | **`.claude/`** (Claude Code), **`.cursor/`** (Cursor), **`.kiro/`** (Kiro), **`.agents/`** + **`GEMINI.md`** (Antigravity) |
| **One workflow** | Spec → Plan → Build → Test → Review → Ship |
| **11 agent personas** | Frontend, backend, architect, review, QA, security, BA, PM, UX, SEO, test engineer |
| **13 topic rules** | Code style, security, API, DB, testing, git, and more (same ideas in both trees) |
| **`npx` installer** | Copies the folders into your project in one command |
| **CodeGraph** | MCP + usage rules for Cursor and Kiro; Antigravity via user `mcp_config.json`; local index via [CodeGraph](https://github.com/colbymchenry/codegraph) |
| **OntoSight** | Visual call-graph UI via `royalsolution-ontosight`; usage rules synced to all four agent trees |
| **Loop Library** | Find, adapt, or design bounded repeatable agent workflows; CLI + skill bundled in v1.6.9+ |
| **UI/UX Pro Max** | Design-system search, 161 palettes, 17 stacks, pre-delivery checklist; vendored v2.6.3 in v1.7.0+ |
| **Agent continuity** | Committed **`.agent/SESSION.md`** — `/resume` and `/handoff` across Cursor, Claude Code, Kiro, and Antigravity |

Root **`AGENTS.md`** links hubs: **`.cursor/CURSOR.md`**, **`.kiro/KIRO.md`**, **`.claude/CLAUDE.md`**, **`GEMINI.md`**.

---

## Agent continuity (cross-tool)

When one agent stops and another starts (new chat, different IDE, or teammate), **`npx class-ai-agent`** installs **`.agent/SESSION.md`** — a committed handoff file shared by all tools.

| Command | When |
|---------|------|
| **`/understand`** | First run — map project structure (auto if `.agent/onboarding.complete` missing); writes `.agent/PROJECT.md` |
| **`/resume`** | Session start — read PROJECT + SESSION, `tasks/todo.md`, linked spec; summarize and continue |
| **`/handoff`** | Session end — update SESSION, sync tasks, note blockers |

**Read order:** `.agent/PROJECT.md` (if present) → `.agent/SESSION.md` → `tasks/todo.md` → `SPEC.md` (from SESSION pointers).

Rules: `.cursor/rules/agent-continuity.mdc`, `.claude/rules/agent-continuity.md`, `.kiro/steering/agent-continuity.md`, `.agent/rules/agent-continuity.md`. Reference: `.cursor/references/agent-continuity.md`.

Do **not** put secrets or PII in `SESSION.md`. See [`.agent/README.md`](.agent/README.md).

---

## Install (quick)

Requires **Node.js [16.7+](https://nodejs.org/)**.

```bash
npx class-ai-agent
```

The installer also runs **`npx @colbymchenry/codegraph init -i`** in the target directory (builds `.codegraph/` and adds it to `.gitignore`). **Node 20+** is recommended for CodeGraph. First run may take a minute while the index builds.

**First agent session:** agents automatically run **`/understand`** to map project structure (creates `.agent/PROJECT.md` and `.agent/onboarding.complete`), then continue your request.

Skip indexing (copy-only, e.g. CI):

```bash
CODEGRAPH_SKIP_INIT=1 npx class-ai-agent
```

Install into another directory, or only one agent target:

```bash
npx class-ai-agent --dir /path/to/your/project
npx class-ai-agent --claude
npx class-ai-agent --cursor
npx class-ai-agent --kiro
npx class-ai-agent --antigravity
npx class-ai-agent --force    # overwrite existing
npx class-ai-agent --help
```

**From a clone** (local dev):

```bash
git clone https://github.com/khoantd/class-ai-agent.git
cd class-ai-agent
npm exec -- class-ai-agent --dir /path/to/your/project
# or: node bin/class-ai-agent.cjs --dir /path/to/your/project
```

**Manual copy:** copy **`.agent/`**, **`.agents/`**, **`.claude/`**, **`.cursor/`**, **`.kiro/`**, **`AGENTS.md`**, and **`GEMINI.md`** into your project root. Copy `.agent/SESSION.template.md` → `.agent/SESSION.md` if needed. Then run `npx @colbymchenry/codegraph init -i` and reload Cursor / restart Kiro / configure Antigravity MCP.

---

## CodeGraph (code intelligence)

[class-ai-agent](https://www.npmjs.com/package/class-ai-agent) integrates **[CodeGraph](https://github.com/colbymchenry/codegraph)** — a local knowledge graph of symbols, call edges, and routes — so agents can answer structural questions with fewer grep/read tool calls.

| Topic | Details |
|-------|---------|
| **What you get** | Cursor + Kiro MCP config, usage rules, auto `init -i`, `.codegraph/` gitignored |
| **Cursor** | `.cursor/mcp.json`, `.cursor/rules/codegraph.mdc` — reload window after install |
| **Kiro** | `.kiro/settings/mcp.json`, `.kiro/steering/codegraph.md` — restart Kiro after install |
| **Claude Code** | Not wired by this package — `codegraph install --target=claude` (see `.claude/references/codegraph.md`) |
| **Antigravity** | User `~/.gemini/antigravity/mcp_config.json`, `.agent/rules/codegraph.md` — see `.agents/references/mcp-antigravity.md` |
| **Manual index** | `npx @colbymchenry/codegraph init -i` if auto-init failed |
| **Troubleshooting** | [CodeGraph README](https://github.com/colbymchenry/codegraph#troubleshooting) · `.cursor/references/codegraph.md` |
| **Opt-out** | `CODEGRAPH_SKIP_INIT=1` when running `npx class-ai-agent` |

---

## OntoSight (code visualization)

[class-ai-agent](https://www.npmjs.com/package/class-ai-agent) integrates **[OntoSight](https://www.npmjs.com/package/royalsolution-ontosight)** — interactive CodeGraph call subgraphs in the browser. OntoSight complements CodeGraph MCP: use `codegraph_*` for facts in chat; use OntoSight when the user wants a visual graph.

| Topic | Details |
|-------|---------|
| **What you get** | Always-on usage rules across Cursor, Claude Code, Kiro, and Antigravity |
| **Cursor** | `.cursor/rules/ontosight.mdc`, `.cursor/references/ontosight.md` |
| **Kiro** | `.kiro/steering/ontosight.md`, `.kiro/references/ontosight.md` |
| **Claude Code** | `.claude/rules/ontosight.md`, `.claude/references/ontosight.md` |
| **Antigravity** | `.agent/rules/ontosight.md`, `.agents/references/ontosight.md` |
| **Quick start** | `npx royalsolution-ontosight@0.2.1 "<workspace-root>"` — pass absolute workspace root (not bare `.`); auto-inits CodeGraph index if missing |
| **Project graph** | Preflight with `codegraph_status`; seeds from `codegraph_search` in same project — see `.cursor/rules/ontosight.mdc` |
| **Pinned version** | `royalsolution-ontosight@0.2.1` (`ontosight-codegraph` 0.2.0 on PyPI) |
| **Requirements** | Node 20+, Python 3.11+, uv or pipx; shares `.codegraph/` with CodeGraph |
| **Troubleshooting** | `.cursor/references/ontosight.md` |
| **Impact demos** | `skills/ui-ux-pro-max/IMPACT-DEMO.md` — `codegraph_impact` → UX summary → graph |

Example agent workflow (feature area):

```text
0. codegraph_status({ projectPath: "<workspace-root>" })
1. codegraph_context({ task: "auth flow", maxNodes: 20, projectPath: "<workspace-root>" })  → answer in chat
2. npx royalsolution-ontosight@0.2.1 "<workspace-root>" --task "auth flow" --hops 2   → open graph for user
```

Example **impact analysis** demo:

```text
0. codegraph_status({ projectPath: "<workspace-root>" })
1. codegraph_search({ query: "<symbol>", projectPath: "<workspace-root>" })
2. codegraph_impact({ query: "<symbol>", projectPath: "<workspace-root>" })  → ranked blast radius in chat
3. Follow IMPACT-DEMO.md (ui-ux-pro-max presentation)
4. npx royalsolution-ontosight@0.2.1 "<workspace-root>" --symbol <name> --path <dir> --hops 3
```

**Wrong graph in browser?** OntoSight defaults to shell `cwd` — always pass the absolute workspace root as `[project-path]`. See `.cursor/references/ontosight.md` troubleshooting.

---

## UI/UX Pro Max (design intelligence)

[class-ai-agent](https://www.npmjs.com/package/class-ai-agent) bundles **[UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** — a vendored design intelligence skill agents read before building or reviewing UI. Data and scripts ship in-repo; agents run Python searches locally (no API key).

| Topic | Details |
|-------|---------|
| **What you get** | Searchable datasets (styles, palettes, typography, UX guidelines, stack rules), `search.py` CLI, `ui-ux-pro-max.mdc` rule, and **IMPACT-DEMO.md** for CodeGraph/OntoSight impact presentations |
| **Cursor** | `.cursor/skills/ui-ux-pro-max/`, `.cursor/rules/ui-ux-pro-max.mdc` |
| **Claude Code** | `.claude/skills/ui-ux-pro-max/`, `.claude/rules/ui-ux-pro-max.md` |
| **Kiro** | `.kiro/skills/ui-ux-pro-max/`, `.kiro/steering/ui-ux-pro-max.md` |
| **Antigravity** | `.agents/skills/ui-ux-pro-max/`, `.agent/rules/ui-ux-pro-max.md` |
| **New UI (required)** | `--design-system` search → pattern, colors, typography, effects, anti-patterns |
| **Fixes / reviews** | Targeted `--domain ux` or `--stack <name>`; skip full design-system unless scope is large |
| **Persist** | `--design-system --persist` writes `design-system/MASTER.md` + per-page overrides |
| **Stacks (17)** | `html-tailwind` (default), `nextjs`, `react`, `shadcn`, `vue`, `svelte`, `astro`, `nuxtjs`, `nuxt-ui`, `angular`, `laravel`, `threejs`, `javafx`, `flutter`, `swiftui`, `react-native`, `jetpack-compose` |
| **Maintainers** | `npm run sync:ui-ux-pro-max-skill` (pin in `scripts/ui-ux-pro-max-skills.lock.json`) |
| **Upstream** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) · [uupm.cc](https://uupm.cc) |

Example agent workflow (new landing page):

```bash
# 1. Design system (required for new UI)
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness elegant" --design-system -p "Serenity Spa"

# 2. Supplement UX / stack guidance as needed
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack html-tailwind
```

**Pre-delivery checklist** (in SKILL.md): SVG icons (no emoji), contrast, `cursor-pointer` on interactive elements, hover/focus states, responsive breakpoints (375/768/1024/1440), form labels, `prefers-reduced-motion`.

**Impact demos:** when presenting blast radius with OntoSight, follow `.cursor/skills/ui-ux-pro-max/IMPACT-DEMO.md` — text summary + ranked table *before* opening the graph.

---

## Loop Library (repeatable agent workflows)

[class-ai-agent](https://www.npmjs.com/package/class-ai-agent) bundles the **[Loop Library](https://signals.forwardfuture.ai/loop-library/)** agent skill and documents the companion **[`loop-library`](https://www.npmjs.com/package/loop-library)** npm CLI. A loop is a feedback system — observe, act, verify, repeat or stop — not permission for endless autonomy.

| Topic | Details |
|-------|---------|
| **What you get** | Vendored `loop-library` skill, usage rule, reference doc, and persona hooks across all four agent trees |
| **Cursor** | `.cursor/skills/loop-library/`, `.cursor/rules/loop-library.mdc`, `.cursor/references/loop-library.md` |
| **Kiro** | `.kiro/skills/loop-library/`, `.kiro/steering/loop-library.md`, `.kiro/references/loop-library.md` |
| **Claude Code** | `.claude/skills/loop-library/`, `.claude/rules/loop-library.md` |
| **Antigravity** | `.agents/skills/loop-library/`, `.agent/rules/loop-library.md`, `.agents/references/loop-library.md` |
| **Find** | `npx loop-library@latest recommend "<goal>" --json` → skill ranks top 3 with links |
| **Adapt** | `npx loop-library@latest show <slug> --json` or `adapt <slug> --json` |
| **Design** | Short interview when no published loop fits → compact copy-ready prompt |
| **Offline fallback** | Bundled `references/catalog.md` when live catalog is unavailable |
| **Maintainers** | `npm run sync:loop-library-skill` (pin in `scripts/loop-library-skills.lock.json`) |
| **Web catalog** | [Browse loops](https://signals.forwardfuture.ai/loop-library/) · [Guided builder](https://signals.forwardfuture.ai/loop-library/create/) |

Example agent workflow:

```text
1. npx loop-library@latest recommend "keep documentation current" --json   → shortlist
2. Read .cursor/skills/loop-library/SKILL.md                               → rank by fit, verification, stopping rules
3. Return ≤3 recommendations with links, or deliver adapted loop prompt
```

**Smart pairing:** CLI for a fast deterministic shortlist; skill for judgment on verification fit, authority, and when *not* to manufacture a loop (use a one-shot workflow instead).

---

## Overview

This repo ships **four parallel layouts** so you can use the same habits in Claude Code, Cursor, Kiro, and Antigravity:

| Layout | Tool | What you use |
|--------|------|----------------|
| **`.claude/`** | Claude Code | Slash commands, **`CLAUDE.md`**, rules as **`.md`** |
| **`.cursor/`** | Cursor | Project rules as **`.mdc`**, hub **`CURSOR.md`**, **`@`** file mentions |
| **`.kiro/`** | Kiro | **Steering** as **`.md`** in `.kiro/steering/`, hub **`KIRO.md`**, **`.kiro/settings/mcp.json`** |
| **`.agents/`** + **`GEMINI.md`** | Antigravity | **Workflows** in `.agents/workflows/` (slash commands), **`.agent/rules/`**, root **`AGENTS.md`** |

What is inside:

- **Structured workflow** (Spec → Plan → Build → Test → Review → Ship)
- **11 specialized agents** (markdown personas under `agents/`)
- **13 mandatory topic rules** (plus **`cursor-overview.mdc`**, **`codegraph.mdc`**, **`ontosight.mdc`**, **`loop-library.mdc`**, **`ui-ux-pro-max.mdc`**, and **`agent-continuity.mdc`** under `.cursor/rules/`)
- **11 workflow prompts** under `commands/` (includes `handoff`, `resume`)
- **10 skills** (TDD, code review, incremental implementation, deploy, security review, agent continuity, UI/UX Pro Max, **loop-library**, **supabase**, **supabase-postgres-best-practices**)
- **9 reference docs** (security, testing, performance, accessibility, codegraph, ontosight, agent-continuity, **supabase**, **loop-library**)
- **`.agent/SESSION.md`** for cross-tool session handoff
- **CodeGraph + Supabase MCP** for Cursor and Kiro (`.cursor/mcp.json`, `.kiro/settings/mcp.json`); Antigravity via user `mcp_config.json` (example in `.agents/references/mcp-antigravity.md`); **OntoSight CLI** for visual call graphs; **`loop-library` CLI** for loop shortlisting

Keep **`.claude/`**, **`.cursor/`**, **`.kiro/`**, and the Antigravity layout in sync when you change standards. After editing `.cursor/` (canonical), run **`npm run sync:all`** to refresh `.claude/`, `.kiro/`, `.agents/`, `.agent/rules/`, and `GEMINI.md`.

---

## Development Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│   /spec  →  /plan  →  /build  →  /test  →  /review  →  /deploy   │
│   Define     Plan     Build      Verify    Review      Ship      │
└──────────────────────────────────────────────────────────────────┘
```

| Phase | Command | Purpose |
|-------|---------|---------|
| **Define** | `/spec` | PRD: objectives, scope, boundaries |
| **Plan** | `/plan` | Vertical slices, acceptance criteria |
| **Build** | `/build` | Incremental implementation, TDD |
| **Verify** | `/test` | Tests (RED → GREEN → REFACTOR) |
| **Review** | `/review` | Five-axis code review |
| **Ship** | `/deploy` | Build, test, deploy |

**Supporting:** `/debug`, `/simplify`, `/fix-issue`, `/handoff`, `/resume` (see `commands/`).

At session boundaries, use **`/handoff`** before switching tools and **`/resume`** when picking work back up.

---

## Project Structure

### `.agent/` (cross-tool)

```
.agent/
├── README.md
├── SESSION.md              # Live handoff (committed; seeded on install)
├── SESSION.template.md     # Schema reference
└── rules/                  # Antigravity supplement rules (synced from .cursor/rules/)
```

### `.agents/` + `GEMINI.md` (Antigravity)

Mirrors `.cursor/` for skills, agents, and references. Commands become **workflows** (slash commands):

| Item | Role |
|------|------|
| **`GEMINI.md`** | Hub (Antigravity-specific; overrides `AGENTS.md` when rules conflict) |
| **`workflows/*.md`** | Slash-command workflows (`/build`, `/resume`, …) |
| **`skills/`**, **`agents/`**, **`references/`** | Same content as `.cursor/` (path-rewritten) |
| **`.agent/rules/`** | Supplement rules (`trigger: always_on` / `glob`) |

```
.agents/
├── workflows/              # 12 workflows (from .cursor/commands/)
├── agents/
├── skills/
└── references/             # includes mcp-antigravity.md
GEMINI.md                   # Antigravity hub (repo root)
```

MCP is **user-level**: `~/.gemini/antigravity/mcp_config.json` — see `.agents/references/mcp-antigravity.md`.

### `.claude/` (Claude Code)

```
.claude/
├── CLAUDE.md                 # Main configuration
├── commands/                 # 11 workflow prompts (spec, plan, build, handoff, resume, …)
├── agents/                   # 10 personas
├── rules/                    # 15 mandatory topic rules (.md, synced from .cursor/)
├── skills/                   # TDD, review, deploy, …
├── references/               # Checklists + codegraph.md
└── settings.json
```

### `.cursor/` (Cursor)

Same ideas as `.claude/` for `commands/`, `agents/`, `skills/`, `references/`. Differences:

| Item | Role |
|------|------|
| **`CURSOR.md`** | Hub (like `CLAUDE.md`, Cursor-focused) |
| **`rules/*.mdc`** | Project rules + YAML; **`security.mdc`**, **`cursor-overview.mdc`**, **`codegraph.mdc`**, **`ontosight.mdc`** are central |
| **`mcp.json`** | MCP servers (CodeGraph) |
| **`settings.json`** | Path hints (mirrors Claude layout) |
| **`AGENTS.md`** (repo root) | Entry pointer for Cursor |

```
.cursor/
├── CURSOR.md
├── mcp.json                  # CodeGraph + Supabase MCP
├── settings.json
├── commands/
├── agents/
├── rules/                    # 17 × .mdc (13 topics + cursor-overview + codegraph + ontosight + agent-continuity)
├── skills/
└── references/               # includes codegraph.md, ontosight.md
```

After install, **`.codegraph/`** (generated index) lives at the project root and should stay gitignored.

### `.kiro/` (Kiro)

Mirrors `.cursor/` for `commands/`, `agents/`, `skills/`, `references/`. Kiro uses **steering** instead of `.mdc` rules:

| Item | Role |
|------|------|
| **`KIRO.md`** | Hub (like `CURSOR.md`) |
| **`steering/*.md`** | Project standards (`inclusion: always` / `fileMatch` / `manual`) |
| **`settings/mcp.json`** | MCP servers (CodeGraph) |
| **`settings.json`** | Path hints |

```
.kiro/
├── KIRO.md
├── settings/
│   └── mcp.json              # CodeGraph + Supabase MCP
├── settings.json
├── steering/                 # kiro-overview.md, security.md, codegraph.md, …
├── commands/
├── agents/
├── skills/
└── references/
```

Regenerate from `.cursor/` after rule changes: `npm run sync:all`.

### Skill notes

- **`loop-library/`**: Find, adapt, or design bounded repeatable agent workflows; pairs with [`loop-library`](https://www.npmjs.com/package/loop-library) CLI (`recommend`, `show`, `adapt`). See [Loop Library](#loop-library-repeatable-agent-workflows).
- **`ui-ux-pro-max/`**: Design-system search skill vendored from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (`v2.6.3` — 161 palettes, 17 stacks). Includes datasets under `data/`, helper scripts under `scripts/`, and class-ai-agent `IMPACT-DEMO.md` for CodeGraph/OntoSight impact demos. Refresh: `npm run sync:ui-ux-pro-max-skill` (pin in `scripts/ui-ux-pro-max-skills.lock.json`).

---

## Specialized Agents

| Area | Agents |
|------|--------|
| **Development** | Frontend, Backend, Systems Architect |
| **Quality** | Code Reviewer, Test Engineer, Security Auditor, QA |
| **Product** | Project Manager, Business Analyst, UI/UX Designer, Copywriter/SEO |

Full definitions live in **`agents/*.md`**. In Cursor, **`@`**-include a file when you want that role.

---

## Approved tech stack

| Layer | Technology |
|-------|------------|
| **Frontend (SEO)** | Next.js 14 (App Router) |
| **Frontend (admin)** | React + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | Zustand + TanStack Query |
| **Backend** | Express.js + TypeScript |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Cache** | Redis (ioredis) |
| **Queue** | BullMQ / RabbitMQ |
| **Auth** | NextAuth.js / JWT + bcrypt |
| **Testing** | Vitest + Playwright |
| **Monitoring** | Prometheus + Grafana + Pino |
| **CI/CD** | GitHub Actions |
| **Deploy** | Vercel + Railway/Fly.io |

Details and alternatives are in **`rules/tech-stack.md`** (or **`.mdc`** in Cursor).

---

## Mandatory rules

Use **`.claude/rules/*.md`** or **`.cursor/rules/*.mdc`** (paired content; Cursor applies `.mdc` frontmatter).

| Theme | Files |
|-------|--------|
| **Code quality** | `clean-code`, `code-style`, `error-handling` |
| **Architecture** | `tech-stack`, `system-design`, `project-structure`, `api-conventions` |
| **Data** | `naming-conventions`, `database` |
| **Operations** | **`security`** (critical), `monitoring`, `testing`, `git-workflow` |
| **Agent intelligence** | `codegraph`, `ontosight`, **`loop-library`** (v1.6.9+), **`ui-ux-pro-max`** (v1.7.0+, upstream v2.6.3), `agent-continuity` |

---

## Using commands & agents

**Claude Code** — run slash commands in the tool, e.g.:

```text
/spec "User authentication feature"
/plan
/build
/test
/review
/deploy
```

**Cursor** — prompts live under **`.cursor/commands/`**. Open the file, copy the section you need, or **`@`** it (e.g. `@.cursor/commands/spec.md`).

**Kiro** — prompts live under **`.kiro/commands/`**. Open the file, paste or attach in chat, or reference it when running a slash workflow. Restart Kiro after install so MCP (CodeGraph, Supabase) connects.

**Antigravity** — use slash workflows (`/build`, `/spec`, …) or open **`.agents/workflows/*.md`**. Read **`GEMINI.md`** for the hub. Configure MCP via **Manage MCP Servers** (see `.agents/references/mcp-antigravity.md`).

**Agents** — describe the role in natural language, or **`@`** (Cursor) / reference (Claude, Kiro, Antigravity) an agent file, e.g. `@.cursor/agents/code-reviewer.md` or `.agents/agents/code-reviewer.md`.

---

## Key concepts

### Five-axis review

1. **Correctness** — Behavior, edge cases, tests  
2. **Readability** — Names, structure  
3. **Architecture** — Patterns, boundaries  
4. **Security** — Validation, auth, secrets  
5. **Performance** — Queries, async, pagination  

### TDD

`RED` (failing test) → `GREEN` (minimal pass) → `REFACTOR`.

### Vertical slices

Ship thin end-to-end slices (DB + API + UI), not “all models first, then all routes.”

---

## Security

**Do not commit:** `.env`, secrets, API keys, **`.claude/settings.local.json`**, or local-only Cursor overrides with secrets.

**Do:** environment variables, input validation, strong password hashing, parameterized queries.

---

## Release notes

### 1.7.1 — 2026-06-24

**README — UI/UX Pro Max highlights**

- Add **1.7.0 highlight banner** (design-system search, 161 palettes, 17 stacks, tiered workflow, impact demos)
- New [UI/UX Pro Max (design intelligence)](#uiux-pro-max-design-intelligence) section with paths, commands, and example workflow
- Update Contents, intro, and **Why use this** table for v2.6.3 skill

### 1.7.0 — 2026-06-24

**UI/UX Pro Max — upstream v2.6.3**

- Vendor **ui-ux-pro-max** from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) @ `v2.6.3` (`npm run sync:ui-ux-pro-max-skill`)
- Expanded datasets: **161 color palettes**, **161 industry reasoning rules**, **67 styles**, **99 UX guidelines**, **25 chart types**
- **17 tech stacks** — adds `angular`, `laravel`, `javafx`, `threejs` (+ existing `html-tailwind`, `nextjs`, `react`, `shadcn`, `vue`, `svelte`, `astro`, `nuxtjs`, `nuxt-ui`, mobile stacks)
- Add `scripts/sync-ui-ux-pro-max-skill.mjs` and `scripts/ui-ux-pro-max-skills.lock.json`; `classAiAgent.uiUxProMaxVersion` (`2.6.3`)
- Preserve class-ai-agent **IMPACT-DEMO.md** (CodeGraph → UX summary → OntoSight), multi-tool SKILL paths, tiered workflow rule, and web-focused pre-delivery checklist
- README highlight banner and [UI/UX Pro Max](#uiux-pro-max-design-intelligence) section; update `ui-ux-pro-max.mdc` stack list; extend `test:cli` and parity checks; THIRD_PARTY_NOTICES entry

### 1.6.9 — 2026-06-22

**Loop Library — repeatable agent workflows**

- Bundle **Loop Library** agent skill vendored from [khoantd/loop-library](https://github.com/khoantd/loop-library) across Cursor, Claude Code, Kiro, and Antigravity (`npm run sync:loop-library-skill`)
- **Find · Adapt · Design** — recommend published loops, customize matches, or run a short interview for new bounded workflows with verification and stop rules
- **CLI pairing** — `npx loop-library@latest recommend "<goal>" --json` for a fast top-3 shortlist; skill applies outcome fit, authority, and stopping-condition judgment
- Add **`loop-library.mdc`** rule, **`.cursor/references/loop-library.md`**, and conditional Loop Library sections across all **11 agent personas**
- README highlight banner and full [Loop Library](#loop-library-repeatable-agent-workflows) section; update hub docs and `cursor-overview.mdc`
- Add `loop-library` npm keyword, `classAiAgent.loopLibraryVersion` (`0.1.1`); extend `test:cli` and parity checks

### 1.6.8 — 2026-06-22

- Pin OntoSight to `royalsolution-ontosight@0.2.1` via `classAiAgent.ontosightVersion`; update CLI help, rules, references, and IMPACT-DEMO across all agent trees
- Add `npm run publish:local` for local npm publish (`--provenance=false` when `publishConfig.provenance` is enabled)
- Document pinned OntoSight version in README maintainer publishing section

### 1.6.7 — 2026-06-22

- Harden Socket.dev supply-chain signals: pin CodeGraph to `@colbymchenry/codegraph@1.0.1`, remove Windows shell spawn, use `npx.cmd` with `shell: false`
- Add `author`, `publishConfig.provenance`, and `classAiAgent.codegraphVersion` to `package.json`
- Reduce static-analysis false positives in shipped security and OntoSight docs
- Add GitHub Actions CI (`.github/workflows/ci.yml`) running `npm run test:cli`

### 1.6.6 — 2026-06-20

- Rename OntoSight CLI invocations from `npx @royalsolution/ontosight@0.2.0` to **`royalsolution-ontosight`** across all agent trees, references, README, and CLI help
- Update npm package links to [royalsolution-ontosight](https://www.npmjs.com/package/royalsolution-ontosight)

### 1.6.5 — 2026-06-20

- Add **`/understand`** first-run workflow — auto project structure mapping to `.agent/PROJECT.md` when `onboarding.complete` is missing
- Add `.agent/PROJECT.template.md` schema for persistent cross-tool project maps
- Require **Agent continuity (mandatory)** in all 11 agent personas — read and update `.agent/SESSION.md` at session start, during work, and before handoff
- Require **CodeGraph (mandatory)** in all agent personas — use `codegraph_*` for structural questions before grep/read exploration loops
- Add **Index health (smart)** — `codegraph_status` preflight, trust watcher auto-sync, init only when the index is missing; never re-init after normal edits or partial staleness
- Add always-on **ui-ux-pro-max** rules synced across Cursor, Claude Code, Kiro, and Antigravity
- Extend parity checks and Claude sync script for CodeGraph smart-index reference parity

### 1.6.4 — 2026-06-19

- Professional README hero introduction — outcome-led copy for developers and teams using Cursor, Claude Code, Kiro, and Antigravity
- Update npm package description to highlight rules, workflows, agents, CodeGraph, and cross-tool session handoff

### 1.6.3 — 2026-06-19

- Add **Project graph fidelity** rules for OntoSight — mandatory `codegraph_status` preflight, absolute workspace root as `[project-path]`, seed binding from CodeGraph MCP
- Replace fragile bare `.` OntoSight examples with `<workspace-root>` across rules, references, IMPACT-DEMO, README, and CLI help
- Add wrong-graph troubleshooting (foreign repo symbols, MCP/OntoSight path mismatch)

### 1.6.2 — 2026-06-19

- Pin agent OntoSight CLI invocations to **`royalsolution-ontosight`** (latest; `ontosight-codegraph` 0.2.0)

### 1.6.1 — 2026-06-19

- Add **impact analysis demonstration** workflow: `codegraph_impact` → UX summary → OntoSight graph
- New `skills/ui-ux-pro-max/IMPACT-DEMO.md` playbook (ui-ux-pro-max chart/UX framing, accessible ranked table)
- Extend `ontosight` and `codegraph` rules with impact triggers and visualization cross-links

### 1.6.0 — 2026-06-19

- Integrate **[OntoSight](https://www.npmjs.com/package/royalsolution-ontosight)** — visual CodeGraph call subgraphs via `royalsolution-ontosight`
- Add always-on `ontosight` rules and references synced to Cursor, Claude Code, Kiro, and Antigravity
- Cross-link CodeGraph rules with OntoSight visualization workflows

### 1.5.1 — 2026-06-17

- Sync package-lock.json version with package.json

### 1.5.0 — 2026-06-17

- Add Google Antigravity IDE support: `GEMINI.md` hub, `.agents/` workflows/skills/agents, `.agent/rules/` supplement rules
- New `sync-antigravity-from-cursor.mjs` wired into `npm run sync:all` with parity checks
- CLI `--antigravity` flag; safe merge of `.agent/rules/` without overwriting `SESSION.md`
- MCP setup reference at `.agents/references/mcp-antigravity.md` (user-level `mcp_config.json`)

### 1.4.1 — 2026-06-17

- Add **Business Analyst** agent persona (BABOK v3) for Cursor, Claude Code, and Kiro
- Document Business Analyst in hub agent tables (`.cursor/CURSOR.md`, `.claude/CLAUDE.md`, `.kiro/KIRO.md`)

### 1.4.0 — 2026-06-02

- Bundle official **Supabase Agent Skills** (`supabase`, `supabase-postgres-best-practices`) for Cursor, Claude Code, and Kiro
- Add **Supabase MCP** (`https://mcp.supabase.com/mcp?features=docs`) alongside CodeGraph in `.cursor/mcp.json` and `.kiro/settings/mcp.json`
- Add `.cursor/references/supabase.md`, `THIRD_PARTY_NOTICES.md`, and maintainer command `npm run sync:supabase-skills` (pinned to [supabase/agent-skills](https://github.com/supabase/agent-skills) v0.1.5)

### 1.3.0 — 2026-06-02

- Add **Kiro** support (steering, commands, MCP) with `npm run sync:kiro` to keep `.kiro/` aligned with `.cursor/`
- Ship **CodeGraph** rules, references, and MCP config for Cursor, Claude Code, and Kiro
- Add **agent continuity**: `.agent/SESSION.md` template, `/resume` and `/handoff` commands, and cross-tool rules
- Document `codegraph_context` (`task`) vs `codegraph_search` (`query`) so agents avoid MCP parameter errors
- Include **UI/UX Pro Max** skill and expanded production skills, commands, and specialized agents

## Contributing

1. Follow the workflow (`/spec` → `/plan` → `/build`, or the same prompts under `.cursor/commands/`).
2. Keep tests green.
3. Run **`/review`** before opening a PR.
4. Use [conventional commits](https://www.conventionalcommits.org/).
5. Update **`.cursor/`** when rules or workflows change, then run **`npm run sync:all`** to refresh `.claude/`, `.kiro/`, and Antigravity layout; run **`npm run sync:supabase-skills`** to refresh vendored Supabase skills; run **`npm run sync:loop-library-skill`** to refresh the Loop Library skill; run **`npm run sync:ui-ux-pro-max-skill`** to refresh UI/UX Pro Max.

---

## Publishing to npm (maintainers)

`package.json` name: **`class-ai-agent`**. Use **`npm run publish:local`** (or `npm publish --access public --provenance=false`) after `npm login`.

`publishConfig.provenance` is enabled — prefer publishing from GitHub Actions (or use `npm publish --provenance`) so npm records build provenance. For local publishes outside CI, use **`npm publish --access public --provenance=false`**.

**Pinned CodeGraph:** the installer runs `@colbymchenry/codegraph` at the version in `package.json` → `classAiAgent.codegraphVersion`. Bump that field when upgrading CodeGraph, then release a new package version.

**Pinned OntoSight:** agent docs and CLI help reference `royalsolution-ontosight@<version>` from `classAiAgent.ontosightVersion`. Bump that field when upgrading the npm wrapper, then release a new package version.

**Loop Library:** vendored skill from [khoantd/loop-library](https://github.com/khoantd/loop-library); agents use `npx loop-library@<version>` per `classAiAgent.loopLibraryVersion`. Refresh with `npm run sync:loop-library-skill` (pin in `scripts/loop-library-skills.lock.json`).

**UI/UX Pro Max:** vendored skill from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) @ `classAiAgent.uiUxProMaxVersion`. Refresh with `npm run sync:ui-ux-pro-max-skill` (pin in `scripts/ui-ux-pro-max-skills.lock.json`).

<details>
<summary><strong>403 / two-factor authentication</strong></summary>

If publish fails with **two-factor authentication** required:

1. On [npmjs.com](https://www.npmjs.com/) → **Account** → enable **Two-Factor Authentication** (include **writes** for publishing).
2. Run **`npm logout`** then **`npm login`**.
3. Run **`npm publish --access public`** again and enter the OTP when prompted.

For CI, use an [npm access token](https://docs.npmjs.com/about-access-tokens) with publish permission and set **`NPM_TOKEN`** as documented by npm.

</details>

<details>
<summary><strong>403 / “cannot publish over the previously published versions”</strong></summary>

Each version number can only be published **once**. After **`1.2.0`** is on the registry, you must bump before the next upload, for example:

```bash
npm version patch --no-git-tag-version
npm publish --access public
```

That advances **`patch`** (e.g. `1.2.0` → `1.2.1`). Use **`npm version minor`** or **`major`** when the change warrants it.

</details>

---

## Credits

- **[Royal Solution](https://codewebkhongkho.com/portfolios)** — project and scaffolding.
- Upstream inspiration: [fdhhhdjd/Class-AI-Agent](https://github.com/fdhhhdjd/Class-AI-Agent), [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills).
- **CodeGraph:** [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) (MIT).
