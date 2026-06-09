/**
 * src/data/localContentLoader.ts
 * 
 * Loads Markdown fixture files from src/fixtures/blog/ as the local content source.
 * Used as fallback when Notion credentials are unavailable.
 */

import type { Loader } from 'astro/content/loaders';
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
  const lines = frontmatter.split('\n');
  let currentKey: string | null = null;
  let lastKeyWithEmptyValue: string | null = null;

  // Simple YAML parser for our flat frontmatter format
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for array continuation (lines starting with -)
    if (trimmed.startsWith('-')) {
      const value = trimmed.slice(1).trim().replace(/^['"]|['"]$/g, '');
      // Check if this is a continuation of an array (either inline array started or empty value array started)
      if (currentKey && Array.isArray(data[currentKey])) {
        (data[currentKey] as string[]).push(value);
        continue;
      } else if (lastKeyWithEmptyValue && Array.isArray(data[lastKeyWithEmptyValue])) {
        (data[lastKeyWithEmptyValue] as string[]).push(value);
        lastKeyWithEmptyValue = null;
        continue;
      }
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (!key) continue;

    if (value === '' && trimmed.endsWith(':')) {
      // This is the start of an array (either empty value or multi-line array)
      currentKey = key;
      lastKeyWithEmptyValue = key;
      data[key] = [];
    } else if (value.startsWith('"') && value.endsWith('"')) {
      data[key] = value.slice(1, -1);
      currentKey = key;
      lastKeyWithEmptyValue = null;
    } else if (value.startsWith("'") && value.endsWith("'")) {
      data[key] = value.slice(1, -1);
      currentKey = key;
      lastKeyWithEmptyValue = null;
    } else if (value === 'true') {
      data[key] = true;
      currentKey = key;
      lastKeyWithEmptyValue = null;
    } else if (value === 'false') {
      data[key] = false;
      currentKey = key;
      lastKeyWithEmptyValue = null;
    } else if (!isNaN(Number(value)) && value !== '') {
      data[key] = Number(value);
      currentKey = key;
      lastKeyWithEmptyValue = null;
    } else if (value.startsWith('-')) {
      // Inline array: " - item1, item2"
      data[key] = value.replace(/^-\s*/, '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
      currentKey = key;
      lastKeyWithEmptyValue = null;
    } else {
      data[key] = value;
      currentKey = key;
      lastKeyWithEmptyValue = null;
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
      const entries: LocalBlogEntry[] = [];

      const base = join(process.cwd(), FIXTURE_DIR);

      try {
        const { readdir, readFile: fsRead } = await import('node:fs/promises');
        const files = await readdir(base);

        for (const file of files) {
          if (!file.endsWith('.md')) continue;

          const raw = await fsRead(join(base, file), 'utf-8');
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