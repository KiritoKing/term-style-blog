import { describe, it, expect } from 'vitest';
import {
  BLOG_COLLECTION_NAME,
  PRODUCTION_CONTENT_SOURCE,
  MARKDOWN_CONTENT_ROLE,
  notionBlogPropertyAliases,
} from '../data/contentSource';

describe('Content source constants', () => {
  describe('BLOG_COLLECTION_NAME', () => {
    it('should be "blog"', () => {
      expect(BLOG_COLLECTION_NAME).toBe('blog');
    });
  });

  describe('PRODUCTION_CONTENT_SOURCE', () => {
    it('should be "notion"', () => {
      expect(PRODUCTION_CONTENT_SOURCE).toBe('notion');
    });
  });

  describe('MARKDOWN_CONTENT_ROLE', () => {
    it('should be "non-production-fixture"', () => {
      expect(MARKDOWN_CONTENT_ROLE).toBe('non-production-fixture');
    });
  });
});

describe('notionBlogPropertyAliases', () => {
  it('should have all required field keys', () => {
    expect(notionBlogPropertyAliases).toHaveProperty('title');
    expect(notionBlogPropertyAliases).toHaveProperty('slug');
    expect(notionBlogPropertyAliases).toHaveProperty('date');
    expect(notionBlogPropertyAliases).toHaveProperty('category');
    expect(notionBlogPropertyAliases).toHaveProperty('tags');
    expect(notionBlogPropertyAliases).toHaveProperty('description');
  });

  it('should have non-empty arrays for all aliases', () => {
    for (const [key, aliases] of Object.entries(notionBlogPropertyAliases)) {
      expect(Array.isArray(aliases)).toBe(true);
      expect(aliases.length).toBeGreaterThan(0);
      expect(aliases.every(alias => typeof alias === 'string')).toBe(true);
    }
  });

  it('should have title aliases including common variations', () => {
    const titleAliases = notionBlogPropertyAliases.title;
    expect(titleAliases).toContain('Title');
    expect(titleAliases).toContain('Name');
  });

  it('should have date aliases including common variations', () => {
    const dateAliases = notionBlogPropertyAliases.date;
    expect(dateAliases).toContain('Date');
    expect(dateAliases).toContain('Published');
  });

  it('should have category aliases', () => {
    const categoryAliases = notionBlogPropertyAliases.category;
    expect(categoryAliases).toContain('Category');
  });

  it('should have tags aliases', () => {
    const tagsAliases = notionBlogPropertyAliases.tags;
    expect(tagsAliases).toContain('Tags');
  });

  it('should have description aliases including summary', () => {
    const descriptionAliases = notionBlogPropertyAliases.description;
    expect(descriptionAliases).toContain('Description');
    expect(descriptionAliases).toContain('Summary');
  });

  it('should have slug aliases', () => {
    const slugAliases = notionBlogPropertyAliases.slug;
    expect(slugAliases).toContain('Slug');
  });
});

describe('Type definitions', () => {
  it('should export BlogMetadataField type values correctly', () => {
    // This test validates the type exports match expected string literals
    const expectedFields = ['title', 'slug', 'date', 'category', 'tags', 'description'] as const;
    for (const field of expectedFields) {
      expect(notionBlogPropertyAliases).toHaveProperty(field);
    }
  });
});
