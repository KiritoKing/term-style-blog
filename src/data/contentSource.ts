export const BLOG_COLLECTION_NAME = 'blog' as const;
export const CONTENT_DIR_ENV = 'CONTENT_DIR' as const;
export const PRODUCTION_CONTENT_SOURCE = 'markdown-publication-snapshot' as const;
export const MARKDOWN_CONTENT_ROLE = 'production-source' as const;

export type ProductionContentSource = typeof PRODUCTION_CONTENT_SOURCE;
export type MarkdownContentRole = typeof MARKDOWN_CONTENT_ROLE;
