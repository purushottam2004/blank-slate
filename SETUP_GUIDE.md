# Local Development Setup

End-to-end guide for running this template locally. Follow the steps in order.

## Prerequisites

Install these before starting:


| Tool                                                                                   | Notes                      |
| -------------------------------------------------------------------------------------- | -------------------------- |
| [uv](https://docs.astral.sh/uv/)                                                       | 0.12.19. Installs Python 3.12 from each package’s `.python-version` |
| [Docker](https://docs.docker.com/get-docker/)                                          | Daemon must be running     |
| [Node.js](https://nodejs.org/)                                                         | ≥ 22.13 (for the frontend) |
| [pnpm](https://pnpm.io/installation)                                                   | ^11.17                     |
| [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) | Latest Version             |
| JDK 17 and Android SDK platform 37.2 | Only for the Android app. See [android/SETUP_GUIDE.md](./android/SETUP_GUIDE.md) |
| Xcode 26.4+ and, for the Android emulator, Android Studio | Only for the Expo app. See [react-native/SETUP_GUIDE.md](./react-native/SETUP_GUIDE.md) |


## Setup order

1. **Database** — [supabase/SETUP_GUIDE.md](./supabase/SETUP_GUIDE.md)
2. **Backend** — [backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)
3. **Frontend** — [frontend/SETUP_GUIDE.md](./frontend/SETUP_GUIDE.md)
4. **E2E** (optional) — [e2e/README.md](./e2e/README.md)
5. **Android** (optional) — [android/SETUP_GUIDE.md](./android/SETUP_GUIDE.md)
6. **React Native** (optional) — [react-native/SETUP_GUIDE.md](./react-native/SETUP_GUIDE.md)

After Supabase is up, copy values from [`supabase/.env`](./supabase/.env) (created by `setup.py`) into the backend and frontend env files. See each package guide for the exact variable names.

Local Supabase also exposes MCP at [http://127.0.0.1:54321/mcp](http://127.0.0.1:54321/mcp). Cursor reads [`.cursor/mcp.json`](./.cursor/mcp.json); Claude Code reads [`.mcp.json`](./.mcp.json) at the repo root. See [CONTRIBUTING.md — Agent guidance](./CONTRIBUTING.md#agent-guidance).

## Verify: login → Hello

Once all three services are running:

1. Open the web app (typically [http://127.0.0.1:5173](http://127.0.0.1:5173)).
2. Sign in with a seeded user:

   | Email | Password |
   | --- | --- |
   | `seed_user@gmail.com` | `password123` |
   | `test@example.com` | `password123` |

3. On the home page, click **Hello**.
4. You should see a JSON response like:

   ```json
   {
     "message": "hello",
     "authenticated": true,
     "user": { "id": "...", "email": "seed_user@gmail.com" }
   }
   ```

If Hello fails with a CORS or network error, confirm the backend is on [http://127.0.0.1:8080](http://127.0.0.1:8080), `DEPLOYMENT_ENV=LOCAL` in `backend/.env`, and `VITE_BACKEND_URL=http://127.0.0.1:8080` in `frontend/.env`.

To run the same path in a browser automatically: [e2e/README.md](./e2e/README.md) (`cd e2e && npm test`).

## GitHub Actions

Testing and linting GitHub Actions are one workflow per area: `backend-ci.yaml` (Ruff, unit, integration), `frontend-ci.yaml` (lint, type-check, build), `supabase-ci.yaml` (Ruff, unit, integration), plus Playwright e2e, Android unit tests and a debug APK, and React Native lint, type-check, and unit tests. Supabase `db push` stays disabled until you opt in. Details are in [`.github/workflows/`](./.github/workflows/).

What each workflow does, the versions it pins (Python 3.12 via uv, Node ≥ 22.13, pnpm ^11.17), and how to turn it on are in [`.github/workflows/SETUP.md`](./.github/workflows/SETUP.md).

## Package guides

- [Supabase setup](./supabase/SETUP_GUIDE.md)
- [Backend setup](./backend/SETUP_GUIDE.md)
- [Frontend setup](./frontend/SETUP_GUIDE.md)
- [E2E tests](./e2e/README.md)
- [Android setup](./android/SETUP_GUIDE.md)
- [React Native setup](./react-native/SETUP_GUIDE.md)
- [Contributing](./CONTRIBUTING.md)
- [Agent instructions](./AGENTS.md) (Cursor + Claude Code: [CONTRIBUTING.md — Agent guidance](./CONTRIBUTING.md#agent-guidance))
- [GitHub Actions setup](./.github/workflows/SETUP.md)
