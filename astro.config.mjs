import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import icon from 'astro-icon';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import {
  remarkDropLeadingTitle,
  remarkObsidianWikilinks,
  remarkPublicationAssets,
} from './src/lib/remark-obsidian-wikilinks.mjs';
import { compileRedirectRules } from './src/lib/redirects.ts';

const contentDir = path.resolve(process.env.CONTENT_DIR || 'src/content/blog');
const map = JSON.parse(readFileSync('./scripts/historical-url-map.json', 'utf8'));
const redirects = Object.fromEntries(
  compileRedirectRules(map).map(({ from, to, status }) => [
    from,
    { destination: to, status },
  ]),
);

const markdownFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  });

const wikiTargets = markdownFiles(contentDir).flatMap((file) => {
  const { data } = matter(readFileSync(file, 'utf8'));
  if (typeof data.slug !== 'string' || typeof data.title !== 'string') return [];
  const slug = data.slug.trim();
  const filename = path.basename(file, path.extname(file));
  return [
    { name: slug, slug },
    { name: data.title.trim(), slug },
    { name: filename, slug },
  ];
});

export default defineConfig({
  compressHTML: true,
  site: 'https://chlorinec.top/',
  trailingSlash: 'never',
  redirects,
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.chlorinec.top' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { limitInputPixels: false },
    },
  },
  integrations: [
    react(),
    icon({ include: { lucide: ['*'] } }),
  ],
  markdown: {
    shikiConfig: { theme: 'dracula-soft' },
    processor: unified({
      remarkPlugins: [
        remarkGfm,
        remarkDropLeadingTitle,
        remarkPublicationAssets,
        [remarkObsidianWikilinks, { targets: wikiTargets }],
      ],
    }),
  },
  vite: {
    plugins: [tailwind()],
    resolve: { alias: { '@': path.resolve('./src') } },
  },
});
