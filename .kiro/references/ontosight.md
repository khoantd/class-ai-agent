# OntoSight reference

[OntoSight](https://www.npmjs.com/package/@royalsolution/ontosight) visualizes [CodeGraph](https://github.com/colbymchenry/codegraph) call subgraphs in an interactive browser UI. **class-ai-agent** installs usage rules across all four agent trees; invocation is via `npx` (no npm dependency).

**Recommended version:** `@royalsolution/ontosight@0.2.0` (pins PyPI `ontosight-codegraph` 0.2.0). Use unpinned `npx @royalsolution/ontosight@0.2.0` only when the user explicitly wants latest.

OntoSight complements CodeGraph MCP — use `codegraph_*` for structural facts in chat; use OntoSight when the user wants visual exploration. See also [`.cursor/references/codegraph.md`](codegraph.md).

## Per-tool wiring

| Tool | Rules | Reference |
|------|-------|-----------|
| Cursor | `.cursor/rules/ontosight.mdc` | `.cursor/references/ontosight.md` |
| Claude Code | `.claude/rules/ontosight.md` | `.claude/references/ontosight.md` |
| Kiro | `.kiro/steering/ontosight.md` | `.kiro/references/ontosight.md` |
| Antigravity | `.agent/rules/ontosight.md` | `.agents/references/ontosight.md` |

## Quick start

```bash
# Full project — seeds from highest fan-in symbols
npx @royalsolution/ontosight@0.2.0 .

# Seed around a symbol (optionally scoped to a path)
npx @royalsolution/ontosight@0.2.0 . --symbol view_graph --path src/auth/

# Task-scoped subgraph (keyword FTS seeding)
npx @royalsolution/ontosight@0.2.0 . --task "auth flow" --hops 2 --max-nodes 200
```

Auto-creates the CodeGraph index when `.codegraph/codegraph.db` is missing (unless `ONTOSIGHT_SKIP_AUTO_INIT=1`).

## Flags

| Flag | Description | Default |
|------|-------------|---------|
| `[project-path]` | Project root containing `.codegraph/` | `.` (cwd) |
| `--path <dir>` | Limit symbols to files under this path | — |
| `--symbol <name>` | Seed symbol for BFS subgraph expansion | auto (fan-in) |
| `--task <text>` | Natural-language seed (keyword match) | — |
| `--hops <n>` | BFS hop depth | `2` |
| `--max-nodes <n>` | Cap subgraph size | `200` |

`--symbol` and `--task` are mutually exclusive seeds; `--path` narrows either.

## Suggested agent workflows

### Symbol the user named

```text
1. codegraph_search({ query: "view_graph" })     → confirm file + kind
2. Tell user what you found
3. npx @royalsolution/ontosight@0.2.0 . --symbol view_graph --path <dir-from-search>
```

### Feature area ("how does auth work?")

```text
1. codegraph_context({ task: "authentication flow", maxNodes: 20 })
2. Summarize key symbols in chat
3. npx @royalsolution/ontosight@0.2.0 . --task "authentication flow" --hops 2 --max-nodes 200
```

### Impact analysis demonstration

When the user wants to **know** or **see** impact (blast radius, what breaks, downstream callers):

**Triggers:** "impact", "blast radius", "what breaks", "what would break", "downstream", "affected by", "show impact", "demonstrate impact", "visualize impact"; or user is about to refactor/rename/delete a symbol.

**Workflow:**

```text
1. codegraph_search({ query: "<symbol>" })     → confirm file + kind
2. codegraph_impact({ query: "<symbol>" })     → ranked blast radius
3. Read skills/ui-ux-pro-max/IMPACT-DEMO.md  → UX presentation checklist
4. Optional: ui-ux-pro-max chart/ux searches (see playbook)
5. Summarize in chat (seed, ranked table, what graph shows)
6. npx @royalsolution/ontosight@0.2.0 . --symbol <name> --path <dir> --hops 3 --max-nodes 200
```

**Example:**

```bash
npx @royalsolution/ontosight@0.2.0 . --symbol deleteUser --path src/services/ --hops 3 --max-nodes 200
```

**UX:** Always text summary before opening the browser; include a ranked table of top impacted symbols (accessible alternative to graph-only). See [IMPACT-DEMO.md](../skills/ui-ux-pro-max/IMPACT-DEMO.md).

**Truncated subgraph:** narrow `--path` or lower `--hops` before raising `--max-nodes`.

### Index missing

```bash
npx @colbymchenry/codegraph init -i
# or let the OntoSight wrapper auto-init (default)
```

## Environment variables

| Variable | Effect |
|----------|--------|
| `ONTOSIGHT_SKIP_AUTO_INIT=1` | Fail if `.codegraph/codegraph.db` missing instead of running init |
| `ONTOSIGHT_CODEGRAPH_VERSION` | Pin PyPI `ontosight-codegraph` version |

## Requirements

| Requirement | Notes |
|-------------|-------|
| Node 20+ | For `npx @royalsolution/ontosight@0.2.0` |
| Python 3.11+ | Used by `ontosight-codegraph` |
| uv (recommended) or pipx | Wrapper tries `uvx` first, then `pipx run` |
| CodeGraph index | `.codegraph/codegraph.db` in project root |

## What the user sees

1. Terminal prints project path, seed, hops/max-nodes, and a topology table (critical / hub nodes).
2. OntoSight opens in the browser with the call subgraph, critical-node highlights, and a CodeGraph query panel for live reloads.
3. Process stays running until the user closes the server (Ctrl+C in terminal).

## Troubleshooting

| Issue | Action |
|-------|--------|
| `CodeGraph index not found` | Run `npx @colbymchenry/codegraph init -i` or remove `ONTOSIGHT_SKIP_AUTO_INIT` |
| `Neither uv nor pipx found` | Install uv: `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Subgraph truncated warning | Add `--symbol`, `--task`, or `--path`; lower scope before raising `--max-nodes` |
| Stale symbols after edits | Wait ~2s for CodeGraph watcher sync, or re-run init |
| Agent needs facts, not UI | Use `codegraph_*` MCP tools instead |

Upstream: [@royalsolution/ontosight](https://www.npmjs.com/package/@royalsolution/ontosight)
