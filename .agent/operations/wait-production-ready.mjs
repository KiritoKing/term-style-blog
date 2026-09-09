import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const origin='https://chlorinec.top';
const routes=['/','/posts/KeePass','/posts/KeePass/','/search?q=rust','/search/?q=rust'];
const deadline=Date.now()+180000;
let consecutive=0,last=[];
while(Date.now()<deadline){
  last=await Promise.all(routes.map(async path=>{
    try{
      const response=await fetch(origin+path,{signal:AbortSignal.timeout(15000)});
      const body=await response.text();
      const ok=response.status===200 && new URL(response.url).origin===origin && body.includes('data-terminal-shell') && !/<meta[^>]+name="robots"[^>]+noindex/i.test(body) && (!path.includes('KeePass') || (body.includes('<article') && body.includes('https://chlorinec.top/posts/KeePass')));
      return {path,status:response.status,ready:ok};
    }catch{return {path,ready:false};}
  }));
  consecutive=last.every(x=>x.ready)?consecutive+1:0;
  if(consecutive===2){writeFileSync(`${process.env.RUNNER_TEMP}/blog-cutover/propagation-ready.json`,JSON.stringify({consecutive,checks:last},null,2)+'\n');console.log('Exact public routes served the new terminal artifact in two consecutive checks');process.exit(0);}
  await new Promise(resolve=>setTimeout(resolve,5000));
}
console.log(JSON.stringify(last));assert.fail('Public production did not converge to the accepted framework within 180 seconds');
