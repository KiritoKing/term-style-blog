#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const REVISION_ATTRIBUTE = "data-publication-revision";

const MODES = new Set(["preview", "production"]);
const COMMIT_SHA = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const PROJECT_NAME = /^[a-z0-9](?:[a-z0-9-]{0,56}[a-z0-9])?$/;
const DEPLOYMENT_HASH = /^[a-z0-9]{6,64}$/;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const PUBLICATION_KEYS = [
  "schema_version",
  "framework_sha",
  "content_sha",
  "manifest_sha256",
  "mode",
  "robots_sha256",
  "build_revision",
  "routes",
];
const RETRYABLE_PROPAGATION_CODES = new Set([
  "REMOTE_PUBLICATION_MISMATCH",
  "REMOTE_ROBOTS_MISMATCH",
  "ROUTE_REVISION_MISMATCH",
  "ROUTE_TITLE_MISMATCH",
  "HTML_INDEX_POLICY",
]);

export class HostedPublicationError extends Error {
  constructor(code, message, options = {}) {
    super(`${code}: ${message}`);
    this.name = "HostedPublicationError";
    this.code = code;
    this.retryable = options.retryable === true;
  }
}

function reject(code, message, options) {
  throw new HostedPublicationError(code, message, options);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function requiredEnvironment(environment, name, pattern) {
  const value = environment[name]?.trim();
  if (!value || !pattern.test(value)) {
    reject("INVALID_INPUT", `${name} is missing or invalid`);
  }
  return value;
}

function resolveIdentity(environment = process.env) {
  const mode = environment.PUBLICATION_MODE?.trim();
  if (!MODES.has(mode)) {
    reject("INVALID_INPUT", "PUBLICATION_MODE must be preview or production");
  }
  return {
    framework_sha: requiredEnvironment(environment, "PUBLICATION_FRAMEWORK_SHA", COMMIT_SHA),
    content_sha: requiredEnvironment(environment, "PUBLICATION_CONTENT_SHA", COMMIT_SHA),
    manifest_sha256: requiredEnvironment(
      environment,
      "PUBLICATION_MANIFEST_SHA256",
      SHA256,
    ),
    mode,
  };
}

function resolveAccessCredentials(environment = process.env) {
  const clientId = environment.CF_ACCESS_CLIENT_ID?.trim() || "";
  const clientSecret = environment.CF_ACCESS_CLIENT_SECRET?.trim() || "";
  if (Boolean(clientId) !== Boolean(clientSecret)) {
    reject(
      "INCOMPLETE_ACCESS_AUTH",
      "Cloudflare Access client credentials must be configured as a complete pair",
    );
  }
  return clientId ? { clientId, clientSecret } : null;
}

function boundedInteger(value, fallback, minimum, maximum, name) {
  const candidate = value === undefined || value === "" ? fallback : Number(value);
  if (!Number.isInteger(candidate) || candidate < minimum || candidate > maximum) {
    reject("INVALID_INPUT", `${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return candidate;
}

function exactKeys(value, keys, context) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    reject("REMOTE_PUBLICATION_SCHEMA", `${context} must be an object`);
  }
  const actual = Object.keys(value).sort(lexicalCompare);
  const expected = [...keys].sort(lexicalCompare);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    reject("REMOTE_PUBLICATION_SCHEMA", `${context} has unexpected or missing fields`);
  }
}

async function listHtmlFiles(distDir, relative = "") {
  let entries;
  try {
    entries = await readdir(path.join(distDir, relative), { withFileTypes: true });
  } catch {
    reject("DIST_UNAVAILABLE", "cannot enumerate the generated site directory");
  }
  entries.sort((left, right) => lexicalCompare(left.name, right.name));
  const files = [];
  for (const entry of entries) {
    const child = relative ? path.posix.join(relative, entry.name) : entry.name;
    if (entry.isSymbolicLink()) {
      reject("DIST_SYMLINK", `generated site contains a symlink at ${child}`);
    }
    if (entry.isDirectory()) {
      files.push(...await listHtmlFiles(distDir, child));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(child);
    }
  }
  return files;
}

function encodeRouteSegments(value) {
  return value.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function routeForHtml(relativePath) {
  if (relativePath === "index.html") return "/";
  if (path.posix.basename(relativePath).toLowerCase() === "index.html") {
    const directory = path.posix.dirname(relativePath);
    return `/${encodeRouteSegments(directory)}/`;
  }
  return `/${encodeRouteSegments(relativePath)}`;
}

function isNotFoundHtml(relativePath) {
  return path.posix.basename(relativePath).toLowerCase() === "404.html";
}

function decodeHtmlEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  // Decode exactly once: encoded ampersands must not introduce a second entity pass.
  return value.replace(/&(#x[a-f0-9]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (_entity, code) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()];
    const hexadecimal = code[1].toLowerCase() === "x";
    const point = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point)
      : "\uFFFD";
  });
}

function getTagAttribute(tag, attribute) {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(
    new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function htmlOpeningTag(html) {
  return html.match(/<html\b[^>]*>/i)?.[0] ?? null;
}

function htmlRevision(html) {
  const opening = htmlOpeningTag(html);
  return opening ? getTagAttribute(opening, REVISION_ATTRIBUTE) : null;
}

function htmlTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  if (!match) return "";
  return decodeHtmlEntities(match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function robotsMetaTokens(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (getTagAttribute(tag, "name")?.trim().toLowerCase() !== "robots") continue;
    const content = getTagAttribute(tag, "content");
    if (content === null) return new Set();
    return new Set(content.toLowerCase().split(/[\s,]+/).filter(Boolean));
  }
  return new Set();
}

function isGeneratedRedirectHtml(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return tags.some((tag) => {
    if (getTagAttribute(tag, "http-equiv")?.trim().toLowerCase() !== "refresh") return false;
    const content = getTagAttribute(tag, "content")?.trim() || "";
    return /^0\s*;\s*url=\/(?!\/)/i.test(content);
  });
}

function assertGeneratedRedirectHtml(html, context) {
  if (!/^\s*<!doctype\s+html\b/i.test(html) || !isGeneratedRedirectHtml(html)) {
    reject("INVALID_REDIRECT_HTML", `${context} is not a generated local redirect document`);
  }
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] ?? "";
  if (!body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()) {
    reject("INVALID_REDIRECT_HTML", `${context} has no rendered redirect content`);
  }
}

function assertHtmlPolicy(html, mode, context) {
  const tokens = robotsMetaTokens(html);
  const expected = mode === "preview" ? ["noindex", "nofollow"] : ["index", "follow"];
  const forbidden = mode === "preview" ? ["index", "follow"] : ["noindex", "nofollow"];
  if (!expected.every((token) => tokens.has(token)) || forbidden.some((token) => tokens.has(token))) {
    reject("HTML_INDEX_POLICY", `${context} does not carry the required ${mode} robots metadata`);
  }
}

function assertRealHtml(html, mode, context) {
  if (
    !/^\s*<!doctype\s+html\b/i.test(html) ||
    !htmlOpeningTag(html) ||
    !/<head\b[^>]*>[\s\S]*<\/head\s*>/i.test(html) ||
    !/<body\b[^>]*>[\s\S]*<\/body\s*>/i.test(html)
  ) {
    reject("INVALID_HTML", `${context} is not a complete HTML document`);
  }
  const title = htmlTitle(html);
  if (!title) reject("EMPTY_TITLE", `${context} has no nonempty title`);
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] ?? "";
  const bodyText = decodeHtmlEntities(
    body.replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  if (!bodyText) reject("EMPTY_BLOG_HTML", `${context} has no rendered blog content`);
  assertHtmlPolicy(html, mode, context);
  return title;
}

function assertRobotsPolicy(robots, mode, context) {
  const directives = robots.split(/\r?\n/).map((line) => line.replace(/#.*/, "").trim())
    .filter(Boolean).map((line) => line.toLowerCase());
  const has = (name, value) => directives.includes(`${name}: ${value}`);
  if (mode === "preview") {
    if (!has("disallow", "/")) {
      reject("ROBOTS_INDEX_POLICY", `${context} does not disallow preview indexing`);
    }
    return;
  }
  if (
    !has("allow", "/") || has("disallow", "/") ||
    !directives.some((line) => /^sitemap:\s+https:\/\//.test(line))
  ) {
    reject("ROBOTS_INDEX_POLICY", `${context} does not allow production indexing and sitemap discovery`);
  }
}

async function readRobots(distDir) {
  try {
    return await readFile(path.join(distDir, "robots.txt"), "utf8");
  } catch {
    reject("ROBOTS_UNAVAILABLE", "generated robots.txt is missing or unreadable");
  }
}

function publicationWithoutRevision(identity, robotsSha256, routes) {
  return {
    schema_version: 1,
    framework_sha: identity.framework_sha,
    content_sha: identity.content_sha,
    manifest_sha256: identity.manifest_sha256,
    mode: identity.mode,
    robots_sha256: robotsSha256,
    routes,
  };
}

function expectedPublication(identity, robotsSha256, routes) {
  const base = publicationWithoutRevision(identity, robotsSha256, routes);
  return {
    ...base,
    build_revision: sha256(`hosted-publication-v1\n${JSON.stringify(base)}`),
    routes,
  };
}

function stampHtml(html, revision, relativePath, generatedRedirect) {
  const opening = htmlOpeningTag(html);
  if (!opening) {
    if (!generatedRedirect) reject("INVALID_HTML", `${relativePath} has no html element`);
    const doctype = html.match(/^\s*<!doctype\s+html\b[^>]*>/i)?.[0];
    if (!doctype) reject("INVALID_REDIRECT_HTML", `${relativePath} has no HTML doctype`);
    return `${html.replace(
      doctype,
      `${doctype}<html ${REVISION_ATTRIBUTE}="${revision}">`,
    )}</html>`;
  }
  const clean = opening.replace(
    new RegExp(`\\s+${REVISION_ATTRIBUTE}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, "gi"),
    "",
  );
  const stamped = clean.replace(/>$/, ` ${REVISION_ATTRIBUTE}="${revision}">`);
  return html.replace(opening, stamped);
}

async function inspectDist(distDir, identity, requireRevision) {
  const absoluteDist = path.resolve(distDir);
  let stat;
  try {
    stat = await lstat(absoluteDist);
  } catch {
    reject("DIST_UNAVAILABLE", "generated site directory is missing or unreadable");
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    reject("DIST_UNAVAILABLE", "generated site path must be a real directory");
  }

  const htmlFiles = await listHtmlFiles(absoluteDist);
  if (htmlFiles.length === 0) reject("EMPTY_SITE", "generated site contains no HTML files");
  const robots = await readRobots(absoluteDist);
  assertRobotsPolicy(robots, identity.mode, "local robots.txt");

  const documents = [];
  const routes = [];
  for (const relativePath of htmlFiles) {
    const html = await readFile(path.join(absoluteDist, relativePath), "utf8");
    const generatedRedirect = isGeneratedRedirectHtml(html);
    let title = "";
    if (generatedRedirect) {
      assertGeneratedRedirectHtml(html, relativePath);
    } else {
      title = assertRealHtml(html, identity.mode, relativePath);
    }
    documents.push({ relativePath, html, generatedRedirect });
    if (!generatedRedirect && !isNotFoundHtml(relativePath)) {
      routes.push({ path: routeForHtml(relativePath), title });
    }
  }
  routes.sort((left, right) => lexicalCompare(left.path, right.path));
  if (new Set(routes.map((route) => route.path)).size !== routes.length) {
    reject("DUPLICATE_ROUTE", "generated HTML files resolve to duplicate routes");
  }
  const publication = expectedPublication(identity, sha256(robots), routes);

  if (requireRevision) {
    for (const document of documents) {
      const revision = htmlRevision(document.html);
      if (!revision) {
        reject("LOCAL_REVISION_MISSING", `${document.relativePath} has no immutable revision`);
      }
      if (revision !== publication.build_revision) {
        reject("LOCAL_REVISION_MISMATCH", `${document.relativePath} has a stale immutable revision`);
      }
    }
  }
  return { absoluteDist, documents, publication, robots };
}

function assertPublicationSchema(publication) {
  exactKeys(publication, PUBLICATION_KEYS, "publication.json");
  if (
    publication.schema_version !== 1 ||
    !COMMIT_SHA.test(publication.framework_sha) ||
    !COMMIT_SHA.test(publication.content_sha) ||
    !SHA256.test(publication.manifest_sha256) ||
    !MODES.has(publication.mode) ||
    !SHA256.test(publication.robots_sha256) ||
    !SHA256.test(publication.build_revision) ||
    !Array.isArray(publication.routes)
  ) {
    reject("REMOTE_PUBLICATION_SCHEMA", "publication.json has invalid field values");
  }
  let previous = null;
  for (const [index, route] of publication.routes.entries()) {
    exactKeys(route, ["path", "title"], `publication.json routes[${index}]`);
    if (
      typeof route.path !== "string" || !route.path.startsWith("/") ||
      typeof route.title !== "string" || route.title.trim() === "" ||
      (previous !== null && lexicalCompare(previous, route.path) >= 0)
    ) {
      reject("REMOTE_PUBLICATION_SCHEMA", "publication.json routes are invalid or unsorted");
    }
    previous = route.path;
  }
}

function samePublication(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

export async function stampPublication({ distDir, environment = process.env }) {
  if (typeof distDir !== "string" || distDir.trim() === "") {
    reject("INVALID_INPUT", "--dist must name a generated site directory");
  }
  const identity = resolveIdentity(environment);
  const inspected = await inspectDist(distDir, identity, false);
  const writes = inspected.documents.map(({ relativePath, html, generatedRedirect }) =>
    writeFile(
      path.join(inspected.absoluteDist, relativePath),
      stampHtml(html, inspected.publication.build_revision, relativePath, generatedRedirect),
      "utf8",
    ));
  await Promise.all(writes);
  await writeFile(
    path.join(inspected.absoluteDist, "publication.json"),
    `${JSON.stringify(inspected.publication, null, 2)}\n`,
    "utf8",
  );
  return inspected.publication;
}

async function deriveLocalExpectation(distDir, identity) {
  const inspected = await inspectDist(distDir, identity, true);
  let saved;
  try {
    saved = JSON.parse(await readFile(path.join(inspected.absoluteDist, "publication.json"), "utf8"));
  } catch {
    reject("LOCAL_PUBLICATION_INVALID", "local publication.json is missing or invalid");
  }
  try {
    assertPublicationSchema(saved);
  } catch (error) {
    if (error instanceof HostedPublicationError) {
      reject("LOCAL_PUBLICATION_INVALID", "local publication.json does not match its schema");
    }
    throw error;
  }
  if (!samePublication(saved, inspected.publication)) {
    reject("LOCAL_PUBLICATION_MISMATCH", "local publication.json does not match the generated site");
  }
  return inspected;
}

function validateBaseUrl(value, mode, environment) {
  let url;
  try {
    url = new URL(value);
  } catch {
    reject("INVALID_URL", "--url must be a valid HTTPS origin");
  }
  if (
    url.protocol !== "https:" || url.username || url.password || url.port ||
    url.search || url.hash || !new Set(["", "/"]).has(url.pathname)
  ) {
    reject("INVALID_URL", "--url must be a clean HTTPS origin");
  }
  url.pathname = "/";
  const hostname = url.hostname.toLowerCase();
  if (mode === "production") {
    if (!new Set(["chlorinec.top", "www.chlorinec.top"]).has(hostname)) {
      reject("INVALID_URL", "production verification requires the canonical production host");
    }
    return { baseUrl: url, accessOrigin: null };
  }

  const project = environment.CLOUDFLARE_PAGES_PROJECT?.trim();
  if (!project || !PROJECT_NAME.test(project)) {
    reject("INVALID_INPUT", "CLOUDFLARE_PAGES_PROJECT is missing or invalid");
  }
  const suffix = `.${project}.pages.dev`;
  if (!hostname.endsWith(suffix)) {
    reject("INVALID_URL", "preview URL does not belong to the configured Pages project");
  }
  const deployment = hostname.slice(0, -suffix.length);
  if (!DEPLOYMENT_HASH.test(deployment) || deployment.includes(".")) {
    reject("INVALID_URL", "preview URL must use an immutable Pages deployment hash host");
  }
  return { baseUrl: url, accessOrigin: url.origin };
}

async function responseText(response, context) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    reject("RESPONSE_TOO_LARGE", `${context} exceeds the response size limit`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) {
    reject("RESPONSE_TOO_LARGE", `${context} exceeds the response size limit`);
  }
  return new TextDecoder().decode(bytes);
}

function requestHeaders(origin, accessOrigin, credentials) {
  const headers = { Accept: "*/*" };
  if (credentials && origin === accessOrigin) {
    headers["CF-Access-Client-Id"] = credentials.clientId;
    headers["CF-Access-Client-Secret"] = credentials.clientSecret;
  }
  return headers;
}

async function fetchPath(pathname, contentType, context) {
  const target = new URL(pathname, context.baseUrl);
  if (target.origin !== context.baseUrl.origin) {
    reject("CROSS_ORIGIN_REQUEST", `refusing cross-origin request for ${pathname}`);
  }
  let lastError;
  for (let attempt = 0; attempt <= context.retries; attempt += 1) {
    const remaining = context.deadline - context.now();
    if (remaining <= 0) {
      reject("PROPAGATION_TIMEOUT", "production verification exceeded its bounded propagation window");
    }
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.min(context.requestTimeoutMs, remaining),
    );
    try {
      const response = await context.fetchImpl(target.href, {
        method: "GET",
        headers: requestHeaders(target.origin, context.accessOrigin, context.credentials),
        redirect: "manual",
        signal: controller.signal,
      });
      if (response.status >= 300 && response.status < 400) {
        reject("REDIRECT_REJECTED", `hosted request redirected for ${pathname}`);
      }
      if (response.status !== 200) {
        const retryable = response.status === 408 || response.status === 425 ||
          response.status === 429 || response.status >= 500 ||
          (context.mode === "production" && response.status === 404);
        lastError = new HostedPublicationError(
          "HTTP_STATUS",
          `hosted request returned status ${response.status} for ${pathname}`,
          { retryable },
        );
        if (!retryable || attempt === context.retries) throw lastError;
      } else {
        const actualType = response.headers.get("content-type")?.toLowerCase() || "";
        if (!actualType.includes(contentType)) {
          reject("CONTENT_TYPE", `hosted response has the wrong content type for ${pathname}`);
        }
        return await responseText(response, pathname);
      }
    } catch (error) {
      if (error instanceof HostedPublicationError) {
        lastError = error;
        if (!error.retryable || attempt === context.retries) throw error;
      } else {
        lastError = new HostedPublicationError(
          "NETWORK_FAILURE",
          `hosted request failed for ${pathname}`,
          { retryable: true },
        );
        if (attempt === context.retries) throw lastError;
      }
    } finally {
      clearTimeout(timer);
    }
    await context.sleep(context.retryDelayMs);
  }
  throw lastError;
}

function isRetryablePropagationError(error) {
  return error instanceof HostedPublicationError &&
    (error.retryable || RETRYABLE_PROPAGATION_CODES.has(error.code));
}

async function mapConcurrent(values, concurrency, callback) {
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      await callback(values[index], index);
    }
  });
  const results = await Promise.allSettled(workers);
  const failures = results.filter((result) => result.status === "rejected");
  const failed = failures.find((result) => !isRetryablePropagationError(result.reason)) ??
    failures[0];
  if (failed) throw failed.reason;
}

function isAccessLogin(html, expectedRevision) {
  if (htmlRevision(html) === expectedRevision) return false;
  const title = htmlTitle(html).toLowerCase();
  const loginTitle = /(?:cloudflare\s+access|sign\s+in|log\s+in|login)/.test(title);
  const loginForm = /<form\b[^>]*(?:action\s*=\s*["'][^"']*(?:cdn-cgi\/access|login)|data-testid\s*=\s*["'][^"']*login)/i
    .test(html);
  return loginTitle && loginForm;
}

async function verifyOnce(local, context) {
  const publicationBody = await fetchPath("/publication.json", "application/json", context);
  let hostedPublication;
  try {
    hostedPublication = JSON.parse(publicationBody);
  } catch {
    reject("REMOTE_PUBLICATION_SCHEMA", "hosted publication.json is not valid JSON");
  }
  assertPublicationSchema(hostedPublication);
  if (!samePublication(hostedPublication, local.publication)) {
    reject(
      "REMOTE_PUBLICATION_MISMATCH",
      "hosted publication.json does not match the expected immutable publication",
      { retryable: true },
    );
  }

  const hostedRobots = await fetchPath("/robots.txt", "text/plain", context);
  assertRobotsPolicy(hostedRobots, local.publication.mode, "hosted robots.txt");
  if (hostedRobots !== local.robots) {
    reject(
      "REMOTE_ROBOTS_MISMATCH",
      "hosted robots.txt does not exactly match the local publication policy",
      { retryable: true },
    );
  }

  await mapConcurrent(local.publication.routes, context.concurrency, async (route) => {
    const html = await fetchPath(route.path, "text/html", context);
    if (isAccessLogin(html, local.publication.build_revision)) {
      reject("AUTH_LOGIN_RESPONSE", `hosted route returned an Access login page for ${route.path}`);
    }
    const title = assertRealHtml(html, local.publication.mode, `hosted route ${route.path}`);
    if (htmlRevision(html) !== local.publication.build_revision) {
      reject(
        "ROUTE_REVISION_MISMATCH",
        `hosted route has the wrong immutable revision for ${route.path}`,
        { retryable: true },
      );
    }
    if (title !== route.title) {
      reject(
        "ROUTE_TITLE_MISMATCH",
        `hosted route has the wrong title for ${route.path}`,
        { retryable: true },
      );
    }
  });
}

export async function verifyHostedPublication({
  distDir,
  url,
  environment = process.env,
  fetchImpl = globalThis.fetch,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  now = Date.now,
  concurrency,
  retries,
  retryDelayMs,
  requestTimeoutMs,
  propagationTimeoutMs,
}) {
  if (typeof distDir !== "string" || distDir.trim() === "") {
    reject("INVALID_INPUT", "--dist must name a generated site directory");
  }
  if (typeof url !== "string" || url.trim() === "") {
    reject("INVALID_INPUT", "--url must name the hosted deployment origin");
  }
  if (typeof fetchImpl !== "function") reject("INVALID_INPUT", "fetch is unavailable");
  const identity = resolveIdentity(environment);
  const credentials = resolveAccessCredentials(environment);
  const { baseUrl, accessOrigin } = validateBaseUrl(url, identity.mode, environment);
  const local = await deriveLocalExpectation(distDir, identity);
  const context = {
    baseUrl,
    accessOrigin,
    credentials,
    fetchImpl,
    sleep,
    now,
    mode: identity.mode,
    concurrency: boundedInteger(
      concurrency ?? environment.PUBLICATION_VERIFY_CONCURRENCY,
      6,
      1,
      16,
      "PUBLICATION_VERIFY_CONCURRENCY",
    ),
    retries: boundedInteger(
      retries ?? environment.PUBLICATION_VERIFY_RETRIES,
      2,
      0,
      5,
      "PUBLICATION_VERIFY_RETRIES",
    ),
    retryDelayMs: boundedInteger(
      retryDelayMs ?? environment.PUBLICATION_VERIFY_RETRY_MS,
      1000,
      0,
      10_000,
      "PUBLICATION_VERIFY_RETRY_MS",
    ),
    requestTimeoutMs: boundedInteger(
      requestTimeoutMs ?? environment.PUBLICATION_VERIFY_REQUEST_TIMEOUT_MS,
      15_000,
      1,
      30_000,
      "PUBLICATION_VERIFY_REQUEST_TIMEOUT_MS",
    ),
  };
  const timeout = boundedInteger(
    propagationTimeoutMs ?? environment.PUBLICATION_VERIFY_TIMEOUT_MS,
    identity.mode === "production" ? 300_000 : 0,
    0,
    300_000,
    "PUBLICATION_VERIFY_TIMEOUT_MS",
  );
  const deadline = now() + timeout;
  context.deadline = timeout === 0 ? Number.POSITIVE_INFINITY : deadline;
  while (true) {
    try {
      await verifyOnce(local, context);
      return {
        verified: true,
        mode: identity.mode,
        build_revision: local.publication.build_revision,
        route_count: local.publication.routes.length,
        origin: baseUrl.origin,
      };
    } catch (error) {
      if (!(error instanceof HostedPublicationError)) throw error;
      const retryable = isRetryablePropagationError(error);
      if (identity.mode !== "production" || !retryable || now() >= deadline) throw error;
      const remaining = Math.max(0, deadline - now());
      await sleep(Math.min(Math.max(context.retryDelayMs, 100), remaining));
    }
  }
}

function parseCli(argv) {
  const [command, ...args] = argv;
  if (!new Set(["stamp", "verify"]).has(command)) {
    reject(
      "USAGE",
      "use stamp --dist <directory> or verify --dist <directory> --url <https-origin>",
    );
  }
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!new Set(["--dist", "--url"]).has(argument) || index + 1 >= args.length) {
      reject("USAGE", `unsupported or incomplete argument ${argument}`);
    }
    const key = argument.slice(2);
    if (options[key] !== undefined) reject("USAGE", `${argument} may only be provided once`);
    options[key] = args[index + 1];
    index += 1;
  }
  if (!options.dist || (command === "verify" && !options.url) || (command === "stamp" && options.url)) {
    reject(
      "USAGE",
      "use stamp --dist <directory> or verify --dist <directory> --url <https-origin>",
    );
  }
  return { command, options };
}

async function main() {
  const { command, options } = parseCli(process.argv.slice(2));
  if (command === "stamp") {
    const publication = await stampPublication({ distDir: options.dist });
    process.stdout.write(`${JSON.stringify({
      stamped: true,
      mode: publication.mode,
      build_revision: publication.build_revision,
      route_count: publication.routes.length,
    })}\n`);
    return;
  }
  const result = await verifyHostedPublication({ distDir: options.dist, url: options.url });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    const safe = error instanceof HostedPublicationError
      ? error.message
      : "UNEXPECTED_FAILURE: hosted publication verification failed";
    process.stderr.write(`${safe}\n`);
    process.exitCode = 1;
  });
}
