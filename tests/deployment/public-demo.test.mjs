import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { PROJECT, PRODUCTION_BRANCH, PUBLIC_ORIGIN, validatePublicOrigin, ensureDemoProject, inspectStaticAssets, fetchAnonymous } from '../../scripts/public-demo/control.mjs';

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
    if (request.method === 'GET') assert.equal(new URL(url).searchParams.get('per_page'), '10', 'Use the official Wrangler Pages project-list page size');
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

test('Pages responses without result_info are exhausted in official ten-project pages', async () => {
  let reads = 0;
  const evidence = await ensureDemoProject(options(async (_url, request) => {
    if (request.method === 'POST') return reply(project);
    reads++;
    return reply(reads === 1 ? Array.from({ length: 10 }, (_, i) => ({ name: `existing-${i}` })) : [{ name: 'last-existing' }]);
  }));
  assert.equal(reads, 2);
  assert.equal(evidence.project_count_before, 11);
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

// Independent fixtures from the Pages project API deployment_configs schema.
const runtimeBindings = {
  env_vars: { CONFIG: { type: 'plain_text', value: 'synthetic' } },
  ai_bindings: { AI: { project_id: 'synthetic-project' } },
  analytics_engine_datasets: { ANALYTICS: { dataset: 'synthetic-dataset' } },
  browsers: { BROWSER: {} },
  d1_databases: { DB: { id: 'synthetic-database' } },
  durable_object_namespaces: { OBJECT: { namespace_id: 'synthetic-namespace' } },
  hyperdrive_bindings: { HYPERDRIVE: { id: 'synthetic-hyperdrive' } },
  kv_namespaces: { KV: { namespace_id: 'synthetic-namespace' } },
  mtls_certificates: { MTLS: { certificate_id: 'synthetic-certificate' } },
  queue_producers: { QUEUE: { name: 'synthetic-queue' } },
  r2_buckets: { BUCKET: { name: 'synthetic-bucket' } },
  services: { SERVICE: { environment: 'production', service: 'synthetic-worker' } },
  vectorize_bindings: { VECTORIZE: { index_name: 'synthetic-index' } },
};

for (const [field, binding] of Object.entries(runtimeBindings)) {
  test(`static project rejects populated ${field} in either deployment environment before any write`, async () => {
    for (const environment of ['preview', 'production']) {
      let calls = 0;
      await assert.rejects(ensureDemoProject(options(async (_url, request) => {
        calls++;
        assert.equal(request.method, 'GET');
        return reply([{ ...project, deployment_configs: { [environment]: { [field]: binding } } }]);
      })), /contract contains runtime bindings/i);
      assert.equal(calls, 1);
    }
  });
}

test('empty or absent binding maps and unrelated deployment metadata remain safe to reuse', async () => {
  const config = { compatibility_date: '2026-10-09', compatibility_flags: [], build_image_major_version: 3, fail_open: false, usage_model: 'standard' };
  for (const value of [{}, null]) {
    let calls = 0;
    const emptyBindings = Object.fromEntries(Object.keys(runtimeBindings).map(field => [field, value]));
    const evidence = await ensureDemoProject(options(async (_url, request) => {
      calls++;
      assert.equal(request.method, 'GET');
      return reply([{ ...project, deployment_configs: { preview: { ...config, ...emptyBindings }, production: config } }]);
    }));
    assert.equal(evidence.created, false);
    assert.equal(calls, 1);
  }
});

test('API errors expose sanitized codes, never credentials or raw account configuration', async () => {
  await assert.rejects(ensureDemoProject(options(async () => new Response(JSON.stringify({ success: false, errors: [{ code: 10000, message: 'synthetic-test-token PRIVATE CONFIG' }] }), { status: 403 }))), (error) => /403.*10000/.test(error.message) && !/PRIVATE|synthetic-test-token/.test(error.message));
});

test('new-domain anonymous TLS propagation retries securely within a fixed bound', async () => {
  let calls = 0;
  const response = await fetchAnonymous(`${PUBLIC_ORIGIN}/_feature-preview.json`, { pause: async () => {}, fetcher: async (_url, request) => {
    calls++;
    assert.equal(request.redirect, 'manual');
    assert.equal(request.headers, undefined);
    if (calls < 3) throw new TypeError('synthetic TLS handshake', { cause: { code: 'ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE' } });
    return reply({ synthetic: true });
  } });
  assert.equal(response.status, 200);
  assert.equal(calls, 3);
});

test('anonymous propagation does not follow auth redirects or bypass permanent certificate failures', async () => {
  let calls = 0;
  const response = await fetchAnonymous(PUBLIC_ORIGIN, { fetcher: async () => { calls++; return new Response('', { status: 302, headers: { location: 'https://login.example.test' } }); } });
  assert.equal(response.status, 302);
  assert.equal(calls, 1);
  await assert.rejects(fetchAnonymous(PUBLIC_ORIGIN, { pause: async () => {}, fetcher: async () => { throw new Error('synthetic permanent TLS', { cause: { code: 'CERT_HAS_EXPIRED' } }); } }), /secure anonymous HTTPS/i);
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


test('anonymous raster acceptance rejects a stale image and records exact approved bytes', async () => {
  const { verifyAssetBytes } = await import('../../scripts/public-demo/control.mjs');
  assert.match(verifyAssetBytes(Buffer.from('neutral approved PNG'), Buffer.from('neutral approved PNG')), /^[a-f0-9]{64}$/);
  assert.throws(() => verifyAssetBytes(Buffer.from('old personalized PNG'), Buffer.from('neutral approved PNG')), /stale.*asset/i);
});
