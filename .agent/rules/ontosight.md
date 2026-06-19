---
trigger: always_on
description: "OntoSight CLI — visualize CodeGraph call subgraphs in the browser"
---

## OntoSight

[OntoSight](https://www.npmjs.com/package/@royalsolution/ontosight) visualizes CodeGraph call subgraphs in an interactive browser UI. It is **not** an MCP server — there are no `ontosight_*` tools. Use **CodeGraph MCP** (`codegraph_*`) to answer structural questions in chat; use **OntoSight CLI** when the user wants a visual, interactive call graph.

See **`.agent/rules/codegraph.md`** for MCP usage and **`.agents/references/ontosight.md`** for full flags and troubleshooting.

### CodeGraph MCP vs OntoSight

| Goal | Use |
|------|-----|
| Find symbols, callers, traces, impact (text in chat) | `codegraph_*` MCP tools |
| Visual exploration of a subgraph | `npx @royalsolution/ontosight` |
| User says "show me the graph" | OntoSight CLI |
| Impact / blast radius demonstration | `codegraph_impact` → summary → OntoSight CLI |

Rule of thumb: gather facts with CodeGraph MCP; open OntoSight when visualization helps the human explore complexity you already identified.

### When to run OntoSight

Run (or suggest) OntoSight when the user:

- Asks to visualize, show, or explore a call graph or architecture
- Wants an interactive view after you surfaced symbols via `codegraph_search` / `codegraph_context`
- Is doing onboarding or architecture review and benefits from a graph UI
- Asks about **impact**, **blast radius**, or **what breaks** and wants to see or demonstrate scope (refactor, rename, delete)

Do **not** run OntoSight to collect agent context — that duplicates CodeGraph MCP and blocks the terminal while the browser is open.

### Impact analysis demonstration

**Triggers** — open the graph, not only text:

- "impact", "blast radius", "what breaks", "what would break", "downstream", "affected by"
- "show impact", "demonstrate impact", "visualize impact"
- User is about to refactor, rename, or delete a symbol and wants to see scope

**Workflow** (mandatory order):

1. `codegraph_search({ query: "<symbol>" })` — confirm name, file, kind
2. `codegraph_impact({ query: "<symbol>" })` — ranked blast radius (chat facts)
3. Read **`.agents/skills/ui-ux-pro-max/IMPACT-DEMO.md`** — presentation checklist (use your tool's skills path: `.agents/skills/`, `.agents/skills/`, `.agents/skills/`)
4. Optional: run ui-ux-pro-max searches from the playbook for chart/UX framing
5. Summarize in chat: seed symbol, top impacted callers, risk tier, what the graph will highlight
6. `npx @royalsolution/ontosight . --symbol <name> --path <dir> --hops 3 --max-nodes 200`

**Hop guidance:** use `--hops 3` (or `4` for deep trees) for impact demos; prefer `--path` over raising `--max-nodes` when truncated.

**UX rule:** always give a **text summary before** opening the browser (progressive disclosure); include a **ranked table** of top impacted symbols as an accessible alternative to the graph alone.

### Suggested workflows

**Symbol the user named:**

1. `codegraph_search({ query: "<name>" })` → confirm file + kind
2. Summarize in chat
3. `npx @royalsolution/ontosight . --symbol <name> --path <dir-from-search>`

**Feature area ("how does auth work?"):**

1. `codegraph_context({ task: "authentication flow", maxNodes: 20 })`
2. Summarize key symbols in chat
3. `npx @royalsolution/ontosight . --task "authentication flow" --hops 2 --max-nodes 200`

**Large repo:** prefer `--path` or `--symbol` before raising `--max-nodes`.

### Commands

```bash
npx @royalsolution/ontosight .
npx @royalsolution/ontosight . --symbol <name> --path <dir>
npx @royalsolution/ontosight . --task "auth flow" --hops 2 --max-nodes 200
npx @royalsolution/ontosight . --symbol <name> --path <dir> --hops 3 --max-nodes 200
```

Auto-creates the CodeGraph index when `.codegraph/codegraph.db` is missing (unless `ONTOSIGHT_SKIP_AUTO_INIT=1`). Ask the user before auto-init on very large repos.

### Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node 20+ | For `npx @royalsolution/ontosight` |
| Python 3.11+ | Used by `ontosight-codegraph` |
| uv (recommended) or pipx | Wrapper tries `uvx` first, then `pipx run` |
| CodeGraph index | `.codegraph/codegraph.db` in project root |
