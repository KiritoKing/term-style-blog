import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const workflowPath = new URL('../../.github/workflows/preview-image-lightbox.yml', import.meta.url);

test('feature preview is owned-branch only and keeps build separate from credentials', () => {
  const source = readFileSync(workflowPath, 'utf8');
  assert.match(source, /branches: \[feat\/post-image-lightbox\]/);
  assert.match(source, /github\.repository == 'KiritoKing\/term-style-blog'/);
  assert.match(source, /permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(source, /pull_request_target|repository_dispatch|VAULT_CONTENTS_READ_KEY|NOTION_|build:content|--branch=main/);
  const build = source.split('  build:')[1]?.split('  deploy:')[0];
  assert.ok(build, 'explicit secret-free build job');
  assert.doesNotMatch(build, /secrets\./);
  assert.match(build, /CONTENT_DIR: src\/content\/blog/);
  assert.match(build, /PUBLIC_DEPLOYMENT_ENV: preview/);
  assert.match(source, /--branch=feature-image-lightbox/);
  assert.match(source, /--commit-hash=\$\{\{ github\.sha \}\}/);
  assert.match(source, /ref: \$\{\{ github\.sha \}\}/);
  assert.match(source, /feature-preview\/verify\.mjs/);
});

test('feature preview identity and verifier reject stale/auth/non-preview output', async () => {
  const { validateIdentity, validateOrigin, verifyHtml } = await import('../../scripts/feature-preview/identity.mjs');
  const identity = { framework_sha: 'a'.repeat(40), mode: 'preview', fixture: 'image-lightbox-demo' };
  assert.deepEqual(validateIdentity(identity), identity);
  assert.throws(() => validateIdentity({ ...identity, framework_sha: 'main' }));
  assert.throws(() => validateIdentity({ ...identity, mode: 'production' }));
  assert.throws(() => validateOrigin('https://chlorinec.top', 'notion-astro-rev'));
  assert.throws(() => validateOrigin('https://notion-astro-rev.pages.dev', 'notion-astro-rev'));
  assert.throws(() => validateOrigin('https://foo.notion-astro-rev.pages.dev.evil.test', 'notion-astro-rev'));
  assert.throws(() => validateOrigin('https://user:pass@foo.notion-astro-rev.pages.dev', 'notion-astro-rev'));
  assert.equal(validateOrigin('https://123abc.notion-astro-rev.pages.dev', 'notion-astro-rev'), 'https://123abc.notion-astro-rev.pages.dev');
  const html = '<html data-feature-preview-sha="' + identity.framework_sha + '"><meta name="robots" content="noindex, nofollow"><dialog data-image-lightbox><div class="prose-terminal">image-lightbox-demo</div></dialog></html>';
  assert.equal(verifyHtml(html, identity.framework_sha), true);
  assert.throws(() => verifyHtml(html, 'b'.repeat(40)));
  assert.throws(() => verifyHtml(html.replace('noindex, nofollow', 'index, follow'), identity.framework_sha));
  assert.throws(() => verifyHtml('<html>Cloudflare Access login</html>', identity.framework_sha));
  assert.throws(() => verifyHtml(html.replace('data-image-lightbox', 'other'), identity.framework_sha));
});
