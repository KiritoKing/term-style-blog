import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('owner publication builds explicitly retain their profile and existing production gates', () => {
  const workflow = readFileSync('.github/workflows/deploy-publication.yml', 'utf8');
  for (const job of ['build_preview', 'deploy_production']) {
    // Profile is a job env setting, not a mutable dispatch input.
    const section = workflow.slice(workflow.indexOf(`  ${job}:`));
    assert.match(section.split(/\n  \w+:/)[0], /SITE_PROFILE: chlorine/);
  }
  assert.match(workflow, /github\.repository == 'KiritoKing\/term-style-blog'/);
  assert.match(workflow, /refs\/heads\/main/);
  assert.match(workflow, /Recheck freshness immediately before production upload/);
});
test('theme review preview is synthetic, owned, noindex and isolated from production', () => {
  const workflow = readFileSync('.github/workflows/preview-theme.yml', 'utf8');
  assert.match(workflow, /branches: \[feat\/reusable-astro-theme\]/);
  assert.match(workflow, /CONTENT_DIR: src\/content\/blog/);
  assert.match(workflow, /SITE_PROFILE: template/);
  assert.match(workflow, /PUBLIC_DEPLOYMENT_ENV: preview/);
  assert.match(workflow, /--branch=feature-reusable-theme/);
  assert.doesNotMatch(workflow, /PRIVATE_CONTENT|CONTENT_DEPLOY_KEY|--branch=main|environment: production/);
  assert.doesNotMatch(workflow.split('\n  deploy:')[0], /secrets\./);
  assert.match(workflow, /CF_ACCESS_CLIENT_SECRET/);
});

test('unprivileged CI exercises both profiles with synthetic content', () => {
  const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
  assert.match(workflow, /\n  verify:\n/); // Preserve the existing required CI context.
  assert.match(workflow, /SITE_PROFILE: template/);
  assert.match(workflow, /SITE_PROFILE: chlorine/);
  assert.match(workflow, /CONTENT_DIR: src\/content\/blog/);
  assert.doesNotMatch(workflow, /secrets\.|pull_request_target|VAULT_CONTENTS_READ_KEY/);
});
