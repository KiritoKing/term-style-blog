#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const UUID = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
export function checkProject(project, expectedName) {
  assert.equal(project.name, expectedName, 'Wrong Pages project');
  assert.equal(project.production_branch, 'main', 'Wrong production branch');
  assert(project.domains.includes('chlorinec.top'), 'Canonical domain missing');
  assert.equal(project.source?.config?.production_deployments_enabled, false, 'Legacy Git production writer must remain disabled');
  assert.equal(project.canonical_deployment?.environment, 'production');
  assert(UUID.test(project.canonical_deployment.id), 'Invalid canonical deployment');
}
export function checkCandidate(deployment, environment) {
  assert.equal(deployment.id, environment.DEPLOYMENT_ID, 'A different deployment is current');
  assert.equal(deployment.deployment_trigger?.metadata?.commit_hash, environment.FRAMEWORK_SHA, 'Wrong framework revision');
  assert.equal(deployment.deployment_trigger?.metadata?.commit_message, `publication-run-${environment.GITHUB_RUN_ID}-${environment.GITHUB_RUN_ATTEMPT}`, 'Another run owns production');
}
export async function productionState(command, env = process.env, fetcher = fetch) {
  assert(/^[a-f0-9]{32}$/.test(env.CLOUDFLARE_ACCOUNT_ID ?? ''), 'Invalid account ID');
  assert(/^[a-z0-9-]+$/.test(env.CLOUDFLARE_PAGES_PROJECT ?? ''), 'Invalid project');
  assert(env.CLOUDFLARE_API_TOKEN, 'Cloudflare API credential missing');
  const base = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${env.CLOUDFLARE_PAGES_PROJECT}`;
  async function api(suffix = '', method = 'GET') {
    const response = await fetcher(base + suffix, {method, headers: {Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`}, redirect: 'error', signal: AbortSignal.timeout(30000)});
    assert(response.ok, `Cloudflare ${method} HTTP ${response.status}`);
    const data = await response.json();
    assert(data.success, 'Cloudflare API rejected operation');
    return data.result;
  }
  const project = await api();
  checkProject(project, env.CLOUDFLARE_PAGES_PROJECT);
  const statePath = `${env.RUNNER_TEMP}/publication-rollback.json`;
  if (command === 'backup') {
    const record = {deployment_id: project.canonical_deployment.id, project: project.name, run_id: env.GITHUB_RUN_ID, run_attempt: env.GITHUB_RUN_ATTEMPT};
    await writeFile(statePath, JSON.stringify(record, null, 2) + '\n', {mode: 0o600});
    console.log(JSON.stringify({previous_deployment: record.deployment_id}));
    return record;
  }
  if (command === 'verify') {
    checkCandidate(project.canonical_deployment, env);
    console.log(JSON.stringify({canonical_deployment: project.canonical_deployment.id, status: 'current'}));
    return;
  }
  assert.equal(command, 'rollback', 'Unknown operation');
  const before = JSON.parse(await readFile(statePath, 'utf8'));
  assert.equal(before.project, project.name);
  assert.equal(before.run_id, env.GITHUB_RUN_ID);
  assert.equal(before.run_attempt, env.GITHUB_RUN_ATTEMPT);
  assert(UUID.test(before.deployment_id), 'Invalid rollback deployment');
  if (project.canonical_deployment.id === before.deployment_id) {
    console.log('Production still points to the recorded baseline');
    return;
  }
  // Also recover an upload whose action failed before returning its deployment ID.
  const candidateEnv = {...env, DEPLOYMENT_ID: env.DEPLOYMENT_ID || project.canonical_deployment.id};
  checkCandidate(project.canonical_deployment, candidateEnv);
  await api(`/deployments/${before.deployment_id}/rollback`, 'POST');
  const restored = await api();
  checkProject(restored, env.CLOUDFLARE_PAGES_PROJECT);
  assert.equal(restored.canonical_deployment.id, before.deployment_id, 'Rollback not current');
  console.log(JSON.stringify({restored_deployment: before.deployment_id}));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  productionState(process.argv[2]).catch((error) => {
    // No API response body or headers are printed.
    const reason = error.name === "AssertionError" ? error.message.split("\n")[0] : error.name;
    console.error(`Production state operation failed: ${reason}`);
    process.exitCode = 1;
  });
}
