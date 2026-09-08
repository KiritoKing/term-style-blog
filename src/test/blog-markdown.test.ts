import { describe, expect, it } from 'vitest';
import {
  getAdjacentPosts,
  getPostPath,
  normalizeMarkdownBlogPost,
  type MarkdownBlogEntry,
} from '@/lib/blog-model';

const entry = (slug: string, date: string): MarkdownBlogEntry => ({
  id: `${slug}.md`,
  data: {
    title: slug,
    slug,
    status: 'published',
    category: 'Development',
    tags: [],
    date: new Date(date),
    summary: `${slug} summary`,
    related_content: [],
    publish: { target: 'blog', canonical_url: '' },
  },
});

describe('Markdown blog model', () => {
  it('keeps exact case and Unicode in canonical routes', () => {
    expect(getPostPath(normalizeMarkdownBlogPost(entry('KeePass', '2024-01-01')))).toBe(
      '/posts/KeePass',
    );
    expect(getPostPath(normalizeMarkdownBlogPost(entry('中文-文章', '2024-01-01')))).toBe(
      '/posts/中文-文章',
    );
  });

  it('maps summary to public description without exposing source ids', () => {
    const post = normalizeMarkdownBlogPost(entry('post', '2024-01-01'));
    expect(post.description).toBe('post summary');
    expect(post).not.toHaveProperty('source_notion_id');
  });

  it('refuses invalid category instead of inventing Uncategorized', () => {
    expect(() =>
      normalizeMarkdownBlogPost({
        ...entry('invalid-category', '2024-01-01'),
        data: { ...entry('invalid-category', '2024-01-01').data, category: '   ' },
      }),
    ).toThrow(/invalid-category\.md: required field category/);
  });

  it('refuses blank summary instead of substituting the title', () => {
    expect(() =>
      normalizeMarkdownBlogPost({
        ...entry('invalid-summary', '2024-01-01'),
        data: { ...entry('invalid-summary', '2024-01-01').data, summary: '' },
      }),
    ).toThrow(/invalid-summary\.md: required field summary/);
  });

  it('provides chronological adjacent navigation', () => {
    const posts = [
      normalizeMarkdownBlogPost(entry('new', '2026-01-01')),
      normalizeMarkdownBlogPost(entry('middle', '2025-01-01')),
      normalizeMarkdownBlogPost(entry('old', '2024-01-01')),
    ];
    expect(getAdjacentPosts(posts, 'middle')).toEqual({ previous: posts[0], next: posts[2] });
  });

});
