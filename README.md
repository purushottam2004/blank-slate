# Full Stack Web Template

This repo is a template with:

- **Backend** — FastAPI (Python)
- **Frontend** — React + TypeScript (Vite, pnpm workspace)
- **Database** — Supabase (managed Postgres + Auth)
- **E2E** — Playwright (`web` + `web2`)

## Docs

| Doc | Purpose |
| --- | --- |
| [AGENTS.md](./AGENTS.md) | Instructions for AI agents working in this repo |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Get a local stack running (DB → API → apps → e2e) |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Branches, PRs, and quality bar |

Package-level docs:

| Package | README | Setup | Contributing |
| --- | --- | --- | --- |
| [backend/](./backend/) | [README](./backend/README.md) | [SETUP](./backend/SETUP_GUIDE.md) | [CONTRIBUTING](./backend/CONTRIBUTING.md) |
| [frontend/](./frontend/) | [README](./frontend/README.md) | [SETUP](./frontend/SETUP_GUIDE.md) | [CONTRIBUTING](./frontend/CONTRIBUTING.md) |
| [supabase/](./supabase/) | — | [SETUP](./supabase/SETUP_GUIDE.md) | [CONTRIBUTING](./supabase/CONTRIBUTING.md) |
| [e2e/](./e2e/) | [README](./e2e/README.md) | — | — |

## Quick start

1. Follow **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** (starts with `supabase`, then backend, then frontend).
2. Read **[CONTRIBUTING.md](./CONTRIBUTING.md)** before opening a PR.
3. Use the package README for day-to-day commands in that area.
