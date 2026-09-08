import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";

import {
  resolveInputs,
  sha256Hex,
  validateSiteMode,
  validateSnapshot,
} from "../scripts/validate-publication-snapshot.mjs";

const TEST_TEMP_ROOT = path.resolve(".test-tmp");
after(() => rm(TEST_TEMP_ROOT, { recursive: true, force: true }));

const article = ({
  body = "# Hello\n",
  extraFrontmatter = "",
  slug = "Hello",
  status = "publish",
  title = "Hello world",
} = {}) => `---
type: writing_piece
title: ${title}
slug: ${slug}
status: ${status}
publish:
  target: blog
${extraFrontmatter}---
${body}`;

async function createSnapshot(files = { "hello.md": article() }) {
  await mkdir(TEST_TEMP_ROOT, { recursive: true });
  const root = await mkdtemp(path.join(TEST_TEMP_ROOT, "publication-validator-"));
  const contentRoot = path.join(root, "20-writing", "published");
  await mkdir(contentRoot, { recursive: true });
  const entries = [];
  for (const relativePath of Object.keys(files).sort()) {
    const source = files[relativePath];
    const absolutePath = path.join(contentRoot, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, source);
    const title = source.match(/^title:\s*(.+)$/m)?.[1];
    const slug = source.match(/^slug:\s*(.+)$/m)?.[1];
    const status = source.match(/^status:\s*(.+)$/m)?.[1];
    const bytes = Buffer.from(source);
    entries.push({
      path: relativePath,
      bytes: bytes.byteLength,
      sha256: sha256Hex(bytes),
      slug,
      status,
      title,
    });
  }
  const sourceTreeHash = sha256Hex(JSON.stringify(entries));
  const manifest = {
    schema_version: 1,
    publication_branch: "publish-snapshots",
    source: {
      directory: "20-writing/published",
      target: "blog",
      statuses: ["publish", "published"],
    },
    source_tree_hash: sourceTreeHash,
    previous_manifest_hash: null,
    files: entries,
    changes: { added: entries.map((entry) => entry.path), updated: [], deleted: [] },
  };
  const manifestBytes = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(path.join(root, "blog-publish-manifest.json"), manifestBytes);
  return {
    root,
    contentRoot,
    manifest,
    manifestHash: sha256Hex(manifestBytes),
    sourceTreeHash,
  };
}

async function expectSnapshotFailure(snapshot, code) {
  await assert.rejects(
    validateSnapshot({
      root: snapshot.root,
      expectedManifestSha256: snapshot.manifestHash,
      expectedTreeHash: snapshot.sourceTreeHash,
    }),
    (error) => error?.code === code,
  );
}

test("accepts an exact publish/published snapshot", async () => {
  const snapshot = await createSnapshot({
    "first.md": article(),
    "nested/second.md": article({ slug: "历史文章", status: "published", title: "历史" }),
  });
  try {
    const result = await validateSnapshot({
      root: snapshot.root,
      expectedManifestSha256: snapshot.manifestHash,
      expectedTreeHash: snapshot.sourceTreeHash,
    });
    assert.equal(result.fileCount, 2);
    assert.equal(result.publishCount, 1);
    assert.equal(result.publishedCount, 1);
  } finally {
    await rm(snapshot.root, { recursive: true, force: true });
  }
});

test("rejects tampered, extra, missing, and empty file sets", async (t) => {
  await t.test("tampered bytes", async () => {
    const snapshot = await createSnapshot();
    try {
      await writeFile(path.join(snapshot.contentRoot, "hello.md"), `${article()}tampered\n`);
      await expectSnapshotFailure(snapshot, "FILE_HASH_MISMATCH");
    } finally {
      await rm(snapshot.root, { recursive: true, force: true });
    }
  });

  await t.test("extra file", async () => {
    const snapshot = await createSnapshot();
    try {
      await writeFile(path.join(snapshot.contentRoot, "extra.md"), article({ slug: "extra" }));
      await expectSnapshotFailure(snapshot, "FILE_SET_MISMATCH");
    } finally {
      await rm(snapshot.root, { recursive: true, force: true });
    }
  });

  await t.test("missing file", async () => {
    const snapshot = await createSnapshot();
    try {
      await rm(path.join(snapshot.contentRoot, "hello.md"));
      await expectSnapshotFailure(snapshot, "EMPTY_SNAPSHOT");
    } finally {
      await rm(snapshot.root, { recursive: true, force: true });
    }
  });

  await t.test("empty manifest", async () => {
    const snapshot = await createSnapshot();
    try {
      snapshot.manifest.files = [];
      snapshot.manifest.source_tree_hash = sha256Hex("[]");
      snapshot.manifest.changes.added = [];
      const bytes = `${JSON.stringify(snapshot.manifest, null, 2)}\n`;
      await writeFile(path.join(snapshot.root, "blog-publish-manifest.json"), bytes);
      await rm(path.join(snapshot.contentRoot, "hello.md"));
      snapshot.manifestHash = sha256Hex(bytes);
      snapshot.sourceTreeHash = snapshot.manifest.source_tree_hash;
      await expectSnapshotFailure(snapshot, "EMPTY_SNAPSHOT");
    } finally {
      await rm(snapshot.root, { recursive: true, force: true });
    }
  });
});

test("rejects draft, secret metadata, local media, and manifest tampering", async (t) => {
  for (const [name, source, code] of [
    ["draft", article({ status: "draft" }), "UNAPPROVED_STATUS"],
    ["secret", article({ extraFrontmatter: "api_key: forbidden\n" }), "SECRET_METADATA"],
    ["local media", article({ body: "![private](../private.png)\n" }), "LOCAL_ASSET"],
    ["Obsidian media", article({ body: "![[secret.png]]\n" }), "LOCAL_ASSET"],
  ]) {
    await t.test(name, async () => {
      const snapshot = await createSnapshot({ "hello.md": source });
      try {
        await expectSnapshotFailure(snapshot, code);
      } finally {
        await rm(snapshot.root, { recursive: true, force: true });
      }
    });
  }

  await t.test("manifest bytes", async () => {
    const snapshot = await createSnapshot();
    try {
      const manifestPath = path.join(snapshot.root, "blog-publish-manifest.json");
      const original = await readFile(manifestPath, "utf8");
      await writeFile(manifestPath, original.replace("Hello world", "Changed title"));
      await expectSnapshotFailure(snapshot, "MANIFEST_HASH_MISMATCH");
    } finally {
      await rm(snapshot.root, { recursive: true, force: true });
    }
  });
});

const dispatchEnvironment = {
  GITHUB_EVENT_NAME: "repository_dispatch",
  GITHUB_EVENT_ACTION: "content_published_changed",
  GITHUB_REPOSITORY: "KiritoKing/term-style-blog",
  GITHUB_REF: "refs/heads/main",
  GITHUB_SHA: "a".repeat(40),
  INPUT_CONTENT_REPOSITORY: "KiritoKing/llm-obsidian",
  INPUT_CONTENT_SHA: "b".repeat(40),
  INPUT_MANIFEST_SHA256: "c".repeat(64),
  INPUT_SOURCE_TREE_HASH: "d".repeat(64),
  INPUT_PUBLICATION_BRANCH: "publish-snapshots",
  INPUT_DISPATCH_ID: `blog-publish:${"b".repeat(40)}`,
  INPUT_DEPLOY_MODE: "production",
  INPUT_CLOUDFLARE_ACCOUNT_ID: "e".repeat(32),
  INPUT_CLOUDFLARE_PROJECT: "notion-astro-rev",
};

test("defaults a fixed dispatch to a manual preview", () => {
  const dispatch = resolveInputs(dispatchEnvironment);
  assert.equal(dispatch.deploy_mode, "preview");
  assert.equal(dispatch.production_enabled, "false");
  assert.equal(dispatch.preview_review, "manual");
  assert.equal(dispatch.framework_sha, "a".repeat(40));
  assert.deepEqual(Object.keys(dispatch).sort(), [
    "cloudflare_account_id",
    "cloudflare_project",
    "content_repository",
    "content_sha",
    "deploy_mode",
    "dispatch_id",
    "framework_sha",
    "manifest_sha256",
    "preview_review",
    "production_enabled",
    "publication_branch",
    "source_tree_hash",
  ]);

  const manual = resolveInputs({
    ...dispatchEnvironment,
    GITHUB_EVENT_NAME: "workflow_dispatch",
    GITHUB_EVENT_ACTION: "",
    GITHUB_REF: "refs/heads/codex/preview",
    INPUT_DEPLOY_MODE: "preview",
    INPUT_DISPATCH_ID: "",
  });
  assert.equal(manual.deploy_mode, "preview");
  assert.match(manual.dispatch_id, /^manual:/);
});

test("allows automatic production only as an explicit opt-in", () => {
  const dispatch = resolveInputs({
    ...dispatchEnvironment,
    PUBLICATION_PRODUCTION_ENABLED: "true",
    PUBLICATION_PREVIEW_REVIEW: "automatic",
  });
  assert.equal(dispatch.deploy_mode, "production");
  assert.equal(dispatch.production_enabled, "true");
  assert.equal(dispatch.preview_review, "automatic");
});

test("keeps repository dispatch in preview unless both production gates are enabled", () => {
  assert.equal(
    resolveInputs({
      ...dispatchEnvironment,
      PUBLICATION_PRODUCTION_ENABLED: "true",
      PUBLICATION_PREVIEW_REVIEW: "manual",
    }).deploy_mode,
    "preview",
  );
  assert.equal(
    resolveInputs({
      ...dispatchEnvironment,
      PUBLICATION_PRODUCTION_ENABLED: "false",
      PUBLICATION_PREVIEW_REVIEW: "automatic",
    }).deploy_mode,
    "preview",
  );
});

test("rejects invalid publication policy values", () => {
  assert.throws(
    () => resolveInputs({ ...dispatchEnvironment, PUBLICATION_PRODUCTION_ENABLED: "yes" }),
    (error) => error?.code === "INVALID_PUBLICATION_POLICY",
  );
  assert.throws(
    () => resolveInputs({ ...dispatchEnvironment, PUBLICATION_PREVIEW_REVIEW: "human" }),
    (error) => error?.code === "INVALID_PUBLICATION_POLICY",
  );
});

test("rejects production retry until automatic production is enabled", () => {
  const retry = {
    ...dispatchEnvironment,
    GITHUB_EVENT_NAME: "workflow_dispatch",
    GITHUB_EVENT_ACTION: "",
    INPUT_DEPLOY_MODE: "production-retry",
    INPUT_DISPATCH_ID: "",
  };
  assert.throws(
    () => resolveInputs(retry),
    (error) => error?.code === "PRODUCTION_DISABLED",
  );
  assert.throws(
    () => resolveInputs({ ...retry, PUBLICATION_PRODUCTION_ENABLED: "true" }),
    (error) => error?.code === "AUTOMATIC_REVIEW_REQUIRED",
  );
  assert.equal(
    resolveInputs({
      ...retry,
      PUBLICATION_PRODUCTION_ENABLED: "true",
      PUBLICATION_PREVIEW_REVIEW: "automatic",
    }).deploy_mode,
    "production",
  );
});

test("rejects unsupported or mutable deployment inputs", () => {
  for (const [field, value] of [
    ["INPUT_CONTENT_REPOSITORY", "someone/private-vault"],
    ["INPUT_PUBLICATION_BRANCH", "main"],
    ["INPUT_CONTENT_SHA", "publish-snapshots"],
    ["INPUT_MANIFEST_SHA256", "bad"],
    ["INPUT_SOURCE_TREE_HASH", "bad"],
    ["INPUT_DISPATCH_ID", "wrong"],
    ["GITHUB_REPOSITORY", "someone/copied-workflow"],
    ["GITHUB_EVENT_ACTION", "wrong-event"],
  ]) {
    assert.throws(() => resolveInputs({ ...dispatchEnvironment, [field]: value }));
  }
});

async function createBuiltSite(mode) {
  await mkdir(TEST_TEMP_ROOT, { recursive: true });
  const root = await mkdtemp(path.join(TEST_TEMP_ROOT, "built-site-"));
  const robots = mode === "preview"
    ? "User-agent: *\nDisallow: /\n"
    : "User-agent: *\nAllow: /\nSitemap: https://chlorinec.top/sitemap.xml\n";
  const metadata = mode === "preview" ? "noindex, nofollow" : "index, follow";
  await writeFile(
    path.join(root, "index.html"),
    `<!doctype html><html><head><meta name="robots" content="${metadata}"></head></html>`,
  );
  await writeFile(path.join(root, "robots.txt"), robots);
  return root;
}

test("distinguishes preview and production artifacts", async () => {
  const preview = await createBuiltSite("preview");
  const production = await createBuiltSite("production");
  try {
    assert.equal((await validateSiteMode({ root: preview, mode: "preview" })).mode, "preview");
    assert.equal((await validateSiteMode({ root: production, mode: "production" })).mode, "production");
    await assert.rejects(
      validateSiteMode({ root: preview, mode: "production" }),
      (error) => error?.code === "SITE_MODE_MISMATCH",
    );
    await assert.rejects(
      validateSiteMode({ root: production, mode: "preview" }),
      (error) => error?.code === "SITE_MODE_MISMATCH",
    );
  } finally {
    await rm(preview, { recursive: true, force: true });
    await rm(production, { recursive: true, force: true });
  }
});

test("workflow defaults to manual preview and preserves gated automatic production", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/deploy-publication.yml", import.meta.url),
    "utf8",
  );
  const uses = [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map((match) => match[1]);
  assert.ok(uses.length >= 8);
  for (const action of uses) assert.match(action, /^[\w.-]+\/[\w.-]+@[a-f0-9]{40}$/);
  assert.match(workflow, /repository_dispatch:\n\s+types: \[content_published_changed\]/);
  assert.match(workflow, /deploy_production:[\s\S]+needs: \[prepare, build_preview\]/);
  assert.match(workflow, /concurrency:[\s\S]+cancel-in-progress: false/);
  assert.match(workflow, /Reject stale framework or content candidates/);
  assert.match(workflow, /PUBLICATION_PRODUCTION_ENABLED: \$\{\{ vars\.PUBLICATION_PRODUCTION_ENABLED \}\}/);
  assert.match(workflow, /PUBLICATION_PREVIEW_REVIEW: \$\{\{ vars\.PUBLICATION_PREVIEW_REVIEW \}\}/);
  assert.match(workflow, /Record pending human preview acceptance[\s\S]+online_acceptance=pending/);
  assert.match(workflow, /record=\{schema_version:1,framework_sha:[^\n]+manifest_sha256:[^\n]+source_tree_hash:[^\n]+deployment_id:[^\n]+preview_url:[^\n]+environment:"preview",online_acceptance:"pending"\}/);
  assert.match(workflow, /Preserve pending preview deployment record[\s\S]+name: preview-deployment-record-/);
  assert.match(workflow, /Validate automatic preview response[\s\S]+if: needs\.prepare\.outputs\.preview_review == 'automatic'/);
  assert.match(workflow, /Validate manual preview deployment outputs[\s\S]+if: needs\.prepare\.outputs\.preview_review == 'manual'/);
  assert.match(workflow, /Build immutable preview candidate[\s\S]+STRICT_CONTENT_ASSETS: '1'/);
  assert.match(workflow, /Run built-site browser acceptance[\s\S]+E2E_REAL_CORPUS: '1'[\s\S]+E2E_REAL_LISTINGS: '1'/);
  const manualPolicy = workflow.slice(
    workflow.indexOf("Validate manual preview deployment outputs"),
    workflow.indexOf("Validate automatic preview response"),
  );
  assert.doesNotMatch(manualPolicy, /curl\s/);
  const previewVerified = workflow.indexOf("Validate automatic preview response");
  const productionBuild = workflow.indexOf("Build strict production artifact");
  const productionArtifact = workflow.indexOf("Preserve production artifact");
  assert.ok(previewVerified > 0 && productionBuild > previewVerified && productionArtifact > productionBuild);
  assert.match(workflow, /deploy_production:[\s\S]+if: needs\.prepare\.outputs\.deploy_mode == 'production' && needs\.prepare\.outputs\.production_enabled == 'true' && needs\.prepare\.outputs\.preview_review == 'automatic'/);
  const productionConditions = workflow.match(/^\s+if: .*deploy_mode.*$/gm) || [];
  assert.equal(productionConditions.length, 5);
  for (const condition of productionConditions) {
    assert.match(condition, /production_enabled == 'true'/);
    assert.match(condition, /preview_review == 'automatic'/);
  }
  assert.match(workflow, /Build strict production artifact[\s\S]+PUBLIC_DEPLOYMENT_ENV: production[\s\S]+STRICT_CONTENT_ASSETS: '1'/);
  assert.match(workflow, /validate-publication-snapshot\.mjs site[\s\S]+--mode production/);
  assert.match(workflow, /name: publication-production-site-/);
  assert.match(workflow, /Reverify downloaded production indexing policy[\s\S]+--mode production[\s\S]+Deploy production to Cloudflare Pages/);
  assert.match(workflow, /production-index\.html[\s\S]+content="index, follow"/);
  assert.match(workflow, /production-robots\.txt[\s\S]+Sitemap: https:\/\//);
  assert.equal((workflow.match(/Verify exact snapshot manifest and source|Reverify exact snapshot before production/g) || []).length, 2);
  assert.doesNotMatch(workflow, /NOTION_TOKEN|NOTION_DATABASE_ID|@notion/i);
  assert.match(workflow, /\npermissions:\n  contents: read\n/);
  assert.doesNotMatch(workflow, /^\s+(?:contents|actions|deployments): write$/m);
  assert.doesNotMatch(
    workflow,
    /(?:echo|printf|cat)[^\n]*(?:CLOUDFLARE_API_TOKEN|VAULT_CONTENTS_READ_KEY)/,
  );
  assert.match(
    workflow,
    /record=\{schema_version:1,framework_sha:[^\n]+artifact_sha256:[^\n]+deployment_id:[^\n]+status:"production"\}/,
  );
});

test("package and both workflows run the deployment validator suite", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const offlineWorkflow = await readFile(
    new URL("../.github/workflows/ci.yml", import.meta.url),
    "utf8",
  );
  const deploymentWorkflow = await readFile(
    new URL("../.github/workflows/deploy-publication.yml", import.meta.url),
    "utf8",
  );

  assert.equal(
    packageJson.scripts["test:deployment"],
    "node --test tests/validate-publication-snapshot.test.mjs",
  );
  assert.match(offlineWorkflow, /^\s+- run: pnpm test:deployment$/m);
  assert.match(
    deploymentWorkflow,
    /Run publication deployment validator tests[\s\S]+run: pnpm test:deployment/,
  );
});
