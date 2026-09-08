#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  appendFile,
  lstat,
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONTENT_REPOSITORY = "KiritoKing/llm-obsidian";
const FRAMEWORK_REPOSITORY = "KiritoKing/term-style-blog";
const PUBLICATION_BRANCH = "publish-snapshots";
const CONTENT_DIRECTORY = "20-writing/published";
const MANIFEST_FILENAME = "blog-publish-manifest.json";
const SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const FORBIDDEN_METADATA_KEYS = new Set([
  "access_key",
  "api_key",
  "credential",
  "credentials",
  "password",
  "private_key",
  "secret",
  "token",
]);

export class ValidationError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = "ValidationError";
    this.code = code;
  }
}

function reject(code, message) {
  throw new ValidationError(code, message);
}

export function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function requiredString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    reject("INVALID_INPUT", `${name} must be a non-empty string`);
  }
  return value.trim();
}

function exactKeys(value, expected, context) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    reject("MANIFEST_SCHEMA", `${context} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    reject("MANIFEST_SCHEMA", `${context} has unexpected or missing fields`);
  }
}

function validateSha(value, name, pattern = SHA_PATTERN) {
  const normalized = requiredString(value, name);
  if (!pattern.test(normalized)) {
    reject("INVALID_INPUT", `${name} must be a lowercase immutable hexadecimal SHA`);
  }
  return normalized;
}

function validateProject(value) {
  const project = value?.trim() || "notion-astro-rev";
  if (!/^[a-z0-9](?:[a-z0-9-]{0,56}[a-z0-9])?$/.test(project)) {
    reject("INVALID_INPUT", "Cloudflare Pages project is not a valid project name");
  }
  return project;
}

function publicationPolicy(environment) {
  const productionEnabled = environment.PUBLICATION_PRODUCTION_ENABLED?.trim() || "false";
  if (!new Set(["true", "false"]).has(productionEnabled)) {
    reject(
      "INVALID_PUBLICATION_POLICY",
      "PUBLICATION_PRODUCTION_ENABLED must be true or false",
    );
  }
  const previewReview = environment.PUBLICATION_PREVIEW_REVIEW?.trim() || "manual";
  if (!new Set(["manual", "automatic"]).has(previewReview)) {
    reject(
      "INVALID_PUBLICATION_POLICY",
      "PUBLICATION_PREVIEW_REVIEW must be manual or automatic",
    );
  }
  return { productionEnabled, previewReview };
}

export function resolveInputs(environment = process.env) {
  const eventName = requiredString(environment.GITHUB_EVENT_NAME, "GITHUB_EVENT_NAME");
  if (!new Set(["repository_dispatch", "workflow_dispatch"]).has(eventName)) {
    reject("UNSUPPORTED_EVENT", `unsupported event ${eventName}`);
  }
  if (environment.GITHUB_REPOSITORY !== FRAMEWORK_REPOSITORY) {
    reject("WRONG_FRAMEWORK_REPOSITORY", "workflow must run in KiritoKing/term-style-blog");
  }

  const contentRepository = requiredString(
    environment.INPUT_CONTENT_REPOSITORY,
    "content_repository",
  );
  if (contentRepository !== CONTENT_REPOSITORY) {
    reject("WRONG_CONTENT_REPOSITORY", `content repository must be ${CONTENT_REPOSITORY}`);
  }
  const publicationBranch = requiredString(
    environment.INPUT_PUBLICATION_BRANCH,
    "publication_branch",
  );
  if (publicationBranch !== PUBLICATION_BRANCH) {
    reject("WRONG_PUBLICATION_BRANCH", `publication branch must be ${PUBLICATION_BRANCH}`);
  }

  const frameworkSha = validateSha(environment.GITHUB_SHA, "framework_sha");
  const contentSha = validateSha(environment.INPUT_CONTENT_SHA, "content_sha");
  const manifestSha256 = validateSha(
    environment.INPUT_MANIFEST_SHA256,
    "manifest_sha256",
    HASH_PATTERN,
  );
  const sourceTreeHash = validateSha(
    environment.INPUT_SOURCE_TREE_HASH,
    "source_tree_hash",
    HASH_PATTERN,
  );

  const requestedMode = requiredString(environment.INPUT_DEPLOY_MODE, "deploy_mode");
  const { productionEnabled, previewReview } = publicationPolicy(environment);
  let deployMode;
  let dispatchId;
  if (eventName === "repository_dispatch") {
    if (environment.GITHUB_EVENT_ACTION !== "content_published_changed") {
      reject("UNSUPPORTED_EVENT", "repository dispatch action must be content_published_changed");
    }
    if (environment.GITHUB_REF !== "refs/heads/main") {
      reject("WRONG_FRAMEWORK_REF", "repository dispatch must bind the framework main branch");
    }
    if (requestedMode !== "production") {
      reject("INVALID_INPUT", "repository dispatch deploy_mode must be production");
    }
    dispatchId = requiredString(environment.INPUT_DISPATCH_ID, "dispatch_id");
    if (dispatchId !== `blog-publish:${contentSha}`) {
      reject("INVALID_DISPATCH_ID", "dispatch_id does not bind the content SHA");
    }
    deployMode = productionEnabled === "true" && previewReview === "automatic"
      ? "production"
      : "preview";
  } else {
    if (!new Set(["preview", "production-retry"]).has(requestedMode)) {
      reject("INVALID_INPUT", "manual deploy_mode must be preview or production-retry");
    }
    if (requestedMode === "production-retry" && environment.GITHUB_REF !== "refs/heads/main") {
      reject("WRONG_FRAMEWORK_REF", "manual production retry must run from main");
    }
    if (requestedMode === "production-retry" && productionEnabled !== "true") {
      reject("PRODUCTION_DISABLED", "production retry requires explicit production enablement");
    }
    if (requestedMode === "production-retry" && previewReview !== "automatic") {
      reject(
        "AUTOMATIC_REVIEW_REQUIRED",
        "production retry requires automatic online preview review",
      );
    }
    deployMode = requestedMode === "preview" ? "preview" : "production";
    dispatchId = `manual:${environment.GITHUB_RUN_ID || "local"}:${environment.GITHUB_RUN_ATTEMPT || "1"}`;
  }

  const accountId = requiredString(
    environment.INPUT_CLOUDFLARE_ACCOUNT_ID,
    "CLOUDFLARE_ACCOUNT_ID",
  );
  if (!/^[a-f0-9]{32}$/.test(accountId)) {
    reject("INVALID_INPUT", "CLOUDFLARE_ACCOUNT_ID must be a 32-character lowercase hexadecimal id");
  }

  return {
    content_repository: contentRepository,
    publication_branch: publicationBranch,
    content_sha: contentSha,
    manifest_sha256: manifestSha256,
    source_tree_hash: sourceTreeHash,
    framework_sha: frameworkSha,
    deploy_mode: deployMode,
    production_enabled: productionEnabled,
    preview_review: previewReview,
    dispatch_id: dispatchId,
    cloudflare_account_id: accountId,
    cloudflare_project: validateProject(environment.INPUT_CLOUDFLARE_PROJECT),
  };
}

function validateRelativeMarkdownPath(value, context) {
  if (
    typeof value !== "string" || value === "" || value.startsWith("/") ||
    value.includes("\\") || path.posix.normalize(value) !== value ||
    !value.toLowerCase().endsWith(".md")
  ) {
    reject("MANIFEST_SCHEMA", `${context} is not a canonical relative Markdown path`);
  }
  return value;
}

function validateSortedUniqueStrings(values, context, pathValues = false) {
  if (!Array.isArray(values)) reject("MANIFEST_SCHEMA", `${context} must be an array`);
  const checked = values.map((value, index) => {
    if (typeof value !== "string") reject("MANIFEST_SCHEMA", `${context}[${index}] must be a string`);
    return pathValues ? validateRelativeMarkdownPath(value, `${context}[${index}]`) : value;
  });
  if (new Set(checked).size !== checked.length || JSON.stringify(checked) !== JSON.stringify([...checked].sort())) {
    reject("MANIFEST_SCHEMA", `${context} must be sorted and unique`);
  }
  return checked;
}

function stripYamlComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote === "'" && character === "'" && value[index + 1] === "'") {
      index += 1;
      continue;
    }
    if ((character === "'" || character === '"') && (quote === null || quote === character)) {
      quote = quote === null ? character : null;
      continue;
    }
    if (character === "#" && quote === null && (index === 0 || /\s/.test(value[index - 1]))) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function yamlScalar(value, context) {
  const trimmed = stripYamlComment(value.trim()).trim();
  if (trimmed === "") reject("INVALID_FRONTMATTER", `${context} must be a scalar`);
  if (trimmed.startsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed !== "string") throw new Error("not a string");
      return parsed;
    } catch {
      reject("INVALID_FRONTMATTER", `${context} has an unsupported double-quoted scalar`);
    }
  }
  if (trimmed.startsWith("'")) {
    if (!trimmed.endsWith("'")) reject("INVALID_FRONTMATTER", `${context} has an unterminated scalar`);
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  if (/^[|>{[&*!]/.test(trimmed)) {
    reject("INVALID_FRONTMATTER", `${context} must use a simple scalar`);
  }
  return trimmed;
}

function stripFencedCode(body) {
  let fence;
  return body.split("\n").map((line) => {
    const trimmed = line.trimStart();
    if (!fence && (trimmed.startsWith("```") || trimmed.startsWith("~~~"))) {
      fence = trimmed.startsWith("```") ? "```" : "~~~";
      return "";
    }
    if (fence) {
      if (trimmed.startsWith(fence)) fence = undefined;
      return "";
    }
    return line;
  }).join("\n");
}

function isRemoteAsset(value) {
  return /^https?:\/\//i.test(value.trim().replace(/^<|>$/g, ""));
}

function validateBody(body, relativePath) {
  const prose = stripFencedCode(body);
  if (/^<{7}(?:\s|$)|^={7}(?:\s|$)|^>{7}(?:\s|$)/m.test(prose)) {
    reject("CONFLICT_MARKER", `${relativePath}: unresolved merge conflict marker`);
  }
  if (/!\[\[[^\]]+\]\]/.test(prose)) {
    reject("LOCAL_ASSET", `${relativePath}: embedded vault media is blocked`);
  }
  for (const match of prose.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const destination = match[1].trim().split(/\s+["']/)[0];
    if (!isRemoteAsset(destination)) {
      reject("LOCAL_ASSET", `${relativePath}: local Markdown media is blocked`);
    }
  }
  for (const match of prose.matchAll(/<(?:img|video|audio|source)\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    if (!isRemoteAsset(match[1])) {
      reject("LOCAL_ASSET", `${relativePath}: local HTML media is blocked`);
    }
  }
}

function parseArticleMetadata(bytes, relativePath) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    reject("INVALID_ENCODING", `${relativePath}: Markdown must be valid UTF-8`);
  }
  const normalized = text.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    reject("INVALID_FRONTMATTER", `${relativePath}: frontmatter is required`);
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end < 0) reject("INVALID_FRONTMATTER", `${relativePath}: frontmatter is not closed`);
  const frontmatter = normalized.slice(4, end);
  const forbiddenInlineKey = new RegExp(
    `(?:^|[{,\\s])(?:${[...FORBIDDEN_METADATA_KEYS].join("|")})\\s*:`,
    "im",
  );
  if (forbiddenInlineKey.test(frontmatter)) {
    reject("SECRET_METADATA", `${relativePath}: credential-like metadata is blocked`);
  }
  const lines = frontmatter.split("\n");
  const top = new Map();
  let publishIndent = null;
  let publishTarget;
  for (const [index, line] of lines.entries()) {
    if (line.includes("\t")) reject("INVALID_FRONTMATTER", `${relativePath}:${index + 2}: tabs are blocked`);
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    const match = line.match(/^(\s*)([A-Za-z0-9_-]+)\s*:(.*)$/);
    if (!match) continue;
    const indent = match[1].length;
    const key = match[2];
    const value = match[3];
    if (FORBIDDEN_METADATA_KEYS.has(key.toLowerCase())) {
      reject("SECRET_METADATA", `${relativePath}: credential-like metadata key ${key} is blocked`);
    }
    if (["conflict", "conflicted", "sync_conflict"].includes(key.toLowerCase())) {
      const flag = value.trim().toLowerCase();
      if (flag !== "false" && flag !== "null" && flag !== "") {
        reject("CONFLICT_METADATA", `${relativePath}: conflict metadata requires review`);
      }
    }
    if (indent === 0) {
      publishIndent = key === "publish" ? indent : null;
      if (key === "publish" && value.trim() !== "") {
        reject("INVALID_FRONTMATTER", `${relativePath}: publish must be a mapping`);
      }
      top.set(key, value);
    } else if (publishIndent !== null && indent > publishIndent && key === "target") {
      publishTarget = yamlScalar(value, `${relativePath}: publish.target`);
    }
  }
  const type = yamlScalar(top.get("type") ?? "", `${relativePath}: type`);
  const title = yamlScalar(top.get("title") ?? "", `${relativePath}: title`);
  const slug = yamlScalar(top.get("slug") ?? "", `${relativePath}: slug`).normalize("NFC");
  const status = yamlScalar(top.get("status") ?? "", `${relativePath}: status`);
  if (type !== "writing_piece") reject("INVALID_METADATA", `${relativePath}: type must be writing_piece`);
  if (!new Set(["publish", "published"]).has(status)) {
    reject("UNAPPROVED_STATUS", `${relativePath}: status must be publish or published`);
  }
  if (publishTarget !== "blog") reject("WRONG_TARGET", `${relativePath}: publish.target must be blog`);
  if ([...slug].some((character) => character.codePointAt(0) <= 31) || /[/#?]/u.test(slug)) {
    reject("INVALID_METADATA", `${relativePath}: slug is not portable`);
  }
  validateBody(normalized.slice(end + 5), relativePath);
  return { slug, status, title };
}

async function walkMarkdown(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const stat = await lstat(absolutePath);
    const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
    if (stat.isSymbolicLink()) reject("UNSUPPORTED_ENTRY", `${relativePath}: symlinks are blocked`);
    if (stat.isDirectory()) {
      files.push(...await walkMarkdown(root, absolutePath));
    } else if (stat.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push({ absolutePath, relativePath });
    } else {
      reject("UNSUPPORTED_ENTRY", `${relativePath}: only Markdown files are allowed`);
    }
  }
  return files;
}

function parseManifest(bytes) {
  let manifest;
  try {
    manifest = JSON.parse(bytes.toString("utf8"));
  } catch {
    reject("MANIFEST_SCHEMA", "manifest must be valid JSON");
  }
  exactKeys(manifest, [
    "schema_version",
    "publication_branch",
    "source",
    "source_tree_hash",
    "previous_manifest_hash",
    "files",
    "changes",
  ], "manifest");
  if (manifest.schema_version !== 1 || manifest.publication_branch !== PUBLICATION_BRANCH) {
    reject("MANIFEST_SCHEMA", "manifest version or publication branch is invalid");
  }
  exactKeys(manifest.source, ["directory", "target", "statuses"], "manifest.source");
  if (
    manifest.source.directory !== CONTENT_DIRECTORY || manifest.source.target !== "blog" ||
    JSON.stringify(manifest.source.statuses) !== JSON.stringify(["publish", "published"])
  ) {
    reject("MANIFEST_SCHEMA", "manifest source contract is invalid");
  }
  if (!HASH_PATTERN.test(manifest.source_tree_hash)) {
    reject("MANIFEST_SCHEMA", "manifest source_tree_hash is invalid");
  }
  if (manifest.previous_manifest_hash !== null && !HASH_PATTERN.test(manifest.previous_manifest_hash)) {
    reject("MANIFEST_SCHEMA", "manifest previous_manifest_hash is invalid");
  }
  if (!Array.isArray(manifest.files)) reject("MANIFEST_SCHEMA", "manifest.files must be an array");
  if (manifest.files.length === 0) reject("EMPTY_SNAPSHOT", "publication snapshot contains no files");
  exactKeys(manifest.changes, ["added", "updated", "deleted"], "manifest.changes");
  const changeSets = ["added", "updated", "deleted"].map((key) =>
    validateSortedUniqueStrings(manifest.changes[key], `manifest.changes.${key}`, true)
  );
  if (new Set(changeSets.flat()).size !== changeSets.flat().length) {
    reject("MANIFEST_SCHEMA", "manifest change sets overlap");
  }
  return manifest;
}

export async function validateSnapshot({ root, expectedManifestSha256, expectedTreeHash }) {
  const manifestHash = validateSha(expectedManifestSha256, "expected manifest SHA-256", HASH_PATTERN);
  const treeHash = validateSha(expectedTreeHash, "expected source tree hash", HASH_PATTERN);
  const manifestBytes = await readFile(path.join(root, MANIFEST_FILENAME)).catch((error) => {
    reject("MANIFEST_UNAVAILABLE", `cannot read manifest: ${error.message}`);
  });
  if (sha256Hex(manifestBytes) !== manifestHash) {
    reject("MANIFEST_HASH_MISMATCH", "manifest bytes do not match the dispatch SHA-256");
  }
  const manifest = parseManifest(manifestBytes);
  if (manifest.source_tree_hash !== treeHash) {
    reject("TREE_HASH_MISMATCH", "manifest tree hash does not match the dispatch payload");
  }

  const contentRoot = path.join(root, CONTENT_DIRECTORY);
  const discovered = await walkMarkdown(contentRoot).catch((error) => {
    if (error instanceof ValidationError) throw error;
    reject("CONTENT_UNAVAILABLE", `cannot enumerate publication content: ${error.message}`);
  });
  if (discovered.length === 0) reject("EMPTY_SNAPSHOT", "publication snapshot contains no Markdown files");
  const actualPaths = discovered.map((file) => file.relativePath);
  const manifestPaths = manifest.files.map((entry, index) => {
    exactKeys(entry, ["path", "bytes", "sha256", "slug", "status", "title"], `manifest.files[${index}]`);
    const relativePath = validateRelativeMarkdownPath(entry.path, `manifest.files[${index}].path`);
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes < 0 || !HASH_PATTERN.test(entry.sha256)) {
      reject("MANIFEST_SCHEMA", `${relativePath}: byte count or SHA-256 is invalid`);
    }
    if (typeof entry.slug !== "string" || entry.slug === "" || typeof entry.title !== "string" || entry.title === "") {
      reject("MANIFEST_SCHEMA", `${relativePath}: slug and title must be non-empty strings`);
    }
    if (!new Set(["publish", "published"]).has(entry.status)) {
      reject("UNAPPROVED_STATUS", `${relativePath}: manifest status is not approved`);
    }
    return relativePath;
  });
  if (
    new Set(manifestPaths).size !== manifestPaths.length ||
    JSON.stringify(manifestPaths) !== JSON.stringify([...manifestPaths].sort())
  ) {
    reject("MANIFEST_SCHEMA", "manifest file paths must be sorted and unique");
  }
  if (JSON.stringify(actualPaths) !== JSON.stringify(manifestPaths)) {
    reject("FILE_SET_MISMATCH", "publication directory does not exactly match manifest.files");
  }

  const normalizedEntries = [];
  const portableSlugs = new Set();
  for (const [index, file] of discovered.entries()) {
    const expected = manifest.files[index];
    const bytes = await readFile(file.absolutePath);
    if (bytes.byteLength !== expected.bytes || sha256Hex(bytes) !== expected.sha256) {
      reject("FILE_HASH_MISMATCH", `${file.relativePath}: bytes differ from manifest`);
    }
    const metadata = parseArticleMetadata(bytes, file.relativePath);
    if (
      metadata.slug !== expected.slug || metadata.status !== expected.status ||
      metadata.title !== expected.title
    ) {
      reject("FILE_METADATA_MISMATCH", `${file.relativePath}: frontmatter differs from manifest`);
    }
    const portableSlug = metadata.slug.normalize("NFC").toLowerCase();
    if (portableSlugs.has(portableSlug)) {
      reject("DUPLICATE_SLUG", `${file.relativePath}: duplicate portable slug`);
    }
    portableSlugs.add(portableSlug);
    normalizedEntries.push({
      path: file.relativePath,
      bytes: bytes.byteLength,
      sha256: expected.sha256,
      slug: metadata.slug,
      status: metadata.status,
      title: metadata.title,
    });
  }
  const computedTreeHash = sha256Hex(JSON.stringify(normalizedEntries));
  if (computedTreeHash !== manifest.source_tree_hash) {
    reject("TREE_HASH_MISMATCH", "computed publication tree does not match the manifest");
  }
  return {
    manifestHash,
    sourceTreeHash: computedTreeHash,
    fileCount: normalizedEntries.length,
    publishCount: normalizedEntries.filter((entry) => entry.status === "publish").length,
    publishedCount: normalizedEntries.filter((entry) => entry.status === "published").length,
  };
}

async function walkHtml(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const stat = await lstat(absolutePath);
    const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
    if (stat.isSymbolicLink()) reject("SITE_MODE_MISMATCH", `${relativePath}: site symlinks are blocked`);
    if (stat.isDirectory()) files.push(...await walkHtml(root, absolutePath));
    else if (stat.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(absolutePath);
  }
  return files.sort();
}

export async function validateSiteMode({ root, mode }) {
  if (!new Set(["preview", "production"]).has(mode)) {
    reject("INVALID_INPUT", "site mode must be preview or production");
  }
  const htmlFiles = await walkHtml(root).catch((error) => {
    if (error instanceof ValidationError) throw error;
    reject("SITE_UNAVAILABLE", `cannot enumerate built site: ${error.message}`);
  });
  if (htmlFiles.length === 0) reject("SITE_MODE_MISMATCH", "built site contains no HTML files");
  const expectedRobots = mode === "preview" ? "noindex, nofollow" : "index, follow";
  const rootIndex = path.resolve(root, "index.html");
  let checkedHtml = 0;
  for (const htmlPath of htmlFiles) {
    const html = await readFile(htmlPath, "utf8");
    const isIndexablePage = path.resolve(htmlPath) === rootIndex || /data-pagefind-body|<article\b/i.test(html);
    if (!isIndexablePage) continue;
    checkedHtml += 1;
    const meta = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (!meta || meta[1].trim().toLowerCase() !== expectedRobots) {
      reject(
        "SITE_MODE_MISMATCH",
        `${path.relative(root, htmlPath)}: expected robots metadata ${expectedRobots}`,
      );
    }
  }
  if (checkedHtml === 0) reject("SITE_MODE_MISMATCH", "built site has no indexable HTML entrypoints");
  const robots = await readFile(path.join(root, "robots.txt"), "utf8").catch((error) => {
    reject("SITE_MODE_MISMATCH", `robots.txt is unavailable: ${error.message}`);
  });
  if (mode === "preview") {
    if (!/^Disallow:\s*\/$/im.test(robots) || /^Allow:\s*\/$/im.test(robots)) {
      reject("SITE_MODE_MISMATCH", "preview robots.txt must disallow the site");
    }
  } else if (
    !/^Allow:\s*\/$/im.test(robots) || /^Disallow:\s*\/$/im.test(robots) ||
    !/^Sitemap:\s*https:\/\//im.test(robots)
  ) {
    reject("SITE_MODE_MISMATCH", "production robots.txt must allow indexing and declare an HTTPS sitemap");
  }
  return { mode, htmlCount: htmlFiles.length, checkedHtml };
}

async function writeGitHubOutputs(outputs, outputPath) {
  if (!outputPath) reject("INVALID_INPUT", "GITHUB_OUTPUT is required");
  for (const [key, value] of Object.entries(outputs)) {
    if (typeof value !== "string" || value.includes("\n") || value.includes("\r")) {
      reject("INVALID_OUTPUT", `${key} is not safe for a GitHub output`);
    }
    await appendFile(outputPath, `${key}=${value}\n`, { encoding: "utf8" });
  }
}

async function main(argv) {
  const command = argv[0];
  if (command === "inputs") {
    const outputs = resolveInputs();
    await writeGitHubOutputs(outputs, process.env.GITHUB_OUTPUT);
    console.log(JSON.stringify({ ok: true, event: process.env.GITHUB_EVENT_NAME, mode: outputs.deploy_mode }));
    return;
  }
  if (command === "snapshot") {
    const options = new Map();
    for (let index = 1; index < argv.length; index += 2) options.set(argv[index], argv[index + 1]);
    const result = await validateSnapshot({
      root: requiredString(options.get("--root"), "--root"),
      expectedManifestSha256: options.get("--manifest-sha256"),
      expectedTreeHash: options.get("--source-tree-hash"),
    });
    if (process.env.GITHUB_OUTPUT) {
      await writeGitHubOutputs({
        content_count: String(result.fileCount),
        manifest_sha256: result.manifestHash,
        source_tree_hash: result.sourceTreeHash,
      }, process.env.GITHUB_OUTPUT);
    }
    console.log(JSON.stringify({ ok: true, ...result }));
    return;
  }
  if (command === "site") {
    const options = new Map();
    for (let index = 1; index < argv.length; index += 2) options.set(argv[index], argv[index + 1]);
    const result = await validateSiteMode({
      root: requiredString(options.get("--root"), "--root"),
      mode: requiredString(options.get("--mode"), "--mode"),
    });
    console.log(JSON.stringify({ ok: true, ...result }));
    return;
  }
  reject(
    "USAGE",
    "use inputs, snapshot --root PATH --manifest-sha256 HASH --source-tree-hash HASH, or site --root PATH --mode preview|production",
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    const code = error instanceof ValidationError ? error.code : "UNEXPECTED";
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ ok: false, code, message }));
    process.exitCode = code === "USAGE" ? 2 : 1;
  });
}
