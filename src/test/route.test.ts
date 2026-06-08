import { describe, it, expect } from 'vitest';
import { parseRoute, resolveNavigationPath, getPromptPath } from './helpers/route-helpers';

describe('parseRoute', () => {
  it('should return home section for "home"', () => {
    const result = parseRoute('home');
    expect(result).toEqual({ section: 'home' });
  });

  it('should return posts section for "posts"', () => {
    const result = parseRoute('posts');
    expect(result).toEqual({ section: 'posts' });
  });

  it('should return post section with slug for "posts/slug"', () => {
    const result = parseRoute('posts/abc-123');
    expect(result).toEqual({ section: 'post', slug: 'abc-123' });
  });

  it('should return categories section for "categories"', () => {
    const result = parseRoute('categories');
    expect(result).toEqual({ section: 'categories' });
  });

  it('should return category section with slug for "categories/slug"', () => {
    const result = parseRoute('categories/tech');
    expect(result).toEqual({ section: 'category', slug: 'tech' });
  });

  it('should return tags section for "tags"', () => {
    const result = parseRoute('tags');
    expect(result).toEqual({ section: 'tags' });
  });

  it('should return tag section with slug for "tags/slug"', () => {
    const result = parseRoute('tags/javascript');
    expect(result).toEqual({ section: 'tag', slug: 'javascript' });
  });

  it('should return about section for "about"', () => {
    const result = parseRoute('about');
    expect(result).toEqual({ section: 'about' });
  });

  it('should return search section for "search"', () => {
    const result = parseRoute('search');
    expect(result).toEqual({ section: 'search' });
  });

  it('should return home for unknown routes', () => {
    const result = parseRoute('unknown');
    expect(result).toEqual({ section: 'home' });
  });

  it('should return home for empty string', () => {
    const result = parseRoute('');
    expect(result).toEqual({ section: 'home' });
  });
});

describe('resolveNavigationPath', () => {
  it('should return / for home section', () => {
    expect(resolveNavigationPath({ section: 'home' })).toBe('/');
  });

  it('should return /posts for posts section', () => {
    expect(resolveNavigationPath({ section: 'posts' })).toBe('/posts');
  });

  it('should return /categories for categories section', () => {
    expect(resolveNavigationPath({ section: 'categories' })).toBe('/categories');
  });

  it('should return /tags for tags section', () => {
    expect(resolveNavigationPath({ section: 'tags' })).toBe('/tags');
  });

  it('should return /about for about section', () => {
    expect(resolveNavigationPath({ section: 'about' })).toBe('/about');
  });

  it('should return /search for search section', () => {
    expect(resolveNavigationPath({ section: 'search' })).toBe('/search');
  });

  it('should return /posts/slug for post section with slug', () => {
    expect(resolveNavigationPath({ section: 'post', slug: 'xyz' })).toBe('/posts/xyz');
  });

  it('should return /categories/slug for category section with slug', () => {
    expect(resolveNavigationPath({ section: 'category', slug: 'tech' })).toBe('/categories/tech');
  });

  it('should return /tags/slug for tag section with slug', () => {
    expect(resolveNavigationPath({ section: 'tag', slug: 'javascript' })).toBe('/tags/javascript');
  });
});

describe('getPromptPath', () => {
  it('should return /home/guest for home section', () => {
    expect(getPromptPath({ section: 'home' })).toBe('/home/guest');
  });

  it('should return /home/guest/posts for posts section', () => {
    expect(getPromptPath({ section: 'posts' })).toBe('/home/guest/posts');
  });

  it('should return /home/guest/categories for categories section', () => {
    expect(getPromptPath({ section: 'categories' })).toBe('/home/guest/categories');
  });

  it('should return /home/guest/tags for tags section', () => {
    expect(getPromptPath({ section: 'tags' })).toBe('/home/guest/tags');
  });

  it('should return /home/guest/about for about section', () => {
    expect(getPromptPath({ section: 'about' })).toBe('/home/guest/about');
  });

  it('should return /home/guest for search section', () => {
    expect(getPromptPath({ section: 'search' })).toBe('/home/guest');
  });

  it('should return /home/guest/posts/slug for post section', () => {
    expect(getPromptPath({ section: 'post', slug: 'xyz' })).toBe('/home/guest/posts/xyz');
  });

  it('should return /home/guest/categories/slug for category section', () => {
    expect(getPromptPath({ section: 'category', slug: 'tech' })).toBe('/home/guest/categories/tech');
  });

  it('should return /home/guest/tags/slug for tag section', () => {
    expect(getPromptPath({ section: 'tag', slug: 'javascript' })).toBe('/home/guest/tags/javascript');
  });
});

describe('RouteContext type coverage', () => {
  it('should handle all 9 section types in parseRoute', () => {
    const routes = ['home', 'posts', 'categories', 'tags', 'about', 'search'];
    for (const route of routes) {
      const result = parseRoute(route);
      expect(result.section).toBe(route);
    }
  });

  it('should handle slug-based sections correctly', () => {
    const slugRoutes = [
      { input: 'posts/my-post', expected: { section: 'post' as const, slug: 'my-post' } },
      { input: 'categories/tech', expected: { section: 'category' as const, slug: 'tech' } },
      { input: 'tags/javascript', expected: { section: 'tag' as const, slug: 'javascript' } },
    ];

    for (const { input, expected } of slugRoutes) {
      const result = parseRoute(input);
      expect(result).toEqual(expected);
    }
  });
});
