# AI agent instructions

Project guidance for AI coding agents:

| Tool | Hub |
|------|-----|
| **Cursor** | [`.cursor/CURSOR.md`](.cursor/CURSOR.md) |
| **Kiro** | [`.kiro/KIRO.md`](.kiro/KIRO.md) |
| **Claude Code** | [`.claude/CLAUDE.md`](.claude/CLAUDE.md) |

- **Cursor:** `.cursor/rules/` (`.mdc`), `.cursor/commands/`, `.cursor/mcp.json`
- **Kiro:** `.kiro/steering/` (`*.md`), `.kiro/commands/`, `.kiro/settings/mcp.json`
- **Claude Code:** `.claude/rules/`, `.claude/commands/`

Keep **`.claude/`**, **`.cursor/`**, and **`.kiro/`** in sync when you change workflows or standards. After editing `.cursor/`, run `npm run sync:kiro` in the **class-ai-agent** repo to refresh `.kiro/`.
