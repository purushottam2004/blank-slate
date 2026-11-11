# GitHub Actions Setup

Predefined workflows for this template. Local stack setup is in the root [SETUP_GUIDE.md](../../SETUP_GUIDE.md).

Testing and linting workflows are enabled (files named `*.yaml`). Deploy workflows stay `*.yaml.disabled` until you opt in.

GitHub only runs files named `*.yml` or `*.yaml` under `.github/workflows/`.

## Enable a disabled workflow

```bash
# from the repo root
git mv .github/workflows/<name>.yaml.disabled .github/workflows/<name>.yaml
```

Commit and push. After that, the workflow runs on the events listed in its `on:` block, or from the Actions tab via **Run workflow** (`workflow_dispatch`).

Disable again by renaming back to `*.yaml.disabled`.

## Versions

CI is pinned to the same minimums as the root setup guide:

| Tool | CI pin | Repo requirement |
| --- | --- | --- |
| Python | `3.13` | ≥ 3.13 |
| Node.js | `22` | ≥ 22.13 |
| pnpm | `11.17.0` | ^11.17 |
| JDK | `17` | 17 (Android builds) |
| Android SDK | platform 37.2, build-tools 36.0.0 | Same, via `sdkmanager` |

## Workflows

### `frontend-lint.yaml` — Frontend Lint

Runs `pnpm lint` and `pnpm type-check` in `frontend/`.

| | |
| --- | --- |
| Triggers | Push/PR touching `frontend/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `frontend-build.yaml` — Frontend Build

Runs `pnpm build` in `frontend/`. Copies `frontend/.env.example` to `.env`, then injects placeholder Vite env so the build can resolve `import.meta.env` without real credentials:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_BACKEND_URL`

| | |
| --- | --- |
| Triggers | Push/PR touching `frontend/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `ruff.yaml` — Backend Lint

Runs `uv sync --frozen`, then `uv run ruff check .` and `uv run ruff format --check .` in `backend/`. uv is pinned to `0.12.19`, the same release as the backend image.

| | |
| --- | --- |
| Triggers | Push/PR touching `backend/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `pytest-unit.yaml` — Backend Unit Tests

Runs `uv run pytest tests/unit/ -n auto` in `backend/` so pytest-xdist uses every core on the runner.

| | |
| --- | --- |
| Triggers | Push/PR touching `backend/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `pytest-integration.yaml` — Backend Integration Tests

Starts local Supabase, reads `PUBLISHABLE_KEY` and `SECRET_KEY` from `supabase status`, then runs `pytest tests/integration/` with:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The runner needs Docker (GitHub-hosted `ubuntu-latest` already has it).

| | |
| --- | --- |
| Triggers | Push/PR touching `backend/**` or `supabase/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `e2e.yaml` — Playwright E2E

Starts local Supabase, seeds users, starts the backend, then runs Playwright from `e2e/`. Playwright builds + previews `web` (`5173`) and `web2` (`5174`). Uses:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_BACKEND_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The runner needs Docker (GitHub-hosted `ubuntu-latest` already has it). Local usage: [e2e/README.md](../../e2e/README.md).

| | |
| --- | --- |
| Triggers | Push/PR touching `e2e/**`, `frontend/**`, `backend/**`, or `supabase/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `db-push.yaml` — Deploy Migrations to Production

Links the Supabase CLI to a hosted project and runs `supabase db push --remote --yes`. Uses the GitHub Environment named `main`.

`--remote` is required. Without it the current CLI pushes to local Docker (`127.0.0.1:54322`), which is not running on a GitHub runner. `--yes` answers the apply prompt, because Actions has no terminal. It does not replay migrations already recorded, and it does not ignore a remote version that has no file in this repo.

Create that environment under **Settings → Environments → New environment** (`main`), then add repository or environment secrets:

| Secret | Where to get it |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | [Supabase access tokens](https://supabase.com/dashboard/account/tokens) |
| `PRODUCTION_PROJECT_ID` | Project Settings → General → Reference ID |
| `PRODUCTION_DB_PASSWORD` | Project Settings → Database → Database password |

| | |
| --- | --- |
| Triggers | Push to `main` touching `supabase/**`; manual dispatch |
| Secrets | The three above |

Do not enable this until the secrets and `main` environment exist, or the job will fail on an empty project link.

**First hosted project.** Create an empty Supabase project, set the three secrets, enable this workflow, and let `db push` apply `supabase/migrations/`. The version recorded on the database is the timestamp in the filename (`20260724083004_….sql`). Do not apply those files first through the SQL editor or an agent migration tool. Those tools record a different version, and the next `db push` stops with “Remote migration versions not found in local migrations directory.”

If that already happened, mark only that stray version reverted, then push again. The tables can stay. Do not `db pull`; that writes a second copy of the schema into `migrations/`.

```bash
supabase link --project-ref "$PRODUCTION_PROJECT_ID"
supabase migration repair --status reverted <version-from-the-error> --remote
supabase db push --remote --yes
```

### `android.yaml` — Android unit tests, lint, and debug APK

Uses the GitHub runner’s preinstalled Android SDK (`ANDROID_SDK_ROOT`, usually `/usr/local/lib/android/sdk`) and installs platform 37.2 and build-tools 36.0.0 into that SDK when they are missing. Then runs `./gradlew test lint assembleDebug` in `android/` and uploads `mobile-debug.apk`. Does not start an emulator and does not need Supabase credentials. Unit tests fake the network.

| | |
| --- | --- |
| Triggers | Push/PR touching `android/**` on `main` or `stage`; manual dispatch |
| Secrets | None |
