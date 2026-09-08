import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  compileRedirectRules,
  type HistoricalUrlMap,
} from '../src/lib/redirects';

const mapPath = fileURLToPath(new URL('./historical-url-map.json', import.meta.url));
const outputPath = fileURLToPath(new URL('../public/_redirects', import.meta.url));
const map = JSON.parse(await fs.readFile(mapPath, 'utf8')) as HistoricalUrlMap;
const rules = compileRedirectRules(map);
await fs.writeFile(
  outputPath,
  `${rules.map((rule) => `${rule.from} ${rule.to} ${rule.status}`).join('\n')}\n`,
  'utf8',
);
console.log(`Generated ${rules.length} permanent redirects in ${outputPath}`);

