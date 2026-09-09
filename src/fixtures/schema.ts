import { z } from 'astro/zod';

/**
 * Blog post fixture schema matching the Notion content schema.
 * This ensures fixtures stay in sync with the production content model.
 */
export const blogPostFixtureSchema = z.object({
  id: z.string().uuid('Fixture ID must be a valid UUID'),
  slug: z.string().min(1, 'Slug cannot be empty'),
  title: z.string().min(1, 'Title cannot be empty'),
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Date must be a valid ISO 8601 date'
  ),
  category: z.string().min(1, 'Category cannot be empty'),
  tags: z.array(z.string()),
  summary: z.string().optional(),
});

export type BlogPostFixture = z.infer<typeof blogPostFixtureSchema>;

/**
 * Validates a fixture file's frontmatter against the schema.
 */
export function validateFixture(frontmatter: unknown): {
  success: boolean;
  data?: BlogPostFixture;
  errors?: string[];
} {
  const result = blogPostFixtureSchema.safeParse(frontmatter);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.issues.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    ),
  };
}
