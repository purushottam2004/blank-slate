# React Native testing

Node unit tests, ESLint, and `tsc`. No simulator. Node.js ≥ 22.13 and pnpm 11.17 are enough — see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Commands

From `react-native/`:

```bash
pnpm test
pnpm lint
pnpm type-check
```

Together (quality bar):

```bash
pnpm lint && pnpm type-check && pnpm test
```

## What to add

- Host, URL, or other pure logic → a `node:test` file next to the module, run by `pnpm test`.
- Supabase or FastAPI client changes → keep the screen free of client construction, and cover any pure helper with a unit test. A test must pass with no database and no Metro server.
- Do not add a simulator or browser run as a merge requirement.
