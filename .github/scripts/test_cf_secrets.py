import contextlib
import io
import json
import os
import tempfile
import unittest
from unittest import mock

import cf_secrets


def success_document(values, profile="workers"):
    return {
        "schema": 1,
        "fnox_version": "1.39.0",
        "scope": "exec",
        "profile": [profile],
        "set": values,
        "files": {},
        "remove": [
            "BWS_ACCESS_TOKEN",
            "BWS_PROJECT_ID",
            "CLOUDFLARE_BWS_ACCESS_TOKEN",
            "CLOUDFLARE_BWS_PROJECT_ID",
            "FNOX_CONFIG_DIR",
            "OUT_OF_SCOPE_SECRET",
        ],
        "missing": [],
        "leases": [],
    }


class RunnerTests(unittest.TestCase):
    def test_bootstrap_uses_cloudflare_specific_names(self):
        with mock.patch.dict(
            os.environ,
            {
                "BWS_ACCESS_TOKEN": "business-bootstrap",
                "BWS_PROJECT_ID": "00000000-0000-4000-8000-000000000001",
                "CLOUDFLARE_BWS_ACCESS_TOKEN": "cf-bootstrap",
                "CLOUDFLARE_BWS_PROJECT_ID": "00000000-0000-4000-8000-000000000002",
            },
            clear=True,
        ):
            self.assertEqual(
                cf_secrets._get_bootstrap_credentials(),
                ("cf-bootstrap", "00000000-0000-4000-8000-000000000002"),
            )

    def test_business_bws_credentials_are_not_a_fallback(self):
        with mock.patch.dict(
            os.environ,
            {
                "BWS_ACCESS_TOKEN": "business-bootstrap",
                "BWS_PROJECT_ID": "00000000-0000-4000-8000-000000000001",
            },
            clear=True,
        ):
            with self.assertRaises(cf_secrets.RunnerFailure):
                cf_secrets._get_bootstrap_credentials()

    def test_child_gets_resolved_token_and_nonsecret_account_id_only(self):
        account_id = "0123456789abcdef0123456789abcdef"
        document = success_document({"CLOUDFLARE_API_TOKEN": "resolved-test-token"})
        with mock.patch.dict(
            os.environ,
            {
                "CLOUDFLARE_BWS_ACCESS_TOKEN": "cf-bootstrap",
                "CLOUDFLARE_BWS_PROJECT_ID": "00000000-0000-4000-8000-000000000002",
                "BWS_ACCESS_TOKEN": "business-bootstrap",
                "BWS_PROJECT_ID": "00000000-0000-4000-8000-000000000001",
                "FNOX_CONFIG_DIR": "/old/config",
                "CLOUDFLARE_API_TOKEN": "old-token",
                "CLOUDFLARE_ACCOUNT_ID": account_id,
                "CLOUDFLARE_PAGES_PROJECT": "notion-astro-rev",
                "R2_ACCESS_KEY_ID": "old-r2-key",
                "R2_SECRET_ACCESS_KEY": "old-r2-secret",
                "CF_TRANSIENT_API_TOKEN": "stale-transient-token",
                "SAFE_SETTING": "keep",
            },
            clear=True,
        ):
            child_env = cf_secrets._application_environment(document)

        self.assertEqual(child_env["CLOUDFLARE_API_TOKEN"], "resolved-test-token")
        self.assertEqual(child_env["CLOUDFLARE_ACCOUNT_ID"], account_id)
        self.assertEqual(child_env["CLOUDFLARE_PAGES_PROJECT"], "notion-astro-rev")
        self.assertEqual(child_env["SAFE_SETTING"], "keep")
        for name in (
            "CLOUDFLARE_BWS_ACCESS_TOKEN",
            "CLOUDFLARE_BWS_PROJECT_ID",
            "BWS_ACCESS_TOKEN",
            "BWS_PROJECT_ID",
            "FNOX_CONFIG_DIR",
            "R2_ACCESS_KEY_ID",
            "R2_SECRET_ACCESS_KEY",
            "CF_TRANSIENT_API_TOKEN",
            "OUT_OF_SCOPE_SECRET",
        ):
            self.assertNotIn(name, child_env)

    def test_invalid_account_id_fails_closed(self):
        with mock.patch.dict(os.environ, {"CLOUDFLARE_ACCOUNT_ID": "not-an-account"}, clear=True):
            with self.assertRaises(cf_secrets.RunnerFailure) as caught:
                cf_secrets._application_environment(success_document({"CLOUDFLARE_API_TOKEN": "fake"}))
        self.assertEqual(caught.exception.stage, "account")

    def test_invalid_pages_project_fails_closed(self):
        with mock.patch.dict(os.environ, {"CLOUDFLARE_PAGES_PROJECT": "../other"}, clear=True):
            with self.assertRaises(cf_secrets.RunnerFailure) as caught:
                cf_secrets._application_environment(success_document({"CLOUDFLARE_API_TOKEN": "fake"}))
        self.assertEqual(caught.exception.stage, "target")

    def test_export_masks_and_stages_only_the_action_step_output(self):
        token = "fake-%-token"
        document = success_document({"CLOUDFLARE_API_TOKEN": token})
        with tempfile.NamedTemporaryFile() as handle, mock.patch.dict(
            os.environ,
            {"GITHUB_ACTIONS": "true", "GITHUB_OUTPUT": handle.name},
            clear=True,
        ):
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                cf_secrets._export_github_output(document, "pages")
            handle.seek(0)
            staged = handle.read().decode()

        self.assertIn("::add-mask::fake-%25-token", output.getvalue())
        self.assertIn("Staged masked Cloudflare pages credential as a step output", output.getvalue())
        self.assertIn("CF_TRANSIENT_API_TOKEN<<CF_TOKEN_", staged)
        self.assertIn(token, staged)
        self.assertNotIn("CLOUDFLARE_BWS_ACCESS_TOKEN", staged)

    def test_export_is_restricted_to_cloudflare_deploy_profiles(self):
        with mock.patch.dict(os.environ, {"GITHUB_ACTIONS": "true", "GITHUB_OUTPUT": "/tmp/fake"}, clear=True):
            with self.assertRaises(cf_secrets.RunnerFailure):
                cf_secrets._export_github_output(
                    success_document({"CLOUDFLARE_API_TOKEN": "fake"}, profile="gateway"),
                    "gateway",
                )

    def test_resolver_error_does_not_print_raw_output(self):
        raw_secret = "DO_NOT_ECHO_FAKE_SECRET"
        with mock.patch.object(cf_secrets.shutil, "which", return_value="/fake/fnox"), mock.patch.object(
            cf_secrets.subprocess,
            "run",
            return_value=mock.Mock(returncode=7, stdout=raw_secret.encode(), stderr=raw_secret.encode()),
        ), mock.patch.object(
            cf_secrets,
            "_resolved_config_path",
            return_value=__import__("pathlib").Path("/fake/config.toml"),
        ), mock.patch.object(
            cf_secrets,
            "_get_bootstrap_credentials",
            return_value=("fake-bootstrap-token", "00000000-0000-4000-8000-000000000002"),
        ), mock.patch.dict(
            os.environ, {"PATH": "/bin"}, clear=True
        ):
            out = io.StringIO()
            err = io.StringIO()
            with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
                result = cf_secrets.main(
                    ["--profile", "workers", "--config", "/fake/config.toml", "--check"]
                )

        self.assertEqual(result, 7)
        self.assertEqual(out.getvalue(), "")
        self.assertIn("fnox-describe failed (exit 7)", err.getvalue())
        self.assertNotIn(raw_secret, out.getvalue() + err.getvalue())

    def test_protocol_mismatch_fails_closed(self):
        payload = {
            "schema": 2,
            "profile": ["workers"],
            "scope": "exec",
            "set": {"CLOUDFLARE_API_TOKEN": "fake"},
        }
        with self.assertRaises(cf_secrets.RunnerFailure) as caught:
            cf_secrets._parse_json_document(json.dumps(payload).encode(), "protocol")
        self.assertEqual(caught.exception.stage, "protocol")

    def test_fnox_version_mismatch_fails_closed(self):
        document = success_document({"CLOUDFLARE_API_TOKEN": "fake"}, profile="pages")
        document["fnox_version"] = "1.38.0"
        with self.assertRaises(cf_secrets.RunnerFailure) as caught:
            cf_secrets._validate_resolved_document(document, "pages")
        self.assertEqual(caught.exception.stage, "protocol")


if __name__ == "__main__":
    unittest.main()
