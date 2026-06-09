import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import rehypeShiki from '@shikijs/rehype';
import {
  isLocalContentValidationCommand,
  notionContentLoader,
} from '@/data/notionContentLoader';
import { localContentLoader } from '@/data/localContentLoader';

const notionPagePropertySchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

const notionBlogEntrySchema = z
  .object({
    properties: z.record(z.string(), notionPagePropertySchema),
  })
  .passthrough();

// Determine which loader to use based on the current command
// Local validation mode uses local Markdown fixtures instead of Notion
const useLocalLoader = isLocalContentValidationCommand();

const blog = defineCollection({
  // Production blog content uses Notion; local/e2e mode uses Markdown fixtures.
  loader: useLocalLoader
    ? localContentLoader()
    : notionContentLoader({
        auth: import.meta.env.NOTION_TOKEN,
        data_source_id: import.meta.env.NOTION_DATABASE_ID,
        allowEmptyFallback: false,
        // Use Notion sorting and filtering
        filter: {
          property: 'status',
          select: {
            equals: 'Published',
          },
        },
        rehypePlugins: [
          [
            rehypeShiki,
            {
              theme: 'dracula-soft',
            },
          ],
        ],
        sorts: [{ property: 'date', direction: 'descending' }],
      }),
  schema: notionBlogEntrySchema,
});

export const collections = { blog };
