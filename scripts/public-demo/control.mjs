import assert from 'node:assert/strict';
import { readdir, lstat } from 'node:fs/promises';
import { join, relative } from 'node:path';

export const PROJECT = 'term-style-blog-demo';
export const PRODUCTION_BRANCH = 'reserved-public-demo-20261009';
export const PUBLIC_ORIGIN = 'https://public-demo.term-style-blog-demo.pages.dev';

export function validatePublicOrigin(value) {
  const url = new URL(value);
  assert.ok(url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.search && !url.hash && url.pathname === '/' && /^(?:public-demo|[a-f0-9]{8})\.term-style-blog-demo\.pages\.dev$/.test(url.hostname), 'Expected dedicated anonymous Pages preview origin');
  return url.origin;
}

function validateProject(project) {
  assert.ok(project?.name === PROJECT && project.subdomain === `${PROJECT}.pages.dev` && project.production_branch === PRODUCTION_BRANCH && Date.parse(project.created_on) >= Date.parse('2026-10-09T00:00:00Z') && !project.source, 'Dedicated demo project contract differs; stop without changing it');
  for (const config of Object.values(project.deployment_configs ?? {})) {
    for (const [key, value] of Object.entries(config)) {
      if (/env_vars|namespaces|buckets|databases|services|durable|ai_bindings|analytics|hyperdrive|queues/.test(key)) assert.ok(!value || Object.keys(value).length === 0, 'Dedicated demo project contract contains runtime bindings');
    }
  }
}

export async function ensureDemoProject({ accountId, token, fetcher = fetch }) {
  assert.match(accountId ?? '', /^[a-f0-9]{32}$/, 'Existing account id is missing or malformed');
  assert.ok(token, 'Existing controlled Pages credential is unavailable');
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`;
  async function request(method, url, body) {
    let response;
    try {
      response = await fetcher(url, { method, redirect: 'error', signal: AbortSignal.timeout(30000), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    } catch { throw new Error('Pages API network request failed; no credential or account response recorded'); }
    let data;
    try { data = await response.json(); } catch { throw new Error(`Pages API invalid JSON (HTTP ${response.status})`); }
    if (!response.ok || data.success !== true) {
      const codes = (data.errors ?? []).map(error => Number.isInteger(error.code) ? error.code : 'unknown').join(',');
      throw new Error(`Pages API rejected bounded operation (HTTP ${response.status}; codes ${codes}); existing permission/quota must be reviewed`);
    }
    return data;
  }
  const projects = [];
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const data = await request('GET', `${base}?page=${page}&per_page=20`);
    assert.ok(Array.isArray(data.result), 'Invalid project listing; cannot verify quota');
    projects.push(...data.result);
    const total = data.result_info?.total_pages ?? 1;
    assert.ok(Number.isInteger(total) && total >= page && total <= 100, 'Invalid pagination; cannot verify quota');
    pages = total;
  }
  const existing = projects.filter(project => project.name === PROJECT);
  assert.ok(existing.length <= 1, 'Duplicate dedicated project contract');
  if (existing.length) {
    validateProject(existing[0]);
    return { project: PROJECT, project_count_before: projects.length, project_limit_checked: 100, created: false, production_branch: PRODUCTION_BRANCH, deployment_branch: 'public-demo' };
  }
  assert.ok(projects.length < 100, 'Pages project quota reached; no paid-plan fallback or project deletion');
  const created = await request('POST', base, { name: PROJECT, production_branch: PRODUCTION_BRANCH });
  validateProject(created.result);
  return { project: PROJECT, project_count_before: projects.length, project_limit_checked: 100, created: true, production_branch: PRODUCTION_BRANCH, deployment_branch: 'public-demo' };
}

export async function inspectStaticAssets(root) {
  let files = 0;
  let largest = 0;
  async function inspect(directory) {
    for (const entry of await readdir(directory)) {
      const path = join(directory, entry);
      const metadata = await lstat(path);
      const name = relative(root, path).replaceAll('\\', '/');
      assert.ok(!metadata.isSymbolicLink(), 'Static demo cannot contain a symlink');
      assert.ok(!/(^|\/)(functions|_worker\.js|_worker\.bundle|wrangler\.[^/]+)(\/|$)|\.(node|so|dylib)$/.test(name), 'Demo must contain only static assets, without Functions or native payloads');
      if (metadata.isDirectory()) await inspect(path);
      else {
        assert.ok(metadata.isFile(), 'Demo must contain only static files');
        files++;
        largest = Math.max(largest, metadata.size);
        assert.ok(metadata.size <= 25 * 1024 * 1024, 'Pages asset size limit exceeded');
        assert.ok(files <= 20000, 'Pages static file limit exceeded');
      }
    }
  }
  await inspect(root);
  assert.ok(files > 0, 'Empty public demo output');
  return { files, largest_asset_bytes: largest, functions: false, paid_plan_requested: false };
}
