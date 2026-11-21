# Contributing to the React Native app

Repo-wide rules: [../CONTRIBUTING.md](../CONTRIBUTING.md). Setup: [SETUP_GUIDE.md](./SETUP_GUIDE.md). Tests: [TESTING.md](./TESTING.md).

## Before you push

From `react-native/`:

```bash
pnpm lint
pnpm type-check
pnpm test
```

`pnpm test` is a Node unit test. It does not need a simulator, Supabase, or the backend.

## Where to change code

- **Screens and URLs** → `src/app/`. A new file there is a new route. Do not put clients or helpers in this folder.
- **Supabase session** → `src/auth/`. Screens call `useAuth()`.
- **Supabase client or FastAPI** → `src/lib/`.
- **Widgets that are not screens** → `src/components/`.

Do not import `frontend/packages/ui` or `frontend/packages/auth`. Those packages use the DOM and Vite env vars. Share the Supabase project and the FastAPI contract, not the components.

Do not add an `ios/` or `android/` directory by hand. Expo generates them. The repository-root `android/` app is the Kotlin client and is a different project.

## Branches & PRs

Follow monorepo [../CONTRIBUTING.md](../CONTRIBUTING.md) (`feature/*`, `bugs/*`, `chore/*`). Do not push to `main` / `stage` unless you own releases.
