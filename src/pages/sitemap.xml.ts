import type { APIRoute } from 'astro';
import {
  getAllPosts,
  getCategoriesFromPosts,
  getPostPath,
  getTagsFromPosts,
} from '@/data/blog';
import { site } from '@/lib/site';

const escapeXml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const staticPaths = ['/', '/posts', '/archive', '/categories', '/tags', '/about', '/search'];
  const paths = [
    ...staticPaths,
    ...posts.map(getPostPath),
    ...getCategoriesFromPosts(posts).map((category) => `/categories/${category}`),
    ...getTagsFromPosts(posts).map((tag) => `/tags/${tag}`),
  ];
  const urls = paths
    .map((pathname) => `<url><loc>${escapeXml(new URL(pathname, site.origin).toString())}</loc></url>`)
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};

