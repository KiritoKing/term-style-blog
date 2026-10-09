import { promises as fs } from 'node:fs';
import { siteConfig } from '../site.config';
import { fileURLToPath } from 'node:url';
import {
  compileRedirectRules,
  type HistoricalUrlMap,
} from '../src/lib/redirects';

const mapPath = siteConfig.redirectsFile;
const outputPath = fileURLToPath(new URL('../public/_redirects', import.meta.url));
const map: HistoricalUrlMap = mapPath ? JSON.parse(await fs.readFile(mapPath, 'utf8')) : {};
const rules = compileRedirectRules(map);
await fs.writeFile(
  outputPath,
  `${rules.map((rule) => `${rule.from} ${rule.to} ${rule.status}`).join('\n')}\n`,
  'utf8',
);
console.log(`Generated ${rules.length} permanent redirects in ${outputPath}`);

