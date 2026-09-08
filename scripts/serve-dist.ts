import { createReadStream, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.env.PORT ?? 4321);
const redirectSource = await fs.readFile(path.join(root, '_redirects'), 'utf8');
const redirects = new Map(
  redirectSource
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length === 3)
    .map(([from, to, status]) => [from, { to, status: Number(status) }]),
);

const types: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml; charset=utf-8',
};

createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  let pathname: string;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400).end('Bad Request');
    return;
  }

  const redirect = redirects.get(pathname.replace(/\/$/, '') || '/');
  if (redirect) {
    response.writeHead(redirect.status, { location: redirect.to }).end();
    return;
  }

  const candidate = path.resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let file = candidate;
  const stat = await fs.stat(file).catch(() => null);
  if (stat?.isDirectory()) file = path.join(file, 'index.html');
  const fileStat = await fs.stat(file).catch(() => null);
  if (!fileStat?.isFile()) file = path.join(root, '404.html');

  response.writeHead(fileStat?.isFile() ? 200 : 404, {
    'content-type': types[path.extname(file)] ?? 'application/octet-stream',
  });
  if (request.method === 'HEAD') response.end();
  else createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
