const WIKILINK = /\[\[([^\]]+)\]\]/g;

const textNodes = (value, allowedTargets) => {
  const nodes = [];
  let offset = 0;
  for (const match of value.matchAll(WIKILINK)) {
    const index = match.index ?? 0;
    if (index > offset) nodes.push({ type: 'text', value: value.slice(offset, index) });
    const raw = match[1].trim();
    const [destination, explicitLabel] = raw.split('|', 2);
    const [target, heading] = destination.split('#', 2);
    const label = explicitLabel?.trim() || target.trim();
    const slug = allowedTargets.get(target.trim());
    if (slug) {
      const anchor = heading?.trim() ? `#${encodeURIComponent(heading.trim())}` : '';
      nodes.push({
        type: 'link',
        url: `/posts/${slug}${anchor}`,
        children: [{ type: 'text', value: label }],
      });
    } else {
      nodes.push({ type: 'text', value: label });
    }
    offset = index + match[0].length;
  }
  if (offset < value.length) nodes.push({ type: 'text', value: value.slice(offset) });
  return nodes;
};

const visit = (node, allowedTargets) => {
  if (!Array.isArray(node.children)) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text' && WIKILINK.test(child.value)) {
      WIKILINK.lastIndex = 0;
      next.push(...textNodes(child.value, allowedTargets));
    } else {
      if (!['code', 'inlineCode'].includes(child.type)) visit(child, allowedTargets);
      next.push(child);
    }
    WIKILINK.lastIndex = 0;
  }
  node.children = next;
};

export const remarkObsidianWikilinks = ({ targets = [] } = {}) => {
  const allowedTargets = new Map(targets.map(({ name, slug }) => [name, slug]));
  return (tree) => visit(tree, allowedTargets);
};

export const remarkDropLeadingTitle = () => (tree) => {
  if (!Array.isArray(tree.children)) return;
  const index = tree.children.findIndex((node) => node.type !== 'html');
  if (index >= 0 && tree.children[index]?.type === 'heading' && tree.children[index]?.depth === 1) {
    tree.children.splice(index, 1);
  }
};

const isPublicImageUrl = (value) => /^(?:https?:|data:|\/)/i.test(value);

const isRemoteImageUrl = (value) => /^(?:https?:|data:)/i.test(value);

const escapeAttribute = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const replaceLocalImages = (node) => {
  if (!Array.isArray(node.children)) return;
  node.children = node.children.map((child) => {
    if (child.type === 'image') {
      if (!isPublicImageUrl(child.url || '')) {
        return {
          type: 'text',
          value: child.alt ? `[图片待迁移：${child.alt}]` : '[图片待迁移]',
        };
      }

      // Astro optimizes Markdown image nodes during the build, which would make
      // a publication snapshot depend on the availability of the image host.
      // Keep already-public remote assets as ordinary lazy images instead.
      if (isRemoteImageUrl(child.url || '')) {
        const title = child.title ? ` title="${escapeAttribute(child.title)}"` : '';
        return {
          type: 'html',
          value: `<img src="${escapeAttribute(child.url)}" alt="${escapeAttribute(child.alt || '')}"${title} loading="lazy" decoding="async">`,
        };
      }
    }
    replaceLocalImages(child);
    return child;
  });
};

export const remarkPublicationAssets = () => (tree) => replaceLocalImages(tree);
