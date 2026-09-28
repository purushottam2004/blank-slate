# Testing

How tests are split in this template, what each layer needs, and what to add when you change behaviour.

Package inventories:

| Folder | What it covers |
| --- | --- |
| [backend/TESTING.md](./backend/TESTING.md) | Pytest unit (and integration when the API hits Supabase) |
| [frontend/TESTING.md](./frontend/TESTING.md) | Lint and type-check; browser behaviour lives in e2e |
| [supabase/TESTING.md](./supabase/TESTING.md) | Seed/unseed unit tests and optional local integration smoke |
| [e2e/TESTING.md](./e2e/TESTING.md) | Playwright (`web` + `web2`) |
| [android/TESTING.md](./android/TESTING.md) | JVM unit tests and lint |

How to run a suite: each package [CONTRIBUTING](./CONTRIBUTING.md) and [SETUP_GUIDE.md](./SETUP_GUIDE.md). Python packages use `uv run` from that directory, never raw `python`.

## Layers

### Backend unit tests

Python only. They mock Supabase and other I/O. They do not need a database, a running API, or a frontend.

```bash
cd backend
uv run pytest tests/unit
```

### Backend integration tests

FastAPI against local Supabase and the Python seeds. Skip if the database is down.

```bash
cd backend
uv run pytest tests/integration
```

### Frontend static checks

There is no app test runner. Visible behaviour is covered by [e2e/](./e2e/TESTING.md).

```bash
cd frontend
pnpm lint
pnpm type-check
```

### Supabase Python tests

Unit tests mock discovery and wipe helpers. Integration tests need local Supabase and skip if it is down.

```bash
cd supabase
uv run pytest python_tests/unit
uv run pytest python_tests/integration
```

### E2E tests

Playwright. You start **Supabase** and the **backend** yourself. Playwright builds and launches the frontends (or reuses ones already on the ports).

```bash
cd e2e
npm test
```

Spec list: [e2e/TESTS.md](./e2e/TESTS.md).

### Android

JVM unit tests. No emulator.

```bash
cd android
./gradlew test lint
```

## Test creation guidelines

- **Write a backend unit test for every backend component you add.** Routes, helpers, and settings belong in `backend/tests/unit/`. Stub configuration and external clients. A unit test must pass with no database and no frontend.
- **Write an integration test when the code must hit Supabase or a real HTTP route.** Put it in `backend/tests/integration/`. Keep seed IDs aligned with `supabase/python_seeds/` and `e2e/tests/helpers/auth.ts`.
- **Write an e2e test for every user-experienceable action** that a person can see or click in `web` / `web2`. Add a Playwright spec under `e2e/tests/`.
- **Write a supabase unit test** when you add a seed script, unseed step, or discovery rule. Integration seed smoke is required when the seed actually talks to Storage or Auth.
- Do not read live `SUPABASE_SECRET_KEY` values in unit tests; patch them when the code checks that they are set.
