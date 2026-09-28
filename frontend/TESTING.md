# Frontend testing

The workspace has no unit-test runner. Behaviour a person can see is covered by [../e2e/TESTING.md](../e2e/TESTING.md).

## Static checks (required)

From `frontend/`:

```bash
pnpm lint
pnpm type-check
```

`type-check` runs `pnpm --recursive run type-check` across apps and packages.

Optional format:

```bash
pnpm format
pnpm format:check
```

## What to add

- Shared UI or auth → change `packages/ui` or `packages/auth`, then add or extend an e2e spec if the user can see the change.
- Generated Database types live in `packages/db`. After a Supabase migration, regenerate with `pnpm --filter @repo/db run generate` (local Supabase must be up).
- Do not copy login or session code into both `web` and `web2`.
