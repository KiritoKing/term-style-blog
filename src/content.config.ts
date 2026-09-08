import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { pathToFileURL } from 'node:url';
import {
  getPublicationContentDir,
  isPublicationCategory,
} from '@/lib/publication';

const contentDir = getPublicationContentDir(process.env.CONTENT_DIR);
const requiredText = (field: string) =>
  z.string().trim().min(1, `required field ${field} must be a non-empty string`);
const category = requiredText('category').refine(
  isPublicationCategory,
  'required field category must not be placeholder Uncategorized',
);

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
      title: requiredText('title'),
      slug: requiredText('slug'),
      status: z.enum(['publish', 'published']),
      source_status: z.string().optional(),
      category,
      tags: z.array(z.string()),
      date: z.coerce.date(),
      due: z.union([z.string(), z.null()]).optional(),
      summary: requiredText('summary'),
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
