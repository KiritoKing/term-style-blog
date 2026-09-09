import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const framework = 'a206bc1d8fd631d48a85e3450985b1651a0c1e23';
const content = 'd9dbbe357e528ae654f5474046675fb45c0dfdbc';
const old = 'b812bb89-7cb1-486c-85ba-511accf29896';
const expected = {framework_sha: framework, content_sha: content, manifest_sha256:'75e86ac4805dc56a00113de367fd758f903814fae9217d8f31bce0260289a098',source_tree_hash:'7d2ae41c519325a28cfe3ad68e4c202821f4b89819d761ec81c01f8249aeb86c'};
const root = `${process.env.RUNNER_TEMP}/blog-cutover`;
mkdirSync(root,{recursive:true});
const save = (name,value) => writeFileSync(`${root}/${name}.json`,JSON.stringify(value,null,2)+'\n');
const load = name => JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const base = 'https://api.cloudflare.com/client/v4/accounts/ef0d144e8d1febe747ef0068815b9730/pages/projects/notion-astro-rev';
const message = `authorized-cutover-${process.env.GITHUB_RUN_ID}`;
async function cf(path='',method='GET',body) {
  const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
  const data=await r.json();assert(r.ok && data.success,`Cloudflare ${method} failed: ${r.status}, codes ${(data.errors||[]).map(x=>x.code).join(',')}`);return data.result;
}
function fresh() {
  for (const [dir,ref,sha] of [['framework','main',framework],['content','publish-snapshots',content]]) {
    assert.equal(execFileSync('git',['-C',dir,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),sha);
    assert.equal(execFileSync('git',['-C',dir,'ls-remote','--exit-code','origin',`refs/heads/${ref}`],{encoding:'utf8'}).trim().split(/\s/)[0],sha,'source advanced');
  }
}
function projectGuard(p) {
  assert.equal(p.name,'notion-astro-rev');assert.equal(p.production_branch,'main');
  assert.equal(p.source.type,'github');assert.equal(p.source.config.repo_name,'notion-astro-rev');
  assert.equal(p.source.config.owner.toLowerCase(),'kiritoking');
  assert(p.domains.includes('chlorinec.top'));
}
async function patchSwitch(p,value) {
  const source={...p.source,config:{...p.source.config,production_deployments_enabled:value}};
  await cf('','PATCH',{source});
  const after=await cf();assert.deepEqual(after.source,source,'source settings did not match requested narrow update');return after;
}
const command=process.argv[2];
if(command==='approval') {
  assert.equal(process.env.APPROVAL,'replace-chlorinec-top-20260909');
  assert.equal(process.env.GITHUB_REF,'refs/heads/codex/production-cutover-20260909');
  const rec=JSON.parse(readFileSync('approval/preview-deployment-record.json','utf8'));
  for(const [key,value] of Object.entries(expected)) assert.equal(rec[key],value,key);
  assert.equal(rec.environment,'preview');assert.equal(rec.deployment_id,'c5892bd1-0059-4c62-ae0d-75d2d78a973d');
  const run=JSON.parse(execFileSync('gh',['api','repos/KiritoKing/term-style-blog/actions/runs/34280652058'],{encoding:'utf8'}));
  assert.equal(run.conclusion,'success');assert.equal(run.head_sha,framework);assert.equal(run.event,'repository_dispatch');fresh();save('approval',{...expected,preview_run:run.id,authorization:'User: 直接替换线上博客吧'});
} else if(command==='backup') {
  fresh();const p=await cf();projectGuard(p);assert.equal(p.canonical_deployment.id,old,'production changed');
  save('rollback',{deployment_id:old,production_deployments_enabled:p.source.config.production_deployments_enabled,source_owner:p.source.config.owner,source_repo:p.source.config.repo_name,domains:p.domains});
} else if(command==='disable') {
  fresh();const p=await cf();projectGuard(p);assert.equal(p.canonical_deployment.id,load('rollback').deployment_id);
  save('mutation-attempted',{run:process.env.GITHUB_RUN_ID});await patchSwitch(p,false);save('old-git-disabled',{disabled:true});
} else if(command==='verify') {
  const p=await cf();projectGuard(p);const d=p.canonical_deployment;
  assert.equal(d.id,process.env.DEPLOYMENT_ID);assert.equal(d.environment,'production');assert.equal(d.deployment_trigger.metadata.commit_hash,framework);
  assert.equal(p.source.config.production_deployments_enabled,false);
  const rec={...expected,deployment_id:d.id,environment:d.environment,url:'https://chlorinec.top',rollback_deployment:old,old_git_production_enabled:false};save('production',rec);console.log(JSON.stringify(rec));
} else if(command==='rollback') {
  if(!existsSync(`${root}/mutation-attempted.json`))process.exit(0);
  const before=load('rollback');let p=await cf();projectGuard(p);const d=p.canonical_deployment;
  if(d.id!==before.deployment_id){assert.equal(d.deployment_trigger.metadata.commit_hash,framework);assert.equal(d.deployment_trigger.metadata.commit_message,message,'another writer owns current production');await cf(`/deployments/${before.deployment_id}/rollback`,'POST');p=await cf();assert.equal(p.canonical_deployment.id,before.deployment_id);}
  await patchSwitch(p,before.production_deployments_enabled);save('rolled-back',{deployment_id:before.deployment_id,restored:true});console.log('Captured production and Git switch restored');
} else throw new Error('Unknown operation');
