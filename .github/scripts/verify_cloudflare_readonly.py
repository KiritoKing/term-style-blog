#!/usr/bin/env python3
"""Read-only Cloudflare token and target metadata check for workflow_dispatch."""

from __future__ import annotations

import json
import os
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


API_BASE = "https://api.cloudflare.com/client/v4"
WORKER_TARGETS = ("dagezhang", "dagezhang-ai")


def _get(path: str) -> dict[str, object] | list[object]:
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    if not token:
        raise RuntimeError("resolved Cloudflare credential is missing")
    if re.fullmatch(r"[a-fA-F0-9]{32}", account_id) is None:
        raise RuntimeError("Cloudflare account variable is invalid")

    request = Request(
        f"{API_BASE}{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        method="GET",
    )
    try:
        with urlopen(request, timeout=20) as response:
            status = response.status
            payload = json.load(response)
    except HTTPError as error:
        raise RuntimeError(f"Cloudflare read failed (HTTP {error.code})") from None
    except (URLError, TimeoutError, json.JSONDecodeError):
        raise RuntimeError("Cloudflare read failed") from None
    if status < 200 or status >= 300 or not isinstance(payload, dict) or payload.get("success") is not True:
        raise RuntimeError(f"Cloudflare read failed (HTTP {status})")
    result = payload.get("result")
    if not isinstance(result, (dict, list)):
        raise RuntimeError("Cloudflare returned invalid metadata")
    return result


def _verify_token() -> None:
    account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    result = _get(f"/accounts/{account_id}/tokens/verify")
    if not isinstance(result, dict) or result.get("status") != "active":
        raise RuntimeError("Cloudflare token is not active")


def _verify_workers() -> None:
    account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    for name in WORKER_TARGETS:
        result = _get(f"/accounts/{account_id}/workers/scripts/{quote(name, safe='')}/settings")
        if not isinstance(result, dict):
            raise RuntimeError("Cloudflare Worker metadata is invalid")
    print("Cloudflare token is active; both configured Worker metadata reads succeeded.")


def _verify_pages() -> None:
    account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    project = os.environ.get("CLOUDFLARE_PAGES_PROJECT", "notion-astro-rev")
    if not project or len(project) > 58:
        raise RuntimeError("Cloudflare Pages project variable is invalid")
    result = _get(f"/accounts/{account_id}/pages/projects/{quote(project, safe='')}")
    if not isinstance(result, dict) or result.get("name") != project:
        raise RuntimeError("Cloudflare Pages project metadata did not match the requested target")
    print("Cloudflare token is active; configured Pages project metadata read succeeded.")


def main(argv: list[str]) -> int:
    if len(argv) != 2 or argv[1] not in {"workers", "pages"}:
        print("Usage: verify_cloudflare_readonly.py workers|pages", file=sys.stderr)
        return 2
    try:
        _verify_token()
        if argv[1] == "workers":
            _verify_workers()
        else:
            _verify_pages()
        return 0
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
