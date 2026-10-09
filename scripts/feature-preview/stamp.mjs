import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateIdentity } from './identity.mjs';

const identity = validateIdentity({ framework_sha: process.env.FRAMEWORK_SHA, mode: 'preview', fixture: 'image-lightbox-demo' });
let pages = 0;
async function stamp(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await stamp(path);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      await writeFile(path, html.replace(/<html\b/, `<html data-feature-preview-sha="${identity.framework_sha}"`));
      pages++;
    }
  }
}
await stamp('dist');
await writeFile('dist/_feature-preview.json', JSON.stringify({ ...identity, content_source: 'repository-demo', pages }, null, 2) + '\n');
console.log(JSON.stringify({ ...identity, pages }));
