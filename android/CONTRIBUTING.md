# Contributing to the Android app

Repo-wide rules: [../CONTRIBUTING.md](../CONTRIBUTING.md). Setup: [SETUP_GUIDE.md](./SETUP_GUIDE.md). Tests: [TESTING.md](./TESTING.md).

## Before you push

From `android/`, with JDK 17 and the Android SDK installed:

```bash
./gradlew test lint
```

`test` is JVM unit tests. Do not add `src/androidTest` as a required check. Those tests need a phone or an emulator.

## Where to change code

- **Product screens** → `apps/mobile/src/main/kotlin/.../feature/<name>/`
- **Supabase or FastAPI** → `packages/data`
- **Shared widgets and theme** → `packages/designsystem`

A feature may use the packages. It may not reach into another feature. The packages do not depend on the app.

Screens draw state. They do not construct the Supabase client or attach the bearer token. That stays in `packages/data`.

## Branches & PRs

Follow monorepo [../CONTRIBUTING.md](../CONTRIBUTING.md) (`feature/*`, `bugs/*`, `chore/*`). Do not push to `main` / `stage` unless you own releases.
