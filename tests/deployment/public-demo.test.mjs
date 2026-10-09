import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { PROJECT, PRODUCTION_BRANCH, PUBLIC_ORIGIN, validatePublicOrigin, ensureDemoProject, inspectStaticAssets } from '../../scripts/public-demo/control.mjs';

const project = { name: 'term-style-blog-demo', subdomain: 'term-style-blog-demo.pages.dev', production_branch: 'reserved-public-demo-20261009', created_on: '2026-10-09T09:00:00Z', source: null };
const reply = (result, result_info = {}) => new Response(JSON.stringify({ success: true, result, result_info }), { status: 200 });
const options = (fetcher) => ({ accountId: 'a'.repeat(32), token: 'synthetic-test-token', fetcher });

test('anonymous origins accept only the dedicated preview project and refuse production/credentials', () => {
  assert.equal(validatePublicOrigin(PUBLIC_ORIGIN), PUBLIC_ORIGIN);
  assert.equal(validatePublicOrigin('https://a1b2c3d4.term-style-blog-demo.pages.dev'), 'https://a1b2c3d4.term-style-blog-demo.pages.dev');
  for (const url of ['https://term-style-blog-demo.pages.dev', 'https://a.notion-astro-rev.pages.dev', 'https://chlorinec.top', 'http://public-demo.term-style-blog-demo.pages.dev', PUBLIC_ORIGIN + '/path', PUBLIC_ORIGIN + '?x=1', PUBLIC_ORIGIN + '#x', 'https://user:password@a.term-style-blog-demo.pages.dev', 'https://evil.term-style-blog-demo.pages.dev.evil.test']) assert.throws(() => validatePublicOrigin(url));
});

test('creation first checks paginated count and creates only one fixed free static project', async () => {
  const calls = [];
  const fetcher = async (url, request) => {
    calls.push({ url, request });
    assert.equal(request.redirect, 'error');
    if (request.method === 'GET') assert.equal(new URL(url).searchParams.get('per_page'), '20', 'Use the documented Pages pagination example size');
    if (request.method === 'POST') {
      assert.deepEqual(JSON.parse(request.body), { name: PROJECT, production_branch: PRODUCTION_BRANCH });
      return reply(project);
    }
    return reply(new URL(url).searchParams.get('page') === '1' ? [{ name: 'existing-blog' }] : [], { total_pages: 2 });
  };
  const evidence = await ensureDemoProject(options(fetcher));
  assert.equal(calls.length, 3);
  assert.equal(evidence.project_count_before, 1);
  assert.equal(evidence.created, true);
  assert.doesNotMatch(JSON.stringify(evidence), /synthetic-test-token|existing-blog/);
});

test('quota refuses creation without a paid-plan fallback', async () => {
  let calls = 0;
  await assert.rejects(ensureDemoProject(options(async () => { calls++; return reply(Array.from({ length: 100 }, (_, i) => ({ name: `project-${i}` })), { total_pages: 1 }); })), /quota/i);
  assert.equal(calls, 1);
});

test('dedicated project rerun reuses a verified contract without update or creation', async () => {
  let calls = 0;
  const evidence = await ensureDemoProject(options(async (_url, request) => { calls++; assert.equal(request.method, 'GET'); return reply([project], { total_pages: 1 }); }));
  assert.equal(calls, 1);
  assert.equal(evidence.created, false);
});

test('pre-existing unsafe project, Git integration or runtime bindings stop before any write', async () => {
  for (const patch of [{ production_branch: 'main' }, { created_on: '2025-01-01T00:00:00Z' }, { source: { type: 'github' } }, { deployment_configs: { preview: { kv_namespaces: { PRIVATE: { namespace_id: 'x' } } } } }]) {
    let calls = 0;
    await assert.rejects(ensureDemoProject(options(async () => { calls++; return reply([{ ...project, ...patch }], { total_pages: 1 }); })), /contract/i);
    assert.equal(calls, 1);
  }
});

test('API errors expose sanitized codes, never credentials or raw account configuration', async () => {
  await assert.rejects(ensureDemoProject(options(async () => new Response(JSON.stringify({ success: false, errors: [{ code: 10000, message: 'synthetic-test-token PRIVATE CONFIG' }] }), { status: 403 }))), (error) => /403.*10000/.test(error.message) && !/PRIVATE|synthetic-test-token/.test(error.message));
});

test('static output accepts ordinary public files and rejects Functions/native/symlinks/oversize', async () => {
  const root = await mkdtemp(join(tmpdir(), 'public-demo-test-'));
  try {
    await writeFile(join(root, 'index.html'), '<html>synthetic</html>');
    assert.equal((await inspectStaticAssets(root)).files, 1);
    for (const name of ['_worker.js', 'functions/worker.js', 'native.node']) {
      await mkdir(join(root, name, '..'), { recursive: true });
      await writeFile(join(root, name), 'synthetic');
      await assert.rejects(inspectStaticAssets(root), /static/i);
      await rm(name.startsWith('functions/') ? join(root, 'functions') : join(root, name), { recursive: true });
    }
    await symlink(join(root, 'index.html'), join(root, 'linked.html'));
    await assert.rejects(inspectStaticAssets(root), /symlink/i);
    await rm(join(root, 'linked.html'));
    await writeFile(join(root, 'large.bin'), Buffer.alloc(25 * 1024 * 1024 + 1));
    await assert.rejects(inspectStaticAssets(root), /asset.*limit/i);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('public demo workflow is owned, synthetic, SHA-bound, secret-free before deploy and preview-only', async () => {
  const workflow = await readFile('.github/workflows/public-theme-demo.yml', 'utf8');
  assert.match(workflow, /branches: \[feat\/public-theme-demo\]/);
  assert.match(workflow, /github.repository == 'KiritoKing\/term-style-blog'/);
  assert.match(workflow, /SITE_PROFILE: template/);
  assert.match(workflow, /CONTENT_DIR: src\/content\/blog/);
  assert.match(workflow, /PUBLIC_DEPLOYMENT_ENV: preview/);
  assert.match(workflow, /--project-name=term-style-blog-demo/);
  assert.match(workflow, /--branch=public-demo/);
  assert.match(workflow, /--commit-hash=\$\{\{ github.sha \}\}/);
  assert.match(workflow, /test "\$DEPLOYMENT_ENVIRONMENT" = preview/);
  assert.doesNotMatch(workflow.split('\n  deploy:')[0], /secrets\./);
  assert.doesNotMatch(workflow, /CF_ACCESS|VAULT|PRIVATE_CONTENT|CONTENT_DEPLOY_KEY|environment: production|pull_request_target|--branch=main|--branch=reserved/);
});
