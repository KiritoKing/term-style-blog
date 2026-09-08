import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { pathToFileURL } from 'node:url';
import { getPublicationContentDir } from '@/lib/publication';

const contentDir = getPublicationContentDir(process.env.CONTENT_DIR);

const blog = defineCollection({
  loader: glob({
    base: pathToFileURL(`${contentDir}/`),
    pattern: '**/*.md',
    generateId: ({ data, entry }) =>
      typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : entry,
  }),
  schema: z
    .object({
      type: z.string().optional(),
      title: z.string().min(1),
      slug: z.string().min(1),
      status: z.enum(['publish', 'published']),
      source_status: z.string().optional(),
      category: z.string(),
      tags: z.array(z.string()),
      date: z.coerce.date(),
      due: z.union([z.string(), z.null()]).optional(),
      summary: z.string(),
      related_content: z.array(z.string()).default([]),
      source_briefs: z.array(z.string()).optional(),
      ai_assisted: z.boolean().optional(),
      publish: z
        .object({
          target: z.literal('blog'),
          canonical_url: z.string().optional(),
          published_at: z
            .union([z.string(), z.date()])
            .transform((value) => (value instanceof Date ? value.toISOString() : value))
            .optional(),
          updated_at: z
            .union([z.string(), z.date()])
            .transform((value) => (value instanceof Date ? value.toISOString() : value))
            .optional(),
        })
        .passthrough(),
      source_notion_url: z.string().optional(),
      source_notion_id: z.string().optional(),
    })
    .passthrough(),
});

export const collections = { blog };
