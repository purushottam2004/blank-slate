# Supabase testing

Python tests live under `python_tests/` so they stay distinct from SQL. Run with `uv run` from `supabase/`.

## Suites

| Suite | Needs | Command |
| --- | --- | --- |
| Unit | Nothing except the venv | `uv run pytest python_tests/unit` |
| Integration | Local Supabase | `uv run pytest python_tests/integration` (skips if down) |

After seed changes, also smoke:

```bash
uv run python seed.py
```

Ruff (same quality bar as backend when you touch Python here):

```bash
uv run ruff check .
uv run ruff format --check .
```

## What to add

- New `python_seeds/_…_seed_….py` → discovery still works if the filename starts with `_` and contains `_seed_`. Add a unit test for new constants or wipe helpers.
- New unseed step → extend `unseed.make_steps` and `python_tests/unit/test_unseed.py`.
- Storage objects → unseed must remove them (see `wipe_seed_assets`).
- After a migration, regenerate frontend types (`frontend/packages/db`) and backend models (`backend/scripts/generate_schema.py`).
