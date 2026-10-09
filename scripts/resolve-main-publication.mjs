#!/usr/bin/env node
import { appendFile, lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertMainPush, sha256Hex, validateSnapshot, ValidationError } from "./validate-publication-snapshot.mjs";
import { assertPublicationSchema, expectedPublication } from "./verify-hosted-publication.mjs";

const MAX_BYTES = 5 * 1024 * 1024;
const HASH = /^[a-f0-9]{64}$/;
function reject(code) { throw new ValidationError(code, "cannot resolve accepted publication inputs"); }

export async function resolvePublishedReference(environment = process.env, fetcher = fetch) {
  assertMainPush(environment);
  const response = await fetcher("https://chlorinec.top/publication.json", {
    headers: { Accept: "application/json" }, redirect: "error", cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || !/^application\/json(?:\s*;|$)/i.test(response.headers.get("content-type") || "")) {
    reject("PUBLISHED_REFERENCE_UNAVAILABLE");
  }
  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BYTES)) {
    reject("PUBLISHED_REFERENCE_TOO_LARGE");
  }
  if (!response.body) reject("PUBLISHED_REFERENCE_UNAVAILABLE");
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) reject("PUBLISHED_REFERENCE_TOO_LARGE");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  let publication;
  try { publication = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { reject("PUBLISHED_REFERENCE_INVALID"); }
  assertPublicationSchema(publication);
  if (publication.mode !== "production" || publication.routes.length === 0 ||
      publication.build_revision !== expectedPublication(publication, publication.robots_sha256, publication.routes).build_revision) {
    reject("PUBLISHED_REFERENCE_INVALID");
  }
  // Only fixed source coordinates and validated digests reach Actions outputs.
  return {
    content_repository: "KiritoKing/llm-obsidian", publication_branch: "publish-snapshots",
    content_sha: publication.content_sha, manifest_sha256: publication.manifest_sha256,
  };
}

export async function resolveSnapshotInputs(root, expectedManifestSha256) {
  if (!HASH.test(expectedManifestSha256 || "")) reject("INVALID_MANIFEST_HASH");
  const manifestPath = path.join(root, "blog-publish-manifest.json");
  if (!(await lstat(manifestPath)).isFile()) reject("INVALID_MANIFEST_FILE");
  const manifestBytes = await readFile(manifestPath);
  if (sha256Hex(manifestBytes) !== expectedManifestSha256) reject("MANIFEST_HASH_MISMATCH");
  let manifest;
  try { manifest = JSON.parse(manifestBytes.toString("utf8")); }
  catch { reject("MANIFEST_SCHEMA"); }
  const result = await validateSnapshot({ root, expectedManifestSha256, expectedTreeHash: manifest.source_tree_hash });
  return { manifest_sha256: result.manifestHash, source_tree_hash: result.sourceTreeHash };
}

async function main() {
  let outputs;
  if (process.argv[2] === "reference") outputs = await resolvePublishedReference();
  else if (process.argv[2] === "snapshot") {
    assertMainPush(process.env);
    outputs = await resolveSnapshotInputs(process.argv[3], process.env.MANIFEST_SHA256);
  } else reject("UNKNOWN_COMMAND");
  if (!process.env.GITHUB_OUTPUT) reject("MISSING_OUTPUT_PATH");
  for (const [key, value] of Object.entries(outputs)) {
    if (typeof value !== "string" || /[\r\n]/.test(value)) reject("INVALID_OUTPUT");
    await appendFile(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
  console.log(JSON.stringify({ ok: true, command: process.argv[2] }));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    // Avoid printing fetched metadata, snapshot contents or request errors.
    console.error(`Main publication resolution failed: ${error.code || error.name}`);
    process.exitCode = 1;
  });
}
