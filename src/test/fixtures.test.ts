import { describe, it, expect } from 'vitest';
import { getAllFixturePosts, getFixturePost, getFixturesDir } from '../fixtures/index';
import { blogPostFixtureSchema } from '../fixtures/schema';

describe('Fixture Schema Validation', () => {
  const fixtures = getAllFixturePosts();

  it('should have at least 3 fixture posts', () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(3);
  });

  it('should parse all fixtures without errors', () => {
    for (const fixture of fixtures) {
      const result = blogPostFixtureSchema.safeParse(fixture);
      expect(result.success).toBe(true);
    }
  });

  it('should have valid UUID for all fixture IDs', () => {
    for (const fixture of fixtures) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(fixture.id).toMatch(uuidRegex);
    }
  });

  it('should have valid ISO 8601 dates for all fixtures', () => {
    for (const fixture of fixtures) {
      const date = new Date(fixture.date);
      expect(date.toISOString()).toBeTruthy();
      expect(date.getTime()).not.toBeNaN();
    }
  });

  it('should have non-empty slugs, titles, and categories', () => {
    for (const fixture of fixtures) {
      expect(fixture.slug.length).toBeGreaterThan(0);
      expect(fixture.title.length).toBeGreaterThan(0);
      expect(fixture.category.length).toBeGreaterThan(0);
    }
  });

  it('should have tags as non-empty arrays', () => {
    for (const fixture of fixtures) {
      expect(Array.isArray(fixture.tags)).toBe(true);
      expect(fixture.tags.length).toBeGreaterThan(0);
    }
  });
});

describe('Fixture Loading', () => {
  it('should load a specific fixture by slug', () => {
    const helloWorld = getFixturePost('hello-world');
    expect(helloWorld).not.toBeNull();
    expect(helloWorld?.slug).toBe('hello-world');
    expect(helloWorld?.title).toBe('Hello World');
  });

  it('should return null for non-existent slug', () => {
    const nonExistent = getFixturePost('non-existent-post');
    expect(nonExistent).toBeNull();
  });

  it('should return valid fixtures directory path', () => {
    const dir = getFixturesDir();
    expect(dir).toContain('src/fixtures/blog');
  });

  it('should load all fixture posts with correct structure', () => {
    const allPosts = getAllFixturePosts();
    
    for (const post of allPosts) {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('slug');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('date');
      expect(post).toHaveProperty('category');
      expect(post).toHaveProperty('tags');
      expect(post).toHaveProperty('summary');
    }
  });
});

describe('Fixture Count Validation', () => {
  it('should have a reasonable number of fixtures', () => {
    const fixtures = getAllFixturePosts();
    // Fixture count should be between 3 and 20 for a reasonable test set
    expect(fixtures.length).toBeGreaterThanOrEqual(3);
    expect(fixtures.length).toBeLessThanOrEqual(20);
  });
});