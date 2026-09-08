import { promises as fs } from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.env.AUDIT_DIST || 'dist');
const origin = process.env.AUDIT_ORIGIN || 'http://127.0.0.1:4324';
const retired = new Set((process.env.AUDIT_RETIRED_TARGETS || '').split(',').filter(Boolean).map(target => new URL(target, origin).href));
const output = path.resolve(process.env.AUDIT_OUTPUT || 'test-results/visual-audit');
async function walk(dir) {
  return (await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(entry =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
const jobs = [];
for (const file of (await walk(root)).filter(file => file.endsWith('.html'))) {
  const html = await fs.readFile(file, 'utf8');
  const target = html.match(/http-equiv=["']refresh["'][^>]*content=["']\d+;\s*url=([^"']+)/i)?.[1];
  if (target) jobs.push({ route: '/' + path.relative(root, file).replace(/index\.html$/, '').replace(/\/$/, ''), target });
}
let cursor = 0;
const results = [];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    const record = { ...job, status: 'fail' };
    try {
      const response = await fetch(new URL(job.route, origin), { redirect: 'manual' });
      record.http = response.status;
      record.location = response.headers.get('location');
      const expected = new URL(job.target, origin);
      const actual = record.location ? new URL(record.location, origin) : null;
      if (![301, 302, 307, 308].includes(response.status) || actual?.href !== expected.href) {
        throw new Error('HTTP redirect does not match generated destination');
      }
      const destination = await fetch(expected);
      record.destinationHttp = destination.status;
      if (destination.status === 404 && retired.has(expected.href)) { record.status = 'retired-404'; }
      else if (destination.status !== 200) throw new Error('Redirect destination is unavailable');
      else record.status = 'pass';
    } catch (error) { record.error = String(error.message); }
    results.push(record);
  }
}));
await fs.mkdir(output, { recursive: true });
const report = { expected: jobs.length, completed: results.length, failed: results.filter(r => !['pass', 'retired-404'].includes(r.status)).length, results };
await fs.writeFile(path.join(output, 'redirects.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ expected: report.expected, completed: report.completed, failed: report.failed }));
if (!jobs.length || report.failed) process.exitCode = 1;
