import { describe, expect, it } from 'vitest';
import {
  BLOG_COLLECTION_NAME,
  CONTENT_DIR_ENV,
  MARKDOWN_CONTENT_ROLE,
  PRODUCTION_CONTENT_SOURCE,
} from '../data/contentSource';

describe('content source constants', () => {
  it('uses the blog collection', () => {
    expect(BLOG_COLLECTION_NAME).toBe('blog');
  });

  it('makes the external Markdown snapshot the production source', () => {
    expect(CONTENT_DIR_ENV).toBe('CONTENT_DIR');
    expect(PRODUCTION_CONTENT_SOURCE).toBe('markdown-publication-snapshot');
    expect(MARKDOWN_CONTENT_ROLE).toBe('production-source');
  });
});
