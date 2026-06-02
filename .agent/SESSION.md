# Agent session

> Cross-tool handoff state for Cursor, Claude Code, and Kiro. Update at session end (`/handoff`) or phase changes; read at session start (`/resume`).

## Meta

| Field | Value |
|-------|-------|
| **Updated** | 2026-06-02 |
| **Phase** | build |
| **Tool** | cursor |
| **Persona** | _(maintainer)_ |

## Goal

Ship and document **class-ai-agent** scaffolding (Cursor / Claude / Kiro), **agent continuity** (`.agent/SESSION.md`, `/resume`, `/handoff`), and clear **CodeGraph** usage so agents do not confuse MCP parameters or use CodeGraph for session handoff.

## Done

- Diagnosed `Error: task must be a non-empty string` — wrong args on `codegraph_context` (`query`/`limit` vs `task`/`maxNodes`).
- Documented parameter split in `.cursor/rules/codegraph.mdc`, `.cursor/references/codegraph.md`, `.claude/`, `.kiro/` (via `npm run sync:kiro`).
- Clarified in agent-continuity rules: resume handoff = Read `SESSION.md`, not CodeGraph.

## In progress

- Uncommitted doc fixes (8 files) on `main`.
- **Blockers:** none

## Next

1. Review and commit CodeGraph / agent-continuity doc changes (if approved).
2. Optionally add `SESSION.md` to `.gitignore` exclusion note in README — **do commit** `SESSION.md` for this repo when it reflects real team state (template stays in package).
3. Run `npm run test:cli` before any npm publish.
4. Run `/handoff` after each meaningful session end.

## Decisions

- Session resume uses **`.agent/SESSION.md` + `/resume`**, not `codegraph_context`.
- `codegraph_context` requires **`task`**; `codegraph_search` requires **`query`**.

## Gotchas

- Calling `codegraph_context` with `{ "query": "...", "limit": 15 }` → `task must be a non-empty string`.
- CodeGraph MCP may need `projectPath` if workspace root is not detected.
- Verify CLI: `npm run test:cli`

## Pointers

| Item | Location |
|------|----------|
| Spec | _(none — package maintenance)_ |
| Tasks | _(no `tasks/todo.md` yet)_ |
| Branch | `main` |
| Key files | `.cursor/commands/resume.md`, `.cursor/commands/handoff.md`, `.cursor/rules/agent-continuity.mdc`, `.cursor/rules/codegraph.mdc`, `bin/class-ai-agent.cjs` |
