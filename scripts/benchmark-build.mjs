import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const options = { projectRoot: process.cwd(), runs: 5 };
for (let index = 2; index < process.argv.length; index += 1) {
  const [key, inlineValue] = process.argv[index].split('=', 2);
  const value = inlineValue ?? process.argv[++index];
  if (key === '--project-root') options.projectRoot = path.resolve(value);
  else if (key === '--runs') options.runs = Number(value);
  else if (key === '--output') options.output = path.resolve(value);
  else throw new Error(`Unknown option: ${key}`);
}
if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('--runs must be a positive integer.');

const measureBundle = async () => {
  const directory = path.join(options.projectRoot, 'dist', '_astro');
  const files = await fs.readdir(directory, { withFileTypes: true });
  const javascriptFiles = files.filter((entry) => entry.isFile() && entry.name.endsWith('.js'));
  const sizes = await Promise.all(
    javascriptFiles.map(async (entry) => (await fs.stat(path.join(directory, entry.name))).size),
  );
  return { jsFiles: sizes.length, jsRawBytes: sizes.reduce((sum, size) => sum + size, 0) };
};

const results = [];
for (let run = 0; run < options.runs; run += 1) {
  await fs.rm(path.join(options.projectRoot, 'dist'), { recursive: true, force: true });
  const startedAt = performance.now();
  const result = spawnSync('pnpm', ['build'], {
    cwd: options.projectRoot,
    env: process.env,
    stdio: 'ignore',
  });
  const elapsedMs = performance.now() - startedAt;
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`pnpm build failed on run ${run + 1} (exit ${result.status}).`);
  results.push({ run: run + 1, elapsedMs: Number(elapsedMs.toFixed(3)), ...(await measureBundle()) });
}

const report = { node: process.version, projectRoot: options.projectRoot, cleanDistBeforeEachRun: true, results };
const output = `${JSON.stringify(report, null, 2)}\n`;
if (options.output) await fs.writeFile(options.output, output);
process.stdout.write(output);
