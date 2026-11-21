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
| Python | 3.12 from each package’s `.python-version` | Installed by `uv sync` / `uv run`. No `actions/setup-python` step |
| Node.js | `22` | ≥ 22.13 |
| pnpm | `11.17.0` | ^11.17 |
| JDK | `17` | 17 (Android builds) |
| Android SDK | platform 37.2, build-tools 36.0.0 | Same, via `sdkmanager` |

## Workflows

### `backend-ci.yaml` — Backend CI

One job. Steps, in order: Ruff (`ruff check` and `ruff format --check`), `mypy .`, `pytest tests/unit/`, then integration. Integration starts local Supabase, seeds it, and runs `pytest tests/integration/` with `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`. uv is pinned to `0.12.19`. The runner needs Docker.

| | |
| --- | --- |
| Triggers | Push/PR touching `backend/**` or `supabase/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `frontend-ci.yaml` — Frontend CI

One job. Steps, in order: `pnpm lint`, `pnpm type-check`, then `pnpm build`. The build copies `frontend/.env.example` to `.env` and injects placeholder Vite env so the build can resolve `import.meta.env` without real credentials:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_BACKEND_URL`

| | |
| --- | --- |
| Triggers | Push/PR touching `frontend/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `supabase-ci.yaml` — Supabase CI

One job. Steps, in order: Ruff, `pytest python_tests/unit`, then integration. Integration starts local Supabase and runs `pytest python_tests/integration` with `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. The runner needs Docker.

| | |
| --- | --- |
| Triggers | Push/PR touching `supabase/**` on `main` or `stage`; manual dispatch |
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


### `supabase-cd.yaml` — Deploy Migrations to Production

Links the Supabase CLI to a hosted project and runs `supabase db push`. Uses the GitHub Environment named `main`.

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

### `android.yaml` — Android unit tests, lint, and debug APK

Uses the GitHub runner’s preinstalled Android SDK (`ANDROID_SDK_ROOT`, usually `/usr/local/lib/android/sdk`) and installs platform 37.2 and build-tools 36.0.0 into that SDK when they are missing. Then runs `./gradlew test lint assembleDebug` in `android/` and uploads `mobile-debug.apk`. Does not start an emulator and does not need Supabase credentials. Unit tests fake the network.

| | |
| --- | --- |
| Triggers | Push/PR touching `android/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `react-native.yaml` — React Native checks

One job. Steps, in order: `pnpm lint`, `pnpm type-check`, and `pnpm test` in `react-native/`. The unit test is a Node script. It does not start a simulator and does not need Supabase credentials.

| | |
| --- | --- |
| Triggers | Push/PR touching `react-native/**` on `main` or `stage`; manual dispatch |
| Secrets | None |


### `react-native-apk.yaml` — React Native debug APK

Generates the Android project with `expo prebuild`, runs `./gradlew assembleDebug`, and uploads `app-debug.apk`. Needs JDK 17 and the runner Android SDK (platform 37.2, build-tools 37.0.0, NDK 27.1.12297006). It does not start an emulator. Run it from the Actions tab when you want to confirm an APK builds.

| | |
| --- | --- |
| Triggers | Manual dispatch only |
| Secrets | None |

## Dependabot

[`.github/dependabot.yaml`](../dependabot.yaml) opens weekly version-update pull requests. Minor and patch updates are grouped. Major updates stay as their own pull requests.

| Ecosystem | Directories |
| --- | --- |
| GitHub Actions | `.github/workflows/` |
| uv | `backend/`, `supabase/` |
| npm / pnpm | `frontend/`, `react-native/`, `e2e/` |
| Gradle | `android/` |
| Docker | `backend/Dockerfile` |
| pre-commit | `.pre-commit-config.yaml` |
