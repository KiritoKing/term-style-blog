import { defineCollection, z } from 'astro:content';
import { notionLoader } from '@astro-notion/loader';
import rehypeShiki from '@shikijs/rehype';


const blog = defineCollection({
loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    data_source_id: import.meta.env.NOTION_DATABASE_ID,
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
});

export const collections = { blog };
