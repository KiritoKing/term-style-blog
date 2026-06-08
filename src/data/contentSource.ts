export const BLOG_COLLECTION_NAME = 'blog' as const;

export const PRODUCTION_CONTENT_SOURCE = 'notion' as const;

export const MARKDOWN_CONTENT_ROLE = 'non-production-fixture' as const;

export type ProductionContentSource = typeof PRODUCTION_CONTENT_SOURCE;

export type MarkdownContentRole = typeof MARKDOWN_CONTENT_ROLE;

export type BlogMetadataField =
  | 'title'
  | 'slug'
  | 'date'
  | 'category'
  | 'tags'
  | 'description';

export const notionBlogPropertyAliases = {
  title: ['Title', 'Name', 'title', 'name'],
  slug: ['Slug', 'slug'],
  date: ['Date', 'date', 'Published', 'published'],
  category: ['Category', 'category'],
  tags: ['Tags', 'tags'],
  description: ['Description', 'description', 'Summary', 'summary'],
} as const satisfies Record<BlogMetadataField, readonly string[]>;
