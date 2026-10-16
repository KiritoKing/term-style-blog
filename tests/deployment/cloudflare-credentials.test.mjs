import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = (name) => readFileSync(new URL(`../../.github/workflows/${name}.yml`, import.meta.url), 'utf8');
const action = 'bitwarden/sm-action@1238aae8fc64b212641190a9227c8a734ab1a793';
const secret = '3d8050c9-478f-41b1-aeb6-b4e400d2a1b8 > CLOUDFLARE_API_TOKEN';
const output = (id) => `steps.${id}.outputs.CLOUDFLARE_API_TOKEN`;
const steps = (source) => source.split(/(?=^      - )/m).slice(1);

test('credential retrieval is pinned, output-only and limited to Engineer', () => {
  for (const name of ['deploy-publication', 'preview-image-lightbox', 'cloudflare-credential-check']) {
    const source = workflow(name);
    assert.doesNotMatch(source, /cf_secrets|setup-cloudflare-tools|CF_TRANSIENT_API_TOKEN|CLOUDFLARE_BWS_PROJECT_ID/);
    const retrieval = steps(source).filter((step) => step.includes('uses: bitwarden/sm-action@'));
    assert.ok(retrieval.length > 0, `${name}: official retrieval exists`);
    for (const step of retrieval) {
      assert.ok(step.includes(`uses: ${action}`));
      assert.match(step, /set_env: false/);
      assert.ok(step.includes(secret));
      assert.match(step, /access_token: \$\{\{ secrets\.CLOUDFLARE_BWS_ACCESS_TOKEN \}\}/);
    }
    for (const step of steps(source).filter((step) => step.includes('secrets.CLOUDFLARE_BWS_ACCESS_TOKEN'))) {
      assert.ok(step.includes(`uses: ${action}`), 'bootstrap only enters official retrieval');
    }
  }
  const build = workflow('preview-image-lightbox').split('  build:')[1].split('  deploy:')[0];
  assert.doesNotMatch(build, /secrets\.|bitwarden\/sm-action|CLOUDFLARE_API_TOKEN/);
});

test('production backup, upload, verification and conditional recovery share the retrieved output', () => {
  const production = workflow('deploy-publication').split('  deploy_production:')[1];
  const retrieval = steps(production).find((step) => step.includes(`uses: ${action}`));
  const id = retrieval?.match(/id: ([a-z_]+)/)?.[1];
  assert.ok(id, 'same-job credential output is declared');
  assert.ok(production.indexOf(retrieval) < production.indexOf('Capture current production recovery baseline'));
  for (const operation of ['backup', 'verify', 'rollback']) {
    const step = steps(production).find((step) => step.includes(`publication-production-state.mjs ${operation}`));
    assert.ok(step?.includes(output(id)), `${operation}: explicit step-scoped credential`);
  }
  const upload = steps(production).find((step) => step.includes('uses: cloudflare/wrangler-action@'));
  assert.ok(upload?.includes(output(id)));
  const recovery = steps(production).find((step) => step.includes('publication-production-state.mjs rollback'));
  assert.match(recovery, /if: failure\(\) && steps\.baseline\.outcome == 'success' && steps\.production\.outcome != 'skipped' && steps\.acceptance\.outcome != 'success'/);
});

test('read-only acceptance passes only the retrieved credential to the GET validator', () => {
  const source = workflow('cloudflare-credential-check');
  const retrieval = steps(source).find((step) => step.includes(`uses: ${action}`));
  const id = retrieval?.match(/id: ([a-z_]+)/)?.[1];
  const check = steps(source).find((step) => step.includes('verify_cloudflare_readonly.py pages'));
  assert.ok(id && check?.includes(output(id)));
  assert.doesNotMatch(source, /wrangler|pages deploy|publication-production-state/);
});
