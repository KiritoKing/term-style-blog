import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  getPublicationContentDir,
  validatePublicationRecords,
  type PublicationData,
  type PublicationRecord,
} from '../src/lib/publication';

const collectMarkdown = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectMarkdown(target);
      return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
    }),
  );
  return nested.flat().sort();
};

const requireExternal = process.argv.includes('--require-external');
if (requireExternal && !process.env.CONTENT_DIR?.trim()) {
  throw new Error('CONTENT_DIR is required for an external publication build');
}

const contentDir = getPublicationContentDir(process.env.CONTENT_DIR);
const files = await collectMarkdown(contentDir).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`cannot read publication source ${contentDir}: ${message}`);
});
const records: PublicationRecord[] = await Promise.all(
  files.map(async (file) => {
    const source = await fs.readFile(file, 'utf8');
    const parsed = matter(source);
    return {
      path: path.relative(contentDir, file),
      data: parsed.data as PublicationData,
      body: parsed.content,
    };
  }),
);

const strictAssets =
  process.env.PUBLIC_DEPLOYMENT_ENV === 'production' || process.env.STRICT_CONTENT_ASSETS === '1';
const result = validatePublicationRecords(records, { strictAssets });
const expectedCount = process.env.EXPECTED_CONTENT_COUNT
  ? Number(process.env.EXPECTED_CONTENT_COUNT)
  : undefined;
if (expectedCount !== undefined && result.total !== expectedCount) {
  throw new Error(`expected ${expectedCount} articles, found ${result.total}`);
}

for (const warning of result.warnings) console.warn(`[content warning] ${warning}`);
console.log(
  `Validated ${result.total} Markdown articles (${result.published} published, ${result.publish} publish) from ${contentDir}`,
);
