#!/usr/bin/env python3
"""Run a command with one explicitly selected Cloudflare fnox profile."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping, Sequence


KEYCHAIN_SERVICE = "personal-secrets-bsm"
KEYCHAIN_ACCOUNT = "cloudflare-dev"
FNOX_CONFIG_DIR_ENV = "FNOX_CONFIG_DIR"
TRANSIENT_GITHUB_OUTPUT_KEY = "CF_TRANSIENT_API_TOKEN"
EXPECTED_FNOX_VERSION = "1.39.0"
NON_SECRET_CLOUDFLARE_VARIABLES = {
    "CLOUDFLARE_ACCOUNT_ID": re.compile(r"^[a-fA-F0-9]{32}$"),
    "CLOUDFLARE_PAGES_PROJECT": re.compile(r"^[a-z0-9][a-z0-9-]{0,56}[a-z0-9]$|^[a-z0-9]$"),
}


@dataclass(frozen=True)
class Profile:
    required: tuple[str, ...]
    optional: tuple[str, ...] = ()

    @property
    def allowed(self) -> frozenset[str]:
        return frozenset((*self.required, *self.optional))


PROFILES: dict[str, Profile] = {
    "workers": Profile(
        required=("CLOUDFLARE_API_TOKEN",),
    ),
    "pages": Profile(
        required=("CLOUDFLARE_API_TOKEN",),
    ),
    "r2": Profile(
        required=("R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"),
        optional=("R2_ENDPOINT", "R2_ACCOUNT_ID"),
    ),
}

# fnox and its providers get a deliberately small environment. Proxy and CA
# settings are retained because they can be required to reach the secret store.
RESOLVER_ENV_KEYS = (
    "HOME",
    "PATH",
    "TMPDIR",
    "TMP",
    "TEMP",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
    "TERM",
    "SYSTEMROOT",
    "WINDIR",
    "COMSPEC",
    "PATHEXT",
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "NO_PROXY",
    "http_proxy",
    "https_proxy",
    "no_proxy",
    "SSL_CERT_FILE",
    "SSL_CERT_DIR",
    "REQUESTS_CA_BUNDLE",
    "CURL_CA_BUNDLE",
)


class RunnerFailure(Exception):
    def __init__(self, stage: str, exit_code: int):
        super().__init__(stage)
        self.stage = stage
        self.exit_code = exit_code if exit_code != 0 else 1


def _fail(stage: str, exit_code: int = 1) -> RunnerFailure:
    return RunnerFailure(stage, exit_code)


def _resolver_base_environment() -> dict[str, str]:
    source = os.environ
    return {
        key: source[key]
        for key in RESOLVER_ENV_KEYS
        if key in source and "\x00" not in source[key]
    }


def _get_bootstrap_credentials() -> tuple[str, str]:
    token = os.environ.get("CLOUDFLARE_BWS_ACCESS_TOKEN", "")
    project_id = os.environ.get("CLOUDFLARE_BWS_PROJECT_ID", "")
    if not token or "\x00" in token:
        raise _fail("bootstrap")
    if not project_id or re.fullmatch(r"[0-9a-fA-F-]{36}", project_id) is None:
        raise _fail("bootstrap")
    return token, project_id

def _strict_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    obj: dict[str, Any] = {}
    for key, value in pairs:
        if key in obj:
            raise ValueError("duplicate JSON key")
        obj[key] = value
    return obj


def _parse_json_document(stdout: bytes, stage: str) -> dict[str, Any]:
    try:
        decoded = stdout.decode("utf-8")
        document = json.loads(decoded, object_pairs_hook=_strict_object)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError):
        raise _fail(stage) from None
    if not isinstance(document, dict):
        raise _fail(stage)
    if type(document.get("schema")) is not int or document["schema"] != 1:
        raise _fail(stage)
    return document


def _validate_profile(document: Mapping[str, Any], profile: str, stage: str) -> None:
    if document.get("profile") != [profile]:
        raise _fail(stage)


def _validate_resolved_document(document: Mapping[str, Any], profile: str) -> dict[str, Any]:
    _validate_profile(document, profile, "protocol")
    required_fields = ("fnox_version", "scope", "set", "files", "remove", "missing", "leases")
    if any(field not in document for field in required_fields):
        raise _fail("protocol")
    if document["fnox_version"] != EXPECTED_FNOX_VERSION or document["scope"] != "exec":
        raise _fail("protocol")
    if not isinstance(document["set"], dict) or not isinstance(document["files"], dict):
        raise _fail("protocol")
    if not isinstance(document["remove"], list) or not isinstance(document["missing"], list):
        raise _fail("protocol")
    if not isinstance(document["leases"], list):
        raise _fail("protocol")
    if document["missing"]:
        raise _fail("protocol")
    if document["files"]:
        # fnox's files entries contain secret bytes intended to be written to
        # disk. This runner intentionally has no plaintext-file path.
        raise _fail("protocol")

    allowed = PROFILES[profile].allowed
    for key, value in document["set"].items():
        if not isinstance(key, str) or key not in allowed:
            raise _fail("protocol")
        if not isinstance(value, str) or "\x00" in value:
            raise _fail("protocol")
    for key in document["remove"]:
        if not isinstance(key, str) or not key or "=" in key or "\x00" in key:
            raise _fail("protocol")
    for key in PROFILES[profile].required:
        if not document["set"].get(key):
            raise _fail("protocol")
    return dict(document)


def _run_fnox(
    config_path: Path,
    profile: str,
    token: str,
    project_id: str,
    isolated_config_dir: str,
    describe: bool,
    keys: Sequence[str] = (),
) -> dict[str, Any]:
    stage = "fnox-describe" if describe else "fnox-resolve"
    fnox = shutil.which("fnox", path=os.environ.get("PATH"))
    if not fnox:
        raise _fail("fnox", 127)

    argv = [
        fnox,
        "--config",
        str(config_path),
        "--profile",
        profile,
        "--if-missing",
        "error",
        "--non-interactive",
        "--no-daemon",
        "--no-defaults",
        "env",
        "--json",
        "--for",
        "exec",
    ]
    if describe:
        argv.append("--describe")
    else:
        argv.extend(("--keys", ",".join(keys)))

    resolver_env = _resolver_base_environment()
    resolver_env[FNOX_CONFIG_DIR_ENV] = isolated_config_dir
    resolver_env["BWS_ACCESS_TOKEN"] = token
    resolver_env["BWS_PROJECT_ID"] = project_id
    try:
        result = subprocess.run(
            argv,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=resolver_env,
            check=False,
            timeout=45,
        )
    except subprocess.TimeoutExpired:
        raise _fail(stage + "-timeout", 124) from None
    except OSError:
        raise _fail(stage, 126) from None
    if result.returncode != 0:
        raise _fail(stage, result.returncode)

    document = _parse_json_document(result.stdout, "protocol")
    if "error" in document:
        raise _fail("protocol")
    _validate_profile(document, profile, "protocol")
    if describe:
        return document
    return _validate_resolved_document(document, profile)


def _selected_keys(describe_document: Mapping[str, Any], profile: str) -> tuple[str, ...]:
    _validate_profile(describe_document, profile, "protocol")
    raw_keys = describe_document.get("keys")
    if not isinstance(raw_keys, list):
        raise _fail("protocol")

    injectable: dict[str, tuple[bool, bool]] = {}
    for entry in raw_keys:
        if not isinstance(entry, dict) or not isinstance(entry.get("key"), str):
            raise _fail("protocol")
        key = entry["key"]
        flags = entry.get("injectable")
        if (
            not isinstance(flags, dict)
            or not isinstance(flags.get("exec"), bool)
            or not isinstance(entry.get("as_file"), bool)
        ):
            raise _fail("protocol")
        if key in injectable:
            raise _fail("protocol")
        injectable[key] = (flags["exec"], entry.get("as_file") is True)

    spec = PROFILES[profile]
    for key in spec.required:
        if not injectable.get(key, (False, False))[0]:
            raise _fail("profile", 1)
    selected = list(spec.required)
    for key in spec.optional:
        enabled, as_file = injectable.get(key, (False, False))
        if enabled:
            if as_file:
                raise _fail("profile", 1)
            selected.append(key)
    if any(injectable.get(key, (False, False))[1] for key in selected):
        raise _fail("profile", 1)
    return tuple(selected)


def _application_environment(document: Mapping[str, Any]) -> dict[str, str]:
    preserved_cf_vars: dict[str, str] = {}
    for name, pattern in NON_SECRET_CLOUDFLARE_VARIABLES.items():
        value = os.environ.get(name, "")
        if value:
            if pattern.fullmatch(value) is None:
                raise _fail("account" if name == "CLOUDFLARE_ACCOUNT_ID" else "target")
            preserved_cf_vars[name] = value

    env = dict(os.environ)
    for key in list(env):
        upper = key.upper()
        if (
            upper.startswith("FNOX_")
            or upper in {
                "BWS_ACCESS_TOKEN",
                "BWS_PROJECT_ID",
                "CLOUDFLARE_BWS_ACCESS_TOKEN",
                "CLOUDFLARE_BWS_PROJECT_ID",
                "CF_TRANSIENT_API_TOKEN",
                "FNOX_BWS_ACCESS_TOKEN",
            }
            or upper.startswith("CLOUDFLARE_")
            or upper.startswith("R2_")
        ):
            env.pop(key, None)

    for key in document["remove"]:
        env.pop(key, None)
    for key, value in document["set"].items():
        env[key] = value
    env.update(preserved_cf_vars)
    return env

def _parse_args(argv: Sequence[str] | None) -> tuple[argparse.Namespace, list[str]]:
    parser = argparse.ArgumentParser(
        prog="cf-secrets",
        description="Run one command with a narrowly scoped Cloudflare fnox profile.",
    )
    parser.add_argument("--profile", choices=tuple(PROFILES), required=True)
    parser.add_argument("--config", help="fnox config path (defaults to ~/.config/fnox/cloudflare.toml)")
    parser.add_argument("--check", action="store_true", help="resolve and print required-key presence only")
    parser.add_argument(
        "--export-github-output",
        action="store_true",
        help="mask and expose the API token as a step output for a GitHub Action",
    )
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    command = list(args.command)
    if command and command[0] == "--":
        command = command[1:]
    if args.check and args.export_github_output:
        parser.error("--check and --export-github-output are mutually exclusive")
    if (args.check or args.export_github_output) and command:
        parser.error("credential-only modes do not accept a command")
    if not (args.check or args.export_github_output) and not command:
        parser.error("a command is required unless a credential-only mode is used")
    return args, command

def _resolved_config_path(raw_path: str | None) -> Path:
    if raw_path:
        path = Path(raw_path).expanduser()
    else:
        path = Path.home() / ".config" / "fnox" / "cloudflare.toml"
    try:
        path = path.resolve(strict=True)
    except OSError:
        raise _fail("config", 2) from None
    if not path.is_file():
        raise _fail("config", 2)
    return path


def _resolve_environment(args: argparse.Namespace) -> tuple[dict[str, Any], Profile]:
    config_path = _resolved_config_path(args.config)
    token, project_id = _get_bootstrap_credentials()
    profile = args.profile
    try:
        with tempfile.TemporaryDirectory(prefix="cf-secrets-fnox-") as isolated_config_dir:
            description = _run_fnox(
                config_path,
                profile,
                token,
                project_id,
                isolated_config_dir,
                describe=True,
            )
            keys = _selected_keys(description, profile)
            document = _run_fnox(
                config_path,
                profile,
                token,
                project_id,
                isolated_config_dir,
                describe=False,
                keys=keys,
            )
    except RunnerFailure:
        raise
    return document, PROFILES[profile]


def _run_command(command: Sequence[str], env: Mapping[str, str]) -> int:
    argv = list(command)
    if not argv:
        raise _fail("command", 2)
    executable = argv[0]
    if os.path.sep not in executable and (os.path.altsep is None or os.path.altsep not in executable):
        resolved = shutil.which(executable, path=os.environ.get("PATH"))
        if not resolved:
            raise _fail("command", 127)
        argv[0] = resolved
    try:
        result = subprocess.run(argv, env=dict(env), check=False)
    except OSError:
        raise _fail("command", 126) from None
    if result.returncode != 0:
        raise _fail("command", result.returncode)
    return result.returncode


def _export_github_output(document: Mapping[str, Any], profile: str) -> None:
    if profile not in {"workers", "pages"} or os.environ.get("GITHUB_ACTIONS") != "true":
        raise _fail("github-output")
    github_output = os.environ.get("GITHUB_OUTPUT")
    token = document["set"].get("CLOUDFLARE_API_TOKEN")
    if not github_output or not isinstance(token, str) or not token:
        raise _fail("github-output")

    escaped = token.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
    print(f"::add-mask::{escaped}")
    delimiter = f"CF_TOKEN_{uuid.uuid4().hex}"
    try:
        with Path(github_output).open("a", encoding="utf-8") as handle:
            handle.write(f"{TRANSIENT_GITHUB_OUTPUT_KEY}<<{delimiter}\n{token}\n{delimiter}\n")
    except OSError:
        raise _fail("github-output") from None
    print(f"Staged masked Cloudflare {profile} credential as a step output.")



def main(argv: Sequence[str] | None = None) -> int:
    args, command = _parse_args(argv)
    try:
        document, spec = _resolve_environment(args)
        if args.check:
            missing = []
            for key in spec.required:
                present = bool(document["set"].get(key))
                print(f"{key}: {'present' if present else 'missing'}")
                if not present:
                    missing.append(key)
            return 1 if missing else 0

        if args.export_github_output:
            _export_github_output(document, args.profile)
            return 0

        app_env = _application_environment(document)
        return _run_command(command, app_env)
    except RunnerFailure as exc:
        print(f"{exc.stage} failed (exit {exc.exit_code})", file=sys.stderr)
        return exc.exit_code


if __name__ == "__main__":
    raise SystemExit(main())
