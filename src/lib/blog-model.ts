export type MarkdownBlogData = {
  title: string;
  slug: string;
  status: 'publish' | 'published';
  category: string;
  tags: string[];
  date: Date;
  summary: string;
  due?: string | null;
  related_content?: string[];
  ai_assisted?: boolean;
  publish: {
    target: 'blog';
    canonical_url?: string;
    published_at?: string;
    updated_at?: string;
  };
};

export type MarkdownBlogEntry = {
  id: string;
  data: MarkdownBlogData;
};

export type BlogMeta = {
  id: string;
  slug?: string;
  title: string;
  date: Date;
  category: string;
  tags: string[];
  description: string;
  status?: 'publish' | 'published';
  relatedContent?: string[];
  updatedAt?: string;
};

export const normalizeMarkdownBlogPost = (post: MarkdownBlogEntry): BlogMeta => ({
  id: post.id,
  slug: post.data.slug.trim(),
  title: post.data.title,
  date: post.data.date,
  category: post.data.category.trim() || 'Uncategorized',
  tags: post.data.tags,
  description: post.data.summary.trim() || post.data.title,
  status: post.data.status,
  relatedContent: post.data.related_content ?? [],
  ...(post.data.publish.updated_at ? { updatedAt: post.data.publish.updated_at } : {}),
});

export const getPostPathSegment = (post: BlogMeta): string => post.slug?.trim() || post.id;

export const getPostPath = (post: BlogMeta): string => `/posts/${getPostPathSegment(post)}`;

export const sortPosts = (posts: BlogMeta[]): BlogMeta[] =>
  posts.slice().sort((a, b) => b.date.getTime() - a.date.getTime());

export const getAdjacentPosts = (
  posts: BlogMeta[],
  slug: string,
): { previous: BlogMeta | null; next: BlogMeta | null } => {
  const sorted = sortPosts(posts);
  const index = sorted.findIndex((post) => post.slug === slug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: sorted[index - 1] ?? null,
    next: sorted[index + 1] ?? null,
  };
};
