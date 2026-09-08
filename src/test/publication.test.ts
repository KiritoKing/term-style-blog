import { describe, expect, it } from 'vitest';
import {
  extractWikilinks,
  getPublicationContentDir,
  validatePublicationRecords,
  type PublicationRecord,
} from '@/lib/publication';

const record = (overrides: Partial<PublicationRecord> = {}): PublicationRecord => ({
  path: 'post.md',
  data: {
    title: '测试文章',
    slug: 'Exact-Slug',
    status: 'published',
    category: 'Development',
    tags: ['Astro'],
    date: '2026-09-09',
    summary: '摘要',
    publish: { target: 'blog' },
  },
  body: '# 测试文章\n\n正文',
  ...overrides,
});

describe('publication source', () => {
  it('uses the explicit CONTENT_DIR without changing it', () => {
    expect(getPublicationContentDir('/tmp/snapshot/20-writing/published')).toBe(
      '/tmp/snapshot/20-writing/published',
    );
  });

  it('uses repository fixtures only when CONTENT_DIR is absent', () => {
    expect(getPublicationContentDir(undefined)).toMatch(/src\/content\/blog$/);
  });

  it('accepts both approved publication states', () => {
    expect(
      validatePublicationRecords([
        record(),
        record({
          path: 'new.md',
          data: { ...record().data, slug: 'new', status: 'publish' },
        }),
      ]),
    ).toMatchObject({ total: 2, publish: 1, published: 1 });
  });

  it.each(['publish', 'published'] as const)(
    'requires category and summary uniformly for %s entries',
    (status) => {
      for (const [field, value] of [
        ['category', undefined],
        ['category', ''],
        ['category', '   '],
        ['category', 'Uncategorized'],
        ['category', ' uncategorized '],
        ['summary', undefined],
        ['summary', ''],
        ['summary', '   '],
      ] as const) {
        expect(() =>
          validatePublicationRecords([
            record({
              path: `${status}-${field}.md`,
              data: { ...record().data, status, [field]: value },
            }),
          ]),
        ).toThrow(new RegExp(`${status}-${field}\\.md: required field ${field}`));
      }
    },
  );

  it.each([
    ['draft state', record({ data: { ...record().data, status: 'draft' } })],
    ['wrong target', record({ data: { ...record().data, publish: { target: 'wechat' } } })],
    ['merge marker', record({ body: '<<<<<<< HEAD\nprivate\n=======' })],
  ])('rejects %s', (_label, input) => {
    expect(() => validatePublicationRecords([input])).toThrow();
  });

  it('reports local images for asset mapping without copying them', () => {
    const validation = validatePublicationRecords([record({ body: '![](./private.png)' })]);
    expect(validation.warnings).toContainEqual(expect.stringMatching(/local image/i));
    expect(validation.assetWarnings).toHaveLength(1);
  });

  it.each([
    ['relative Markdown image', '![](./private.png)'],
    ['Obsidian image embed', '![[private.png]]'],
    [
      'malformed HTML image URL',
      '<img src="[https://img.chlorinec.top/a.png](https://img.chlorinec.top/a.png)">',
    ],
  ])('rejects %s in strict asset mode', (_label, body) => {
    expect(() => validatePublicationRecords([record({ body })], { strictAssets: true })).toThrow(
      /unresolved publication assets/i,
    );
  });

  it('does not require the image host for already-public URLs', () => {
    expect(
      validatePublicationRecords([record({ body: '![](https://img.chlorinec.top/public.png)' })], {
        strictAssets: true,
      }).assetWarnings,
    ).toEqual([]);
  });

  it('rejects duplicate exact slugs', () => {
    expect(() =>
      validatePublicationRecords([
        record(),
        record({ path: 'copy.md', data: { ...record().data } }),
      ]),
    ).toThrow(/duplicate slug/i);
  });

  it('reports wikilinks outside the approved set without making them public links', () => {
    expect(
      validatePublicationRecords([record({ body: 'See [[private-health-note]].' })]).warnings,
    ).toContainEqual(expect.stringMatching(/unresolved wikilink/i));
  });

  it('accepts aliases and extracts labels and heading anchors', () => {
    const linked = record({
      body: 'See [[测试文章#章节|这篇文章]].',
    });
    expect(extractWikilinks(linked.body)).toEqual([
      { target: '测试文章', heading: '章节', label: '这篇文章' },
    ]);
    expect(validatePublicationRecords([linked]).total).toBe(1);
  });
});
