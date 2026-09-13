@../AGENTS.md

## Claude Code

- Project skills live under `.claude/skills/` (each skill is a folder with `SKILL.md`). Invoke `/create-video-for-workflow` when asked to record a workflow video.
- Project MCP servers live in [`.mcp.json`](../.mcp.json) at the **repo root** (Claude Code does not read `.cursor/mcp.json`). URL servers need `"type": "http"`. Approve `supabase-local` in the first interactive session after local Supabase is up (`http://127.0.0.1:54321/mcp`).
- A remote Supabase MCP belongs in your user or local MCP config, not in the committed `.mcp.json`. Example URL: `https://mcp.supabase.com/mcp?project_ref=<your-remote-project-ref>&read_only=true`.
