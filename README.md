# AI Agent Project

**Production-grade configuration for [Claude Code](https://code.claude.com/docs), [Cursor](https://cursor.com), and [Kiro](https://kiro.dev)** — shared rules, specialized agents, workflow prompts, and checklists you can drop into any repository.

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
  <img src="https://img.shields.io/badge/version-1.4.0-blue?style=flat-square" alt="Version" />
</p>

</div>

---

## Contents

- [Why use this](#why-use-this)
- [Install (quick)](#install-quick)
- [CodeGraph (code intelligence)](#codegraph-code-intelligence)
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
| **Three layouts** | **`.claude/`** (Claude Code), **`.cursor/`** (Cursor), **`.kiro/`** (Kiro steering + MCP) |
| **One workflow** | Spec → Plan → Build → Test → Review → Ship |
| **10 agent personas** | Frontend, backend, architect, review, QA, security, PM, UX, SEO, test engineer |
| **13 topic rules** | Code style, security, API, DB, testing, git, and more (same ideas in both trees) |
| **`npx` installer** | Copies the folders into your project in one command |
| **CodeGraph** | MCP + usage rules for Cursor and Kiro; local index via [CodeGraph](https://github.com/colbymchenry/codegraph) |
| **Agent continuity** | Committed **`.agent/SESSION.md`** — `/resume` and `/handoff` across Cursor, Claude Code, and Kiro |

Root **`AGENTS.md`** links hubs: **`.cursor/CURSOR.md`**, **`.kiro/KIRO.md`**, **`.claude/CLAUDE.md`**.

---

## Agent continuity (cross-tool)

When one agent stops and another starts (new chat, different IDE, or teammate), **`npx class-ai-agent`** installs **`.agent/SESSION.md`** — a committed handoff file shared by all tools.

| Command | When |
|---------|------|
| **`/resume`** | Session start — read SESSION, `tasks/todo.md`, linked spec; summarize and continue |
| **`/handoff`** | Session end — update SESSION, sync tasks, note blockers |

**Read order:** `.agent/SESSION.md` → `tasks/todo.md` → `SPEC.md` (from SESSION pointers).

Rules: `.cursor/rules/agent-continuity.mdc`, `.claude/rules/agent-continuity.md`, `.kiro/steering/agent-continuity.md`. Reference: `.cursor/references/agent-continuity.md`.

Do **not** put secrets or PII in `SESSION.md`. See [`.agent/README.md`](.agent/README.md).

---

## Install (quick)

Requires **Node.js [16.7+](https://nodejs.org/)**.

```bash
npx class-ai-agent
```

The installer also runs **`npx @colbymchenry/codegraph init -i`** in the target directory (builds `.codegraph/` and adds it to `.gitignore`). **Node 20+** is recommended for CodeGraph. First run may take a minute while the index builds.

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

**Manual copy:** copy **`.agent/`**, **`.claude/`**, **`.cursor/`**, **`.kiro/`**, and **`AGENTS.md`** into your project root. Copy `.agent/SESSION.template.md` → `.agent/SESSION.md` if needed. Then run `npx @colbymchenry/codegraph init -i` and reload Cursor / restart Kiro.

---

## CodeGraph (code intelligence)

[class-ai-agent](https://www.npmjs.com/package/class-ai-agent) integrates **[CodeGraph](https://github.com/colbymchenry/codegraph)** — a local knowledge graph of symbols, call edges, and routes — so agents can answer structural questions with fewer grep/read tool calls.

| Topic | Details |
|-------|---------|
| **What you get** | Cursor + Kiro MCP config, usage rules, auto `init -i`, `.codegraph/` gitignored |
| **Cursor** | `.cursor/mcp.json`, `.cursor/rules/codegraph.mdc` — reload window after install |
| **Kiro** | `.kiro/settings/mcp.json`, `.kiro/steering/codegraph.md` — restart Kiro after install |
| **Claude Code** | Not wired by this package — `codegraph install --target=claude` (see `.claude/references/codegraph.md`) |
| **Manual index** | `npx @colbymchenry/codegraph init -i` if auto-init failed |
| **Opt-out** | `CODEGRAPH_SKIP_INIT=1` when running `npx class-ai-agent` |
| **Troubleshooting** | [CodeGraph README](https://github.com/colbymchenry/codegraph#troubleshooting) · `.cursor/references/codegraph.md` |

---

## Overview

This repo ships **three parallel trees** so you can use the same habits in Claude Code, Cursor, and Kiro:

| Layout | Tool | What you use |
|--------|------|----------------|
| **`.claude/`** | Claude Code | Slash commands, **`CLAUDE.md`**, rules as **`.md`** |
| **`.cursor/`** | Cursor | Project rules as **`.mdc`**, hub **`CURSOR.md`**, **`@`** file mentions |
| **`.kiro/`** | Kiro | **Steering** as **`.md`** in `.kiro/steering/`, hub **`KIRO.md`**, **`.kiro/settings/mcp.json`** |

What is inside:

- **Structured workflow** (Spec → Plan → Build → Test → Review → Ship)
- **10 specialized agents** (markdown personas under `agents/`)
- **13 mandatory topic rules** (plus **`cursor-overview.mdc`** under `.cursor/rules/`)
- **11 workflow prompts** under `commands/` (includes `handoff`, `resume`)
- **9 skills** (TDD, code review, incremental implementation, deploy, security review, agent continuity, UI/UX Pro Max, **supabase**, **supabase-postgres-best-practices**)
- **7 reference docs** (security, testing, performance, accessibility, codegraph, agent-continuity, **supabase**)
- **`.agent/SESSION.md`** for cross-tool session handoff
- **CodeGraph + Supabase MCP** for Cursor and Kiro (`.cursor/mcp.json`, `.kiro/settings/mcp.json`)

Keep **`.claude/`**, **`.cursor/`**, and **`.kiro/`** in sync when you change standards. After editing `.cursor/`, run **`npm run sync:kiro`** (or `node scripts/sync-kiro-from-cursor.mjs`) to refresh `.kiro/`.

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
└── SESSION.template.md     # Schema reference
```

### `.claude/` (Claude Code)

```
.claude/
├── CLAUDE.md                 # Main configuration
├── commands/                 # 11 workflow prompts (spec, plan, build, handoff, resume, …)
├── agents/                   # 10 personas
├── rules/                    # 14 mandatory topic rules (.md)
├── skills/                   # TDD, review, deploy, …
├── references/               # Checklists + codegraph.md
└── settings.json
```

### `.cursor/` (Cursor)

Same ideas as `.claude/` for `commands/`, `agents/`, `skills/`, `references/`. Differences:

| Item | Role |
|------|------|
| **`CURSOR.md`** | Hub (like `CLAUDE.md`, Cursor-focused) |
| **`rules/*.mdc`** | Project rules + YAML; **`security.mdc`**, **`cursor-overview.mdc`**, **`codegraph.mdc`** are central |
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
├── rules/                    # 16 × .mdc (13 topics + cursor-overview + codegraph + agent-continuity)
├── skills/
└── references/               # includes codegraph.md
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

Regenerate from `.cursor/` after rule changes: `npm run sync:kiro`.

### Skill notes

- **`ui-ux-pro-max/`**: A UI/UX-oriented skill bundle (includes datasets under `data/` and helper scripts under `scripts/`) to support design-system decisions and UX guidelines.

---

## Specialized Agents

| Area | Agents |
|------|--------|
| **Development** | Frontend, Backend, Systems Architect |
| **Quality** | Code Reviewer, Test Engineer, Security Auditor, QA |
| **Product** | Project Manager, UI/UX Designer, Copywriter/SEO |

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

**Agents** — describe the role in natural language, or in Cursor **`@`** an agent file, e.g. `@.cursor/agents/code-reviewer.md`.

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
5. Update **`.claude/`**, **`.cursor/`**, and **`.kiro/`** when rules or workflows change (run `npm run sync:kiro` after `.cursor/` edits; run `npm run sync:supabase-skills` to refresh vendored Supabase skills).

---

## Publishing to npm (maintainers)

`package.json` name: **`class-ai-agent`**. Use **`npm publish --access public`** after `npm login`.

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
