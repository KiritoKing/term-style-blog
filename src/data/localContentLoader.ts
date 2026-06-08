/**
 * src/data/localContentLoader.ts
 * 
 * Loads Markdown fixture files from src/fixtures/blog/ as the local content source.
 * Used as fallback when Notion credentials are unavailable.
 */

import type { Loader } from 'astro/loaders';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface LocalBlogEntry {
  id: string;
  slug: string;
  body: string;
  data: {
    id: string;
    slug: string;
    title: string;
    date: string;
    category: string;
    tags: string[];
    description: string;
    properties: {
      title: { type: 'title'; title: Array<{ plain_text: string }> };
      slug: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> };
      date: { type: 'date'; date: { start: string } };
      category: { type: 'select'; select: { name: string } };
      tags: { type: 'multi_select'; multi_select: Array<{ name: string }> };
      description: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> };
    };
  };
}

/**
 * Parse YAML frontmatter from a Markdown file.
 */
function parseFrontmatter(content: string): { data: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: content };
  }

  const [, frontmatter, body] = match;
  const data: Record<string, unknown> = {};

  // Simple YAML parser for our flat frontmatter format
  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      data[key] = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      data[key] = value.slice(1, -1);
    } else if (value === 'true') {
      data[key] = true;
    } else if (value === 'false') {
      data[key] = false;
    } else if (!isNaN(Number(value)) && value !== '') {
      data[key] = Number(value);
    } else if (value.startsWith('-')) {
      // Multi-line array
      data[key] = value.replace(/^-\s*/, '').split(',').map((s) => s.trim());
    } else {
      data[key] = value;
    }
  }

  return { data, body: body.trim() };
}

const FIXTURE_DIR = 'src/fixtures/blog';

/**
 * Creates a Loader that reads Markdown fixture files.
 * Used as fallback when Notion credentials are unavailable.
 */
export function localContentLoader(): Loader {
  return {
    name: 'local-content-loader',
    async load({ store, logger }) {
      // Dynamically import glob to avoid issues when not in Node context
      const { glob } = await import('astro/loaders');
      const base = process.cwd();
      const globLoader = glob({ base, pattern: `**/*.md`, dir: FIXTURE_DIR });

      // Load all fixture files
      const entries: LocalBlogEntry[] = [];

      try {
        const { readdir, readFile: fsRead } = await import('node:fs/promises');
        const files = await readdir(join(base, FIXTURE_DIR));

        for (const file of files) {
          if (!file.endsWith('.md')) continue;

          const raw = await fsRead(join(base, FIXTURE_DIR, file), 'utf-8');
          const { data, body } = parseFrontmatter(raw);

          const id = (data.id as string) || file.replace('.md', '');
          const slug = (data.slug as string) || id;
          const title = (data.title as string) || id;
          const date = (data.date as string) || new Date().toISOString().split('T')[0];
          const category = (data.category as string) || 'general';
          const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];
          const description = (data.description as string) || (data.summary as string) || '';

          const entry: LocalBlogEntry = {
            id,
            slug,
            body,
            data: {
              id,
              slug,
              title,
              date,
              category,
              tags,
              description,
              properties: {
                title: { type: 'title', title: [{ plain_text: title }] },
                slug: { type: 'rich_text', rich_text: [{ plain_text: slug }] },
                date: { type: 'date', date: { start: date } },
                category: { type: 'select', select: { name: category } },
                tags: { type: 'multi_select', multi_select: tags.map((name) => ({ name })) },
                description: { type: 'rich_text', rich_text: [{ plain_text: description }] },
              },
            },
          };

          entries.push(entry);
        }

        logger.info(`Loaded ${entries.length} local fixture posts from ${FIXTURE_DIR}`);
      } catch (err) {
        logger.warn(`Could not read fixture directory ${FIXTURE_DIR}: ${err}`);
      }

      // Store entries in Astro's collection store format
      for (const entry of entries) {
        store.set({
          id: entry.id,
          data: entry.data,
          body: entry.body,
        });
      }
    },
  };
}