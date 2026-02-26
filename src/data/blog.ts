import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export type BlogMeta = {
  id: string;
  slug?: string;
  title: string;
  date: Date;
  category: string;
  tags: string[];
  description: string;
};

type NotionProperty = { type: string } & Record<string, unknown>;

const propertyNames = {
  title: ['Title', 'Name', 'title', 'name'],
  slug: ['Slug', 'slug'],
  date: ['Date', 'date', 'Published', 'published'],
  category: ['Category', 'category'],
  tags: ['Tags', 'tags'],
  description: ['Description', 'description', 'Summary', 'summary'],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getProperty = (
  properties: Record<string, unknown>,
  names: string[],
): NotionProperty | undefined => {
  for (const name of names) {
    const value = properties[name];
    if (isRecord(value) && typeof value.type === 'string') {
      return value as NotionProperty;
    }
  }
  return undefined;
};

const getPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return '';
  return value
    .map((item) =>
      isRecord(item) && typeof item.plain_text === 'string' ? item.plain_text : '',
    )
    .join('');
};

const getSelectName = (value: unknown): string =>
  isRecord(value) && typeof value.name === 'string' ? value.name : '';

const getTitle = (properties: Record<string, unknown>): string => {
  const prop = getProperty(properties, propertyNames.title);
  if (prop?.type === 'title') {
    return getPlainText(prop.title);
  }
  return '';
};

const getDate = (properties: Record<string, unknown>): Date => {
  const prop = getProperty(properties, propertyNames.date);
  if (prop?.type === 'date' && isRecord(prop.date) && typeof prop.date.start === 'string') {
    return new Date(prop.date.start);
  }
  return new Date(0);
};

const getCategory = (properties: Record<string, unknown>): string => {
  const prop = getProperty(properties, propertyNames.category);
  if (prop?.type === 'select') {
    return getSelectName(prop.select);
  }
  if (prop?.type === 'status') {
    return getSelectName(prop.status);
  }
  return '';
};

const getTags = (properties: Record<string, unknown>): string[] => {
  const prop = getProperty(properties, propertyNames.tags);
  if (prop?.type === 'multi_select' && Array.isArray(prop.multi_select)) {
    return prop.multi_select
      .map((item) => (isRecord(item) && typeof item.name === 'string' ? item.name : ''))
      .filter((name) => name.length > 0);
  }
  return [];
};

const getDescription = (properties: Record<string, unknown>): string => {
  const prop = getProperty(properties, propertyNames.description);
  if (prop?.type === 'rich_text') {
    return getPlainText(prop.rich_text);
  }
  return '';
};

const getSlug = (properties: Record<string, unknown>): string | undefined => {
  const prop = getProperty(properties, propertyNames.slug);
  if (prop?.type === 'rich_text') {
    return getPlainText(prop.rich_text);
  }
  return undefined;
};

export const normalizeBlogPost = (post: BlogPost): BlogMeta => {
  const properties =
    isRecord(post.data) && isRecord(post.data.properties) ? post.data.properties : {};
  const title = getTitle(properties) || post.id;
  const date = getDate(properties);
  const category = getCategory(properties) || 'general';
  const tags = getTags(properties);
  const description = getDescription(properties);
  const slug = getSlug(properties);
  return { id: post.id, slug, title, date, category, tags, description };
};

const sortPosts = (posts: BlogMeta[]) =>
  posts.slice().sort((a, b) => b.date.getTime() - a.date.getTime());

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const getAllPosts = async (): Promise<BlogMeta[]> =>
  sortPosts((await getCollection('blog')).map(normalizeBlogPost));

export const getLatestPost = async (): Promise<BlogMeta | null> => {
  const posts = await getAllPosts();
  return posts[0] ?? null;
};

export const getPostEntryById = async (id: string): Promise<BlogPost | undefined> =>
  getEntry('blog', id);

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
