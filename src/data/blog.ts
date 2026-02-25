import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

const sortPosts = (posts: BlogPost[]) =>
  posts.slice().sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const getAllPosts = async (): Promise<BlogPost[]> => sortPosts(await getCollection('blog'));

export const getLatestPost = async (): Promise<BlogPost | null> => {
  const posts = await getAllPosts();
  return posts[0] ?? null;
};

export const getPostById = async (id: string): Promise<BlogPost | undefined> =>
  getEntry('blog', id);

export const getTagsFromPosts = (posts: BlogPost[]): string[] =>
  Array.from(
    new Set(posts.flatMap((post) => post.data.tags.map((tag) => tag.toLowerCase()))),
  );

export const getCategoriesFromPosts = (posts: BlogPost[]): string[] =>
  Array.from(new Set(posts.map((post) => post.data.category.toLowerCase())));

export const filterPostsByTag = (posts: BlogPost[], tag: string): BlogPost[] => {
  const normalizedTag = tag.toLowerCase();
  return posts.filter((post) =>
    post.data.tags.map((entry) => entry.toLowerCase()).includes(normalizedTag),
  );
};

export const filterPostsByCategory = (posts: BlogPost[], category: string): BlogPost[] => {
  const normalizedCategory = category.toLowerCase();
  return posts.filter((post) => post.data.category.toLowerCase() === normalizedCategory);
};
