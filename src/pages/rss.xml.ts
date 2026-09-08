import type { APIRoute } from 'astro';
import { formatDate, getAllPosts, getPostPath } from '@/data/blog';
import { site } from '@/lib/site';

const xml = (value: string): string =>
  value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[character] ?? character);

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const items = posts
    .map((post) => {
      const url = new URL(getPostPath(post), site.origin).toString();
      return `<item><title>${xml(post.title)}</title><link>${xml(url)}</link><guid>${xml(url)}</guid><pubDate>${post.date.toUTCString()}</pubDate><description>${xml(post.description)}</description></item>`;
    })
    .join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(site.title)}</title><link>${site.origin}</link><description>${xml(site.description)}</description><language>zh-CN</language><lastBuildDate>${posts[0] ? new Date(`${formatDate(posts[0].date)}T00:00:00Z`).toUTCString() : new Date(0).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};

