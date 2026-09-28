#!/usr/bin/env python3
"""Regenerate Pydantic models from the local Supabase public schema.

Requires a running local Supabase (or DATABASE_URL). From backend/:

    uv run python scripts/generate_schema.py

The CLI writes into generated/fastapi/schema_public_latest.py (its default
filename for the public schema — this is THIS template's tables, not a product
dump). Commit the result after a migration.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "generated"


def main() -> int:
    """Invoke sb-pydantic against the local public schema."""
    OUT_DIR.mkdir(exist_ok=True)
    exe = shutil.which("sb-pydantic") or shutil.which("supabase-pydantic")
    if exe is None:
        try:
            subprocess.run(
                [sys.executable, "-m", "supabase_pydantic", "--help"],
                check=True,
                capture_output=True,
            )
            cmd = [sys.executable, "-m", "supabase_pydantic"]
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(
                "supabase-pydantic is not installed. From backend/: uv sync",
                file=sys.stderr,
            )
            return 1
    else:
        cmd = [exe]

    args = [
        *cmd,
        "gen",
        "--type",
        "pydantic",
        "--framework",
        "fastapi",
        "--dir",
        str(OUT_DIR),
        "--schema",
        "public",
        "--local",
    ]
    print("Running:", " ".join(args))
    result = subprocess.run(args, cwd=ROOT, check=False)
    if result.returncode != 0:
        print(
            "Generation failed. Is local Supabase running? "
            "You can also pass --db-url if your CLI version supports it.",
            file=sys.stderr,
        )
        return result.returncode
    print(f"Wrote models under {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
