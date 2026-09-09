import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {checkProject, checkCandidate, productionState} from '../../scripts/publication-production-state.mjs';
const oldId = '11111111-1111-4111-8111-111111111111';
const newId = '22222222-2222-4222-8222-222222222222';
const env = {CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32), CLOUDFLARE_PAGES_PROJECT:'notion-astro-rev',CLOUDFLARE_API_TOKEN:'fixture',GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'1',FRAMEWORK_SHA:'b'.repeat(40),DEPLOYMENT_ID:newId};
const project = (id=oldId, message='publication-run-123-1') => ({name:'notion-astro-rev',production_branch:'main',domains:['chlorinec.top'],source:{config:{production_deployments_enabled:false}},canonical_deployment:{id,environment:'production',deployment_trigger:{metadata:{commit_hash:env.FRAMEWORK_SHA,commit_message:message}}}});
test('refuses legacy Git writer and unrelated current production', () => {
  const p=project();p.source.config.production_deployments_enabled=true;
  assert.throws(()=>checkProject(p,env.CLOUDFLARE_PAGES_PROJECT));
  assert.throws(()=>checkCandidate(project(newId,'other run').canonical_deployment,env));
  assert.throws(()=>checkCandidate(project(oldId).canonical_deployment,env));
});
test('backup then conditional rollback restores only this run candidate', async () => {
  const dir=await mkdtemp(path.join(os.tmpdir(),'publication-state-'));const e={...env,RUNNER_TEMP:dir};
  let current=project();const methods=[];
  const fetcher=async (url,options)=>{methods.push(options.method);assert.equal(options.redirect,'error');assert(url.startsWith('https://api.cloudflare.com/'));if(options.method==='POST')current=project();return Response.json({success:true,result:current});};
  try {
    await productionState('backup',e,fetcher);
    current=project(newId,'another run');
    await assert.rejects(productionState('rollback',e,fetcher));
    assert(!methods.includes('POST'));
    current=project(newId);
    await productionState('verify',e,fetcher);
    await productionState('rollback',e,fetcher);
    assert.equal(current.canonical_deployment.id,oldId);
    assert.equal(methods.filter(m=>m==='POST').length,1);
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('failed upload without action output can recover only matching unique run', async () => {
  const dir=await mkdtemp(path.join(os.tmpdir(),'publication-state-'));const e={...env,DEPLOYMENT_ID:'',RUNNER_TEMP:dir};
  let current=project();let posts=0;
  const fetcher=async (_url,options)=>{if(options.method==='POST'){posts++;current=project();}return Response.json({success:true,result:current});};
  try {await productionState('backup',e,fetcher);current=project(newId);await productionState('rollback',e,fetcher);assert.equal(posts,1);}finally{await rm(dir,{recursive:true,force:true});}
});
