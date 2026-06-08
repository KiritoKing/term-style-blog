import fs from 'node:fs';
import path from 'node:path';
import type { BlogPostFixture } from './schema';
import { blogPostFixtureSchema } from './schema';

const FIXTURES_DIR = path.resolve(process.cwd(), 'src/fixtures/blog');

/**
 * Extracts frontmatter from a Markdown file.
 * Simple implementation without external dependencies.
 */
function parseFrontmatter(content: string): Record<string, unknown> {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  
  if (!frontmatterMatch) {
    throw new Error('No frontmatter found in fixture file');
  }
  
  const frontmatterStr = frontmatterMatch[1];
  const result: Record<string, unknown> = {};
  
  // Simple YAML-like parsing
  const lines = frontmatterStr.split(/\r?\n/);
  let currentKey: string | null = null;
  let inArray = false;
  let arrayValues: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Empty line
    if (!trimmedLine) continue;
    
    // Array item
    if (trimmedLine.startsWith('- ')) {
      if (!inArray) {
        inArray = true;
        arrayValues = [];
      }
      arrayValues.push(trimmedLine.slice(2).trim());
      continue;
    }
    
    // Flush array if we hit a non-array line
    if (inArray && currentKey) {
      result[currentKey] = arrayValues;
      inArray = false;
      arrayValues = [];
    }
    
    // Key-value pair
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.slice(0, colonIndex).trim();
      const value = trimmedLine.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      result[key] = cleanValue;
      currentKey = key;
    }
  }
  
  // Flush final array
  if (inArray && currentKey) {
    result[currentKey] = arrayValues;
  }
  
  return result;
}

/**
 * Loads a single fixture post by slug.
 */
export function getFixturePost(slug: string): BlogPostFixture | null {
  const filePath = path.join(FIXTURES_DIR, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  const result = blogPostFixtureSchema.safeParse(frontmatter);
  
  if (!result.success) {
    console.warn(`Fixture "${slug}" has invalid schema:`, result.error.errors);
    return null;
  }
  
  return result.data;
}

/**
 * Loads all fixture posts.
 */
export function getAllFixturePosts(): BlogPostFixture[] {
  if (!fs.existsSync(FIXTURES_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.md'));
  const posts: BlogPostFixture[] = [];
  
  for (const file of files) {
    const slug = path.basename(file, '.md');
    const post = getFixturePost(slug);
    if (post) {
      posts.push(post);
    }
  }
  
  return posts;
}

/**
 * Gets the fixtures directory path.
 */
export function getFixturesDir(): string {
  return FIXTURES_DIR;
}