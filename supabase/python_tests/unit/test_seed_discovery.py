"""Unit tests for seed.py discovery and entry-point resolution."""

from pathlib import Path
from types import SimpleNamespace

import seed


def test_is_seed_script_accepts_committed_and_local_names(tmp_path: Path):
    committed = tmp_path / "_001_seed_users.py"
    local = tmp_path / "_local_seed_experiments.py"
    committed.write_text("")
    local.write_text("")

    assert seed.is_seed_script(committed) is True
    assert seed.is_seed_script(local) is True


def test_is_seed_script_rejects_non_seed_names(tmp_path: Path):
    cases = [
        "001_seed_users.py",
        "__init__.py",
        "_001_data_users.py",
        "client.py",
        "seed.py",
    ]
    for name in cases:
        path = tmp_path / name
        path.write_text("")
        assert seed.is_seed_script(path) is False, name


def test_is_seed_script_rejects_directories(tmp_path: Path):
    path = tmp_path / "_001_seed_users.py"
    path.mkdir()
    assert seed.is_seed_script(path) is False


def test_discover_seed_scripts_finds_committed_users_script():
    found = seed.discover_seed_scripts()
    stems = [Path(path).stem for _module, path in found]

    assert "_001_seed_users" in stems
    assert all(stem.startswith("_") and "_seed_" in stem for stem in stems)
    assert "client" not in stems
    assert "__init__" not in stems
    assert stems == sorted(stems)


def test_resolve_entry_point_prefers_seed_suffix():
    def seed_users():
        return "users"

    def main():
        return "main"

    module = SimpleNamespace(seed_users=seed_users, main=main)
    assert seed.resolve_entry_point(module, "_001_seed_users") is seed_users


def test_resolve_entry_point_falls_back_to_main_then_seed():
    def main():
        return "main"

    def seed_fn():
        return "seed"

    assert seed.resolve_entry_point(SimpleNamespace(main=main), "_001_seed_users") is main
    assert seed.resolve_entry_point(SimpleNamespace(seed=seed_fn), "_001_seed_users") is seed_fn


def test_resolve_entry_point_returns_none_when_missing():
    assert seed.resolve_entry_point(SimpleNamespace(), "_001_seed_users") is None
