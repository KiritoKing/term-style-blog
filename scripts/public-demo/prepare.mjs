import { mkdir, writeFile } from 'node:fs/promises';
import { ensureDemoProject, inspectStaticAssets } from './control.mjs';

const assets = await inspectStaticAssets('dist');
const project = await ensureDemoProject({ accountId: process.env.CLOUDFLARE_ACCOUNT_ID, token: process.env.CLOUDFLARE_API_TOKEN });
const evidence = { ...project, ...assets };
await mkdir('preview-evidence', { recursive: true });
await writeFile('preview-evidence/project-record.json', JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence));
