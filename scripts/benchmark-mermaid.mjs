import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const packagePathForSite = (siteRoot) => path.resolve(siteRoot, '..', 'package.json');

const parseArgs = (args) => {
  const options = { runs: 5, siteRoot: path.resolve('dist'), fixture: 'tests/fixtures/mermaid/real-blog-flowcharts.json' };
  for (let index = 0; index < args.length; index += 1) {
    const [key, inlineValue] = args[index].split('=', 2);
    if (!key.startsWith('--')) continue;
    const value = inlineValue ?? args[++index];
    if (key === '--runs') options.runs = Number(value);
    else if (key === '--site-root') options.siteRoot = path.resolve(value);
    else if (key === '--fixture') options.fixture = path.resolve(value);
    else if (key === '--output') options.output = path.resolve(value);
    else throw new Error(`Unknown option: ${key}`);
  }
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('--runs must be a positive integer.');
  return options;
};

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
]);

const options = parseArgs(process.argv.slice(2));
const fixture = JSON.parse(await fs.readFile(options.fixture, 'utf8'));
const sitePackage = JSON.parse(await fs.readFile(packagePathForSite(options.siteRoot), 'utf8'));
const server = createServer(async (request, response) => {
  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    response.writeHead(400).end('Bad Request');
    return;
  }
  let filePath = path.resolve(options.siteRoot, `.${requestPath}`);
  if (filePath !== options.siteRoot && !filePath.startsWith(`${options.siteRoot}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  let stat = await fs.stat(filePath).catch(() => null);
  if (stat?.isDirectory()) filePath = path.join(filePath, 'index.html');
  stat = await fs.stat(filePath).catch(() => null);
  if (!stat?.isFile()) {
    response.writeHead(404).end('Not Found');
    return;
  }
  response.writeHead(200, { 'content-type': mimeTypes.get(path.extname(filePath)) ?? 'application/octet-stream' });
  if (request.method === 'HEAD') response.end();
  else createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Could not start the local benchmark server.');
const baseURL = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });

const runCase = async (withDiagrams) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const jsResponses = [];
  const pendingBodies = [];
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (response.request().resourceType() !== 'script' || !/^\/_astro\/.*\.js$/.test(url.pathname)) return;
    pendingBodies.push(
      response.body().then((body) => {
        jsResponses.push({ path: url.pathname, rawBytes: body.byteLength, gzipBytes: gzipSync(body, { level: 9 }).byteLength });
      }),
    );
  });
  await page.addInitScript(() => {
    const state = window;
    state.__benchStartedAt = 0;
    state.__benchRenderEvents = [];
    document.addEventListener('blog:mermaid-rendered', (event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      state.__benchRenderEvents.push({ time: performance.now(), count: detail?.count ?? null });
    });
  });
  await page.goto(`${baseURL}/posts/hello-world/`, { waitUntil: 'networkidle' });
  let renderMs = null;
  let geometry = [];
  if (withDiagrams) {
    await page.evaluate((sources) => {
      const article = document.querySelector('.prose-terminal');
      if (!article) throw new Error('The article shell is missing .prose-terminal.');
      article.replaceChildren(
        ...sources.map((source) => {
          const block = document.createElement('pre');
          block.dataset.language = 'mermaid';
          block.textContent = source;
          return block;
        }),
      );
      window.__benchStartedAt = performance.now();
      document.dispatchEvent(new Event('astro:page-load'));
    }, fixture);
    await page.waitForFunction(
      (count) => {
        const rendered = document.querySelectorAll('.prose-terminal .mermaid[data-blog-mermaid-complete="true"]');
        const events = window.__benchRenderEvents ?? [];
        return rendered.length === count && events.some((event) => event.count === count || event.count === null);
      },
      fixture.length,
    );
    const result = await page.evaluate(() => {
      const state = window;
      const event = [...state.__benchRenderEvents].reverse()[0];
      if (!event) throw new Error('The all-diagrams-complete event was not recorded.');
      const diagrams = [...document.querySelectorAll('.prose-terminal .mermaid > svg[viewBox]')];
      return {
        elapsedMs: event.time - state.__benchStartedAt,
        eventCount: state.__benchRenderEvents.length,
        eventDetailCount: event.count,
        viewBoxes: diagrams.map((svg) => svg.getAttribute('viewBox')),
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    renderMs = result.elapsedMs;
    geometry = result;
  }
  await Promise.all(pendingBodies);
  const result = {
    withDiagrams,
    jsFiles: jsResponses.length,
    jsRawBytes: jsResponses.reduce((sum, response) => sum + response.rawBytes, 0),
    jsGzipBytes: jsResponses.reduce((sum, response) => sum + response.gzipBytes, 0),
    renderMs,
    geometry,
    jsResponses: jsResponses.sort((left, right) => left.path.localeCompare(right.path)),
  };
  await context.close();
  return result;
};

try {
  const results = { control: [], diagrams: [] };
  for (let run = 0; run < options.runs; run += 1) {
    results.control.push(await runCase(false));
    results.diagrams.push(await runCase(true));
  }
  const data = {
    versions: {
      node: process.version,
      playwright: sitePackage.devDependencies?.['@playwright/test'] ?? 'unspecified',
      pele: sitePackage.dependencies?.pele ?? null,
      mermaid: sitePackage.dependencies?.mermaid ?? null,
      chromium: browser.version(),
    },
    method: {
      baseURL,
      siteRoot: options.siteRoot,
      viewport: '390x844',
      freshContexts: true,
      runs: options.runs,
      externalRequests: 'blocked',
      gzip: 'per JS response, zlib level 9',
      renderTiming: 'fixture injection to one all-diagrams-complete event plus two animation frames',
    },
    control: results.control,
    diagrams: results.diagrams,
  };
  const output = `${JSON.stringify(data, null, 2)}\n`;
  if (options.output) await fs.writeFile(options.output, output);
  process.stdout.write(output);
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}
