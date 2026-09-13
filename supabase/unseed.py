#!/usr/bin/env python3
"""
Wipe application tables filled by python seeds / local testing, then re-seed
with `python seed.py`.

Does not TRUNCATE auth.* or other Supabase-internal schemas. Users are removed
one-by-one through Auth Admin so GoTrue stays consistent.

Usage:
    python unseed.py
    python unseed.py --all
    python unseed.py --table-name users
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class Colors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{message.center(70)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{'=' * 70}{Colors.ENDC}\n")


def print_success(message: str):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")


def print_error(message: str):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")


def print_info(message: str):
    print(f"{Colors.OKCYAN}ℹ {message}{Colors.ENDC}")


BATCH = 500


def wipe_users(supabase) -> None:
    print_info("Wiping public.users via Auth Admin (does not truncate auth schema tables)")
    total = 0
    while True:
        rows = supabase.table("users").select("id").limit(BATCH).execute().data or []
        if not rows:
            break
        for row in rows:
            supabase.auth.admin.delete_user(row["id"])
            print_success(f"  deleted {row['id']}")
            total += 1
    print_success(f"public.users: wiped {total} user(s)")


def make_steps(supabase):
    return (("users", lambda: wipe_users(supabase)),)


TABLE_ALIASES = {
    "users": "users",
    "public.users": "users",
}


def resolve_table_name(raw: str, step_names: list[str]) -> str:
    key = raw.strip().lower()
    if key not in TABLE_ALIASES:
        print_error(f"Unknown table {raw!r}")
        print_info("Known tables:")
        for name in step_names:
            print(f"  • {name}")
        sys.exit(2)
    return TABLE_ALIASES[key]


def run_step(name: str, fn) -> None:
    print(f"\n{Colors.BOLD}{Colors.OKBLUE}▶ {name}{Colors.ENDC}")
    try:
        fn()
    except Exception as exc:
        print_error(f"{name}: {exc}")
        raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Wipe python-seed / local-testing tables so `python seed.py` can reload fresh data. "
            "Does not touch auth schema tables or SQL seeds."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "examples:\n"
            "  python unseed.py\n"
            "  python unseed.py --all\n"
            "  python unseed.py --table-name users\n"
        ),
    )
    parser.add_argument(
        "-a",
        "--all",
        action="store_true",
        help="Wipe every application table listed below (default if no --table-name).",
    )
    parser.add_argument(
        "--table-name",
        metavar="TABLE",
        help="Wipe this table completely (all rows, including local testing edits).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.all and args.table_name:
        print_error("Use either --all or --table-name, not both.")
        sys.exit(2)

    from python_seeds.client import SUPABASE_URL, get_supabase_admin_client

    print_header("Unseed")
    print_info(f"Supabase: {SUPABASE_URL}")
    print_info("Wiping application tables. auth.* is not truncated.")

    supabase = get_supabase_admin_client()
    steps = make_steps(supabase)
    by_name = {name: fn for name, fn in steps}
    names = [name for name, _ in steps]

    try:
        if args.table_name:
            key = resolve_table_name(args.table_name, names)
            run_step(key, by_name[key])
        else:
            for name, fn in steps:
                run_step(name, fn)
    except Exception as exc:
        print()
        print_error(str(exc))
        raise

    print_header("Unseed complete")
    print_success("Run python seed.py to reload fresh data")


if __name__ == "__main__":
    main()
