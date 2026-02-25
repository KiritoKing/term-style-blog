import { defineCollection, z } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { notionLoader } from '@ntcho/notion-astro-loader';


const blog = defineCollection({
loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_DATABASE_ID,
    // Use Notion sorting and filtering
    filter: {
      property: 'status',
      select: {
        equals: 'Published',
      },
    },
    sorts: [{ property: 'date', direction: 'descending' }],
  }),
});

export const collections = { blog };
