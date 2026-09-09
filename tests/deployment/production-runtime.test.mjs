import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("each isolated Pages upload job installs its own package manager and supported Node", async () => {
  const workflow = await readFile(new URL("../../.github/workflows/deploy-publication.yml", import.meta.url), "utf8");
  for (const jobName of ["build_preview", "deploy_production"]) {
    const job = workflow.split(`  ${jobName}:`)[1].split(/^  [a-z_]+:/m)[0];
    const upload = job.indexOf("uses: cloudflare/wrangler-action@");
    const pnpm = job.indexOf("uses: pnpm/action-setup@");
    const node = job.indexOf("uses: actions/setup-node@");
    assert.ok(upload >= 0, `${jobName}: upload step exists`);
    assert.ok(pnpm >= 0 && pnpm < upload, `${jobName}: pnpm must be installed on this job's fresh runner before Wrangler`);
    assert.ok(node >= 0 && node < upload, `${jobName}: supported Node must be installed before Wrangler`);
    assert.match(job, /version: 10\.28\.0/);
    assert.match(job, /node-version: 24\.14\.0/);
  }
});
