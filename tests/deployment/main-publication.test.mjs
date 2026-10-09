import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, cp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { resolveInputs, sha256Hex } from "../../scripts/validate-publication-snapshot.mjs";

const push = {
  GITHUB_EVENT_NAME: "push", GITHUB_REPOSITORY: "KiritoKing/term-style-blog",
  GITHUB_REF: "refs/heads/main", GITHUB_SHA: "a".repeat(40),
  INPUT_CONTENT_REPOSITORY: "KiritoKing/llm-obsidian", INPUT_PUBLICATION_BRANCH: "publish-snapshots",
  INPUT_CONTENT_SHA: "b".repeat(40), INPUT_MANIFEST_SHA256: "c".repeat(64),
  INPUT_SOURCE_TREE_HASH: "d".repeat(64), INPUT_DEPLOY_MODE: "production",
  INPUT_CLOUDFLARE_ACCOUNT_ID: "e".repeat(32), INPUT_CLOUDFLARE_PROJECT: "notion-astro-rev",
};
function publication(overrides = {}) {
  const base = {
    schema_version: 1, framework_sha: "1".repeat(40), content_sha: push.INPUT_CONTENT_SHA,
    manifest_sha256: push.INPUT_MANIFEST_SHA256, mode: "production",
    robots_sha256: "2".repeat(64), routes: [{ path: "/", title: "Public fixture" }],
    ...overrides,
  };
  return { ...base, build_revision: sha256Hex(`hosted-publication-v1\n${JSON.stringify(base)}`) };
}
async function resolver() { return import("../../scripts/resolve-main-publication.mjs"); }

test("main push binds exact framework SHA and follows both existing production policy gates", () => {
  for (const [enabled, review, mode] of [["false", "manual", "preview"], ["true", "manual", "preview"], ["false", "automatic", "preview"], ["true", "automatic", "production"]]) {
    const result = resolveInputs({ ...push, PUBLICATION_PRODUCTION_ENABLED: enabled, PUBLICATION_PREVIEW_REVIEW: review });
    assert.equal(result.deploy_mode, mode);
    assert.equal(result.framework_sha, push.GITHUB_SHA);
    assert.equal(result.dispatch_id, `framework-push:${push.GITHUB_SHA}`);
  }
});

test("push cannot accept PR/fork/non-main/deleted/mutable/missing input or alternate source", () => {
  for (const [key, value] of [
    ["GITHUB_EVENT_NAME", "pull_request"], ["GITHUB_EVENT_NAME", "pull_request_target"],
    ["GITHUB_REPOSITORY", "someone/term-style-blog"], ["GITHUB_REF", "refs/heads/feature"],
    ["GITHUB_EVENT_DELETED", "true"], ["GITHUB_SHA", "main"], ["INPUT_CONTENT_SHA", ""],
    ["INPUT_MANIFEST_SHA256", ""], ["INPUT_SOURCE_TREE_HASH", "bad"],
    ["INPUT_CONTENT_REPOSITORY", "someone/vault"], ["INPUT_PUBLICATION_BRANCH", "main"],
    ["INPUT_DEPLOY_MODE", "preview"],
  ]) assert.throws(() => resolveInputs({ ...push, [key]: value }), `${key}=${value}`);
});

test("resolves only canonical production reference without credentials or redirects", async () => {
  const { resolvePublishedReference } = await resolver();
  const result = await resolvePublishedReference(push, async (url, init) => {
    assert.equal(url, "https://chlorinec.top/publication.json");
    assert.equal(init.redirect, "error");
    assert.equal(init.cache, "no-store");
    assert.deepEqual(init.headers, { Accept: "application/json" });
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json(publication());
  });
  assert.deepEqual(result, {
    content_repository: push.INPUT_CONTENT_REPOSITORY, publication_branch: push.INPUT_PUBLICATION_BRANCH,
    content_sha: push.INPUT_CONTENT_SHA, manifest_sha256: push.INPUT_MANIFEST_SHA256,
  });
});

test("canonical reference failures have no fallback or credential/private checkout", async () => {
  const { resolvePublishedReference } = await resolver();
  const invalid = [
    () => new Response("missing", { status: 404 }),
    () => new Response("login", { status: 302, headers: { location: "https://other.example" } }),
    () => new Response("<html>login</html>"),
    () => Response.json({}),
    () => Response.json(publication({ mode: "preview" })),
    () => Response.json(publication({ content_sha: "main" })),
    () => Response.json(publication({ manifest_sha256: "bad" })),
    () => Response.json(publication({ routes: [] })),
    () => Response.json({ ...publication(), build_revision: "f".repeat(64) }),
    () => new Response("x".repeat(5 * 1024 * 1024 + 1), { headers: { "content-type": "application/json" } }),
    () => new Response("{}", { headers: { "content-type": "application/json", "content-length": "999999999" } }),
    () => { throw new Error("unavailable"); },
  ];
  for (const fetcher of invalid) await assert.rejects(resolvePublishedReference(push, fetcher));
  let called = false;
  for (const invalidEnv of [{ GITHUB_REF: "refs/heads/feature" }, { GITHUB_REPOSITORY: "fork/repo" }, { GITHUB_EVENT_NAME: "pull_request" }, { GITHUB_EVENT_DELETED: "true" }]) {
    await assert.rejects(resolvePublishedReference({ ...push, ...invalidEnv }, () => { called = true; return Response.json(publication()); }));
  }
  assert.equal(called, false);
});

test("pins manifest bytes before deriving tree hash and fully validates the immutable exporter snapshot", async () => {
  const { resolveSnapshotInputs } = await resolver();
  const root = await mkdtemp(path.join(os.tmpdir(), "main-publication-fixture-"));
  try {
    await cp(new URL("../fixtures/publication-exporter-v1/", import.meta.url), root, { recursive: true });
    const manifest = await readFile(path.join(root, "blog-publish-manifest.json"));
    const result = await resolveSnapshotInputs(root, sha256Hex(manifest));
    assert.equal(result.source_tree_hash, JSON.parse(manifest).source_tree_hash);
    assert.equal(result.manifest_sha256, sha256Hex(manifest));
    await assert.rejects(resolveSnapshotInputs(root, "f".repeat(64)));
    await writeFile(path.join(root, "20-writing/published/a.md"), "changed bytes");
    await assert.rejects(resolveSnapshotInputs(root, sha256Hex(manifest)));
    await rm(path.join(root, "blog-publish-manifest.json"));
    await assert.rejects(resolveSnapshotInputs(root, sha256Hex(manifest)));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("workflow runs only owned main with accepted snapshot, read-only permissions and all existing gates", async () => {
  const yaml = await readFile(new URL("../../.github/workflows/deploy-publication.yml", import.meta.url), "utf8");
  assert.match(yaml, /on:\n  push:\n    branches: \[main\]/);
  assert.doesNotMatch(yaml, /pull_request(?:_target)?:|paths(?:-ignore)?:/);
  assert.match(yaml, /repository_dispatch:\n    types: \[content_published_changed\]/);
  assert.match(yaml, /workflow_dispatch:/);
  assert.match(yaml, /permissions:\n  contents: read\n/);
  assert.doesNotMatch(yaml, /^\s+(?:contents|actions|deployments|id-token): write$/m);
  assert.match(yaml, /github\.event_name == 'push' \|\| github\.event_name == 'repository_dispatch' \|\| github\.event_name == 'workflow_dispatch'/);
  const prepare = yaml.split("  prepare:")[1].split("  build_preview:")[0];
  assert.match(prepare, /Resolve accepted production content reference[\s\S]+if: github\.event_name == 'push'/);
  assert.match(prepare, /ref: \$\{\{ steps\.published\.outputs\.content_sha \}\}/);
  assert.match(prepare, /Verify accepted immutable snapshot[\s\S]+resolve-main-publication\.mjs snapshot/);
  assert.match(prepare, /INPUT_CONTENT_SHA:.*steps\.published\.outputs\.content_sha/);
  assert.match(prepare, /INPUT_SOURCE_TREE_HASH:.*steps\.published_snapshot\.outputs\.source_tree_hash/);
  assert.match(yaml, /framework_sha[\s\S]+ref: \$\{\{ needs\.prepare\.outputs\.framework_sha \}\}/);
  const production = yaml.split("  deploy_production:")[1];
  assert.match(production, /environment: production/);
  assert.match(production, /concurrency:[\s\S]+cancel-in-progress: false/);
  assert.match(production, /production_enabled == 'true' && needs\.prepare\.outputs\.preview_review == 'automatic'/);
  const finalCheck = production.indexOf("Recheck freshness immediately before production upload");
  assert.ok(finalCheck > production.indexOf("Download preview-gated production artifact"));
  assert.ok(finalCheck < production.indexOf("Deploy production to Cloudflare Pages"));
  assert.match(production, /Recover previous production after failed acceptance/);
});

test("publication browser acceptance never requires the synthetic demo route", async () => {
  const demo = await readFile(new URL("../e2e/image-lightbox.spec.ts", import.meta.url), "utf8");
  const real = await readFile(new URL("../e2e/publication-image-lightbox.spec.ts", import.meta.url), "utf8");
  assert.match(demo, /test\.skip\(process\.env\.E2E_REAL_CORPUS === '1'/);
  assert.match(real, /test\.skip\(process\.env\.E2E_REAL_CORPUS !== '1'/);
  assert.doesNotMatch(real, /\/posts\/image-lightbox-demo|KiritoKing\/llm-obsidian|CONTENT_DIR/);
  assert.match(real, /imageArticles\(/);
  assert.match(real, /test\.skip\(!article,/);
});

test("actual workflow freshness gate rejects older branch tips and wrong checkout before upload", async () => {
  const yaml = await readFile(new URL("../../.github/workflows/deploy-publication.yml", import.meta.url), "utf8");
  const block = yaml.split("      - name: Recheck freshness immediately before production upload")[1]?.split("      - name:")[0];
  assert.ok(block, "freshness gate must be adjacent to upload");
  const shell = block.split("        run: |\n")[1].replace(/^          /gm, "");
  const root = await mkdtemp(path.join(os.tmpdir(), "main-publication-git-"));
  const git = (dir, args) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  try {
    for (const [dir, branch] of [["framework", "main"], ["content", "publish-snapshots"]]) {
      execFileSync("git", ["init", "--initial-branch", branch, path.join(root, dir)], { stdio: "ignore" });
      const cwd = path.join(root, dir);
      git(cwd, ["config", "user.name", "Fixture"]); git(cwd, ["config", "user.email", "fixture@example.invalid"]);
      git(cwd, ["commit", "--allow-empty", "-m", "base"]);
      execFileSync("git", ["clone", "--bare", cwd, `${cwd}-remote`], { stdio: "ignore" });
      git(cwd, ["remote", "add", "origin", `${cwd}-remote`]);
    }
    const env = { ...process.env, FRAMEWORK_SHA: git(path.join(root, "framework"), ["rev-parse", "HEAD"]), CONTENT_SHA: git(path.join(root, "content"), ["rev-parse", "HEAD"]), PUBLICATION_BRANCH: "publish-snapshots" };
    const run = () => execFileSync("bash", ["-euo", "pipefail", "-c", shell], { cwd: root, env, stdio: "pipe" });
    run();
    for (const dir of ["framework", "content"]) {
      const cwd = path.join(root, dir); const original = git(cwd, ["rev-parse", "HEAD"]);
      git(cwd, ["commit", "--allow-empty", "-m", "new"]);
      assert.throws(run, "different immutable checkout rejects");
      git(cwd, ["push", "origin", "HEAD"]);
      git(cwd, ["reset", "--hard", original]);
      assert.throws(run, "newer remote tip rejects older queued candidate");
      git(cwd, ["push", "--force", "origin", "HEAD"]); // synthetic local remote only
      run();
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});
