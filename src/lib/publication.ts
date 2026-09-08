import path from 'node:path';

export type PublicationData = {
  title?: unknown;
  slug?: unknown;
  status?: unknown;
  category?: unknown;
  tags?: unknown;
  date?: unknown;
  summary?: unknown;
  publish?: unknown;
};

export type PublicationRecord = {
  path: string;
  data: PublicationData;
  body: string;
};

export type Wikilink = {
  target: string;
  heading?: string;
  label?: string;
};

export type PublicationValidation = {
  total: number;
  publish: number;
  published: number;
  warnings: string[];
  assetWarnings: string[];
};

export type PublicationValidationOptions = {
  strictAssets?: boolean;
};

const fixtureContentDir = path.resolve('src/content/blog');

export const getPublicationContentDir = (contentDir: string | undefined): string =>
  contentDir?.trim() ? path.resolve(contentDir) : fixtureContentDir;

const removeCode = (body: string): string =>
  body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]+`/g, '');

export const extractWikilinks = (body: string): Wikilink[] => {
  const links: Wikilink[] = [];
  for (const match of removeCode(body).matchAll(/\[\[([^\]]+)\]\]/g)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    const [destination = '', label] = raw.split('|', 2);
    const [target = '', heading] = destination.split('#', 2);
    if (!target.trim()) continue;
    links.push({
      target: target.trim(),
      ...(heading?.trim() ? { heading: heading.trim() } : {}),
      ...(label?.trim() ? { label: label.trim() } : {}),
    });
  }
  return links;
};

const hasConflictMarker = (body: string): boolean =>
  /^(<{7}|={7}|>{7})(?:\s|$)/m.test(body);

const getLocalImages = (body: string): string[] => {
  const source = removeCode(body);
  const images = new Set<string>();
  for (const match of source.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const value = match[1]?.trim().split(/\s+/)[0] ?? '';
    if (value && !/^(?:https?:|data:|\/)/i.test(value)) images.add(value);
  }
  for (const match of source.matchAll(/!\[\[([^\]]+)\]\]/g)) {
    const value = match[1]?.trim().split('|', 1)[0] ?? '';
    if (value) images.add(value);
  }
  for (const match of source.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const value = match[1]?.trim() ?? '';
    if (/^\[https?:[^\]]+\]\(https?:[^)]+\)$/i.test(value)) {
      images.add(`malformed HTML src ${value}`);
    } else if (value && !/^(?:https?:|data:|\/)/i.test(value)) {
      images.add(value);
    }
  }
  return [...images];
};

const stringField = (value: unknown, field: string, file: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file}: required field ${field} must be a non-empty string`);
  }
  return value.trim();
};

const targetOf = (value: unknown): unknown =>
  typeof value === 'object' && value !== null && 'target' in value
    ? (value as { target?: unknown }).target
    : undefined;

export const validatePublicationRecords = (
  records: PublicationRecord[],
  options: PublicationValidationOptions = {},
): PublicationValidation => {
  if (records.length === 0) throw new Error('publication snapshot contains zero Markdown files');

  const identities = new Set<string>();
  const slugs = new Map<string, string>();
  const compatibilityWarnings: string[] = [];
  const normalized = records.map((record) => {
    const title = stringField(record.data.title, 'title', record.path);
    const slug = stringField(record.data.slug, 'slug', record.path);
    const category = typeof record.data.category === 'string' ? record.data.category.trim() : '';
    const summary = typeof record.data.summary === 'string' ? record.data.summary.trim() : '';
    if (!Array.isArray(record.data.tags)) {
      throw new Error(`${record.path}: required field tags must be an array`);
    }
    if (!(typeof record.data.date === 'string' || record.data.date instanceof Date)) {
      throw new Error(`${record.path}: required field date must be a date string`);
    }
    if (record.data.status !== 'publish' && record.data.status !== 'published') {
      throw new Error(`${record.path}: status must be publish or published`);
    }
    if (record.data.status === 'publish' && (!category || !summary)) {
      throw new Error(`${record.path}: new publish entries require non-empty category and summary`);
    }
    if (!category) compatibilityWarnings.push(`${record.path}: empty historical category; using Uncategorized`);
    if (!summary) compatibilityWarnings.push(`${record.path}: empty historical summary; using title`);
    if (targetOf(record.data.publish) !== 'blog') {
      throw new Error(`${record.path}: publish.target must be blog`);
    }
    const previous = slugs.get(slug);
    if (previous) throw new Error(`duplicate slug ${slug}: ${previous}, ${record.path}`);
    slugs.set(slug, record.path);
    identities.add(slug);
    identities.add(title);
    identities.add(path.basename(record.path, path.extname(record.path)));
    if (hasConflictMarker(record.body)) {
      throw new Error(`${record.path}: merge conflict marker found`);
    }
    return { record, status: record.data.status };
  });

  const warnings: string[] = [...compatibilityWarnings];
  const assetWarnings: string[] = [];
  for (const { record } of normalized) {
    for (const link of extractWikilinks(record.body)) {
      if (!identities.has(link.target)) {
        warnings.push(`${record.path}: unresolved wikilink ${link.target}; rendered as text`);
      }
    }
    for (const image of getLocalImages(record.body)) {
      assetWarnings.push(`${record.path}: local image requires publication asset mapping: ${image}`);
    }
  }

  warnings.push(...assetWarnings);
  if (options.strictAssets && assetWarnings.length > 0) {
    throw new Error(`unresolved publication assets:\n${assetWarnings.join('\n')}`);
  }

  return {
    total: records.length,
    publish: normalized.filter(({ status }) => status === 'publish').length,
    published: normalized.filter(({ status }) => status === 'published').length,
    warnings,
    assetWarnings,
  };
};
