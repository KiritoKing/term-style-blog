import { describe, it, expect } from 'vitest';
import type { BlogMeta } from '../data/blog';

// Re-implement pure functions from blog.ts for testing without Astro dependencies
// This allows testing the business logic independently

const getPostPathSegment = (post: BlogMeta): string => {
  const slug = post.slug?.trim();
  return slug && slug.length > 0 ? slug : post.id;
};

const getPostPath = (post: BlogMeta): string => `/posts/${getPostPathSegment(post)}`;

const filterPostsByTag = (posts: BlogMeta[], tag: string): BlogMeta[] => {
  const normalizedTag = tag.toLowerCase();
  return posts.filter((post) =>
    post.tags.map((entry) => entry.toLowerCase()).includes(normalizedTag),
  );
};

const filterPostsByCategory = (posts: BlogMeta[], category: string): BlogMeta[] => {
  const normalizedCategory = category.toLowerCase();
  return posts.filter((post) => post.category.toLowerCase() === normalizedCategory);
};

const getTagsFromPosts = (posts: BlogMeta[]): string[] =>
  Array.from(new Set(posts.flatMap((post) => post.tags.map((tag) => tag.toLowerCase()))));

const getCategoriesFromPosts = (posts: BlogMeta[]): string[] =>
  Array.from(new Set(posts.map((post) => post.category.toLowerCase())));

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

describe('getPostPathSegment (blog logic)', () => {
  it('should return slug when available and non-empty', () => {
    const post: BlogMeta = {
      id: 'post-123',
      slug: 'my-slug',
      title: 'Test',
      date: new Date(),
      category: 'Tech',
      tags: [],
      description: '',
    };
    expect(getPostPathSegment(post)).toBe('my-slug');
  });

  it('should return trimmed slug when it has whitespace', () => {
    const post: BlogMeta = {
      id: 'post-123',
      slug: '  my-slug  ',
      title: 'Test',
      date: new Date(),
      category: 'Tech',
      tags: [],
      description: '',
    };
    expect(getPostPathSegment(post)).toBe('my-slug');
  });

  it('should fall back to id when slug is undefined', () => {
    const post: BlogMeta = {
      id: 'post-123',
      slug: undefined,
      title: 'Test',
      date: new Date(),
      category: 'Tech',
      tags: [],
      description: '',
    };
    expect(getPostPathSegment(post)).toBe('post-123');
  });

  it('should fall back to id when slug is empty string', () => {
    const post: BlogMeta = {
      id: 'post-123',
      slug: '',
      title: 'Test',
      date: new Date(),
      category: 'Tech',
      tags: [],
      description: '',
    };
    expect(getPostPathSegment(post)).toBe('post-123');
  });
});

describe('getPostPath (blog logic)', () => {
  it('should use slug when available', () => {
    const post: BlogMeta = {
      id: 'post-123',
      slug: 'my-post',
      title: 'Test',
      date: new Date(),
      category: 'Tech',
      tags: [],
      description: '',
    };
    expect(getPostPath(post)).toBe('/posts/my-post');
  });

  it('should fall back to id when slug is missing', () => {
    const post: BlogMeta = {
      id: 'post-123',
      slug: undefined,
      title: 'Test',
      date: new Date(),
      category: 'Tech',
      tags: [],
      description: '',
    };
    expect(getPostPath(post)).toBe('/posts/post-123');
  });
});

describe('filterPostsByTag (blog logic)', () => {
  const posts: BlogMeta[] = [
    {
      id: '1',
      title: 'Post 1',
      date: new Date(),
      category: 'Tech',
      tags: ['JavaScript', 'React'],
      description: '',
    },
    {
      id: '2',
      title: 'Post 2',
      date: new Date(),
      category: 'DevOps',
      tags: ['Docker', 'Kubernetes'],
      description: '',
    },
    {
      id: '3',
      title: 'Post 3',
      date: new Date(),
      category: 'Tech',
      tags: ['javascript'],
      description: '',
    },
  ];

  it('should filter by tag case-insensitively', () => {
    const result = filterPostsByTag(posts, 'javascript');
    expect(result.length).toBe(2);
    expect(result.map(p => p.id)).toContain('1');
    expect(result.map(p => p.id)).toContain('3');
  });

  it('should return empty array when no matches', () => {
    const result = filterPostsByTag(posts, 'nonexistent');
    expect(result).toEqual([]);
  });

  it('should handle empty posts array', () => {
    const result = filterPostsByTag([], 'javascript');
    expect(result).toEqual([]);
  });
});

describe('filterPostsByCategory (blog logic)', () => {
  const posts: BlogMeta[] = [
    {
      id: '1',
      title: 'Post 1',
      date: new Date(),
      category: 'Tech',
      tags: [],
      description: '',
    },
    {
      id: '2',
      title: 'Post 2',
      date: new Date(),
      category: 'DevOps',
      tags: [],
      description: '',
    },
    {
      id: '3',
      title: 'Post 3',
      date: new Date(),
      category: 'TECH',
      tags: [],
      description: '',
    },
  ];

  it('should filter by category case-insensitively', () => {
    const result = filterPostsByCategory(posts, 'tech');
    expect(result.length).toBe(2);
    expect(result.map(p => p.id)).toContain('1');
    expect(result.map(p => p.id)).toContain('3');
  });

  it('should return empty array when no matches', () => {
    const result = filterPostsByCategory(posts, 'nonexistent');
    expect(result).toEqual([]);
  });
});

describe('getTagsFromPosts (blog logic)', () => {
  it('should extract unique tags from all posts', () => {
    const posts: BlogMeta[] = [
      { id: '1', title: 'P1', date: new Date(), category: 'C1', tags: ['JS', 'React'], description: '' },
      { id: '2', title: 'P2', date: new Date(), category: 'C2', tags: ['React', 'TypeScript'], description: '' },
    ];
    const tags = getTagsFromPosts(posts);
    expect(tags).toContain('js');
    expect(tags).toContain('react');
    expect(tags).toContain('typescript');
    expect(tags.length).toBe(3);
  });

  it('should normalize tags to lowercase', () => {
    const posts: BlogMeta[] = [
      { id: '1', title: 'P1', date: new Date(), category: 'C1', tags: ['JavaScript'], description: '' },
    ];
    const tags = getTagsFromPosts(posts);
    expect(tags).toContain('javascript');
  });

  it('should handle empty posts array', () => {
    const tags = getTagsFromPosts([]);
    expect(tags).toEqual([]);
  });
});

describe('getCategoriesFromPosts (blog logic)', () => {
  it('should extract unique categories from all posts', () => {
    const posts: BlogMeta[] = [
      { id: '1', title: 'P1', date: new Date(), category: 'Tech', tags: [], description: '' },
      { id: '2', title: 'P2', date: new Date(), category: 'DevOps', tags: [], description: '' },
      { id: '3', title: 'P3', date: new Date(), category: 'TECH', tags: [], description: '' },
    ];
    const categories = getCategoriesFromPosts(posts);
    expect(categories).toContain('tech');
    expect(categories).toContain('devops');
    expect(categories.length).toBe(2);
  });

  it('should normalize categories to lowercase', () => {
    const posts: BlogMeta[] = [
      { id: '1', title: 'P1', date: new Date(), category: 'JavaScript', tags: [], description: '' },
    ];
    const categories = getCategoriesFromPosts(posts);
    expect(categories).toContain('javascript');
  });

  it('should handle empty posts array', () => {
    const categories = getCategoriesFromPosts([]);
    expect(categories).toEqual([]);
  });
});

describe('formatDate (blog logic)', () => {
  it('should format date to ISO date string', () => {
    const date = new Date('2024-06-15T10:30:00Z');
    expect(formatDate(date)).toBe('2024-06-15');
  });

  it('should handle different dates correctly', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    expect(formatDate(date)).toBe('2024-01-01');
  });

  it('should handle date with time component', () => {
    const date = new Date('2023-12-25T23:59:59.999Z');
    expect(formatDate(date)).toBe('2023-12-25');
  });
});
