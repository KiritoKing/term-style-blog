export function validateIdentity(identity) {
  if (!identity || !/^[a-f0-9]{40}$/.test(identity.framework_sha) || identity.mode !== 'preview' || identity.fixture !== 'image-lightbox-demo') {
    throw new Error('Invalid immutable public-demo preview identity');
  }
  return identity;
}

export function validateOrigin(value, project) {
  const url = new URL(value);
  if (project !== 'notion-astro-rev' || url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/' || !/^[a-z0-9-]+\.notion-astro-rev\.pages\.dev$/.test(url.hostname)) {
    throw new Error('Expected isolated notion-astro-rev Pages preview origin');
  }
  return url.origin;
}

export function verifyHtml(html, sha) {
  if (!/^[a-f0-9]{40}$/.test(sha) || !html.includes(`data-feature-preview-sha="${sha}"`) || !/<meta\b[^>]*name="robots"[^>]*content="noindex, nofollow"/.test(html) || !html.includes('data-image-lightbox') || !html.includes('prose-terminal')) {
    throw new Error('Hosted output is stale, unindexed policy is missing, or viewer is absent');
  }
  return true;
}
