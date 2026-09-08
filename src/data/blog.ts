import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import {
  normalizeMarkdownBlogPost,
  sortPosts,
  type BlogMeta,
} from '@/lib/blog-model';

export type BlogPost = CollectionEntry<'blog'>;
export type { BlogMeta } from '@/lib/blog-model';
export { getAdjacentPosts, getPostPath, getPostPathSegment } from '@/lib/blog-model';

export const normalizeBlogPost = (post: BlogPost): BlogMeta =>
  normalizeMarkdownBlogPost(post);

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const getAllPosts = async (): Promise<BlogMeta[]> =>
  sortPosts((await getCollection('blog')).map(normalizeBlogPost));

export const getLatestPost = async (): Promise<BlogMeta | null> => {
  const posts = await getAllPosts();
  return posts[0] ?? null;
};

export const getPostEntryById = async (id: string): Promise<BlogPost | undefined> =>
  getEntry('blog', id);

export const getPostEntryBySlugOrId = async (
  slugOrId: string,
): Promise<BlogPost | undefined> => getEntry('blog', slugOrId);

export const getPostById = async (id: string): Promise<BlogMeta | null> => {
  const post = await getPostEntryById(id);
  return post ? normalizeBlogPost(post) : null;
};

export const getTagsFromPosts = (posts: BlogMeta[]): string[] =>
  Array.from(new Set(posts.flatMap((post) => post.tags.map((tag) => tag.toLowerCase()))));

export const getCategoriesFromPosts = (posts: BlogMeta[]): string[] =>
  Array.from(new Set(posts.map((post) => post.category.toLowerCase())));

export const filterPostsByTag = (posts: BlogMeta[], tag: string): BlogMeta[] => {
  const normalizedTag = tag.toLowerCase();
  return posts.filter((post) =>
    post.tags.map((entry) => entry.toLowerCase()).includes(normalizedTag),
  );
};

export const filterPostsByCategory = (posts: BlogMeta[], category: string): BlogMeta[] => {
  const normalizedCategory = category.toLowerCase();
  return posts.filter((post) => post.category.toLowerCase() === normalizedCategory);
};
