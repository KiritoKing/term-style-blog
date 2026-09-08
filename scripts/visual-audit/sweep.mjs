import { createRequire } from 'node:module';
import { promises as fs } from 'node:fs';
import path from 'node:path';
// Reuse a pinned Midscene installation without coupling this repository to another checkout.
const runtimeRequire = createRequire(path.resolve(process.env.MIDSCENE_RUNTIME_DIR || '.', 'package.json'));
let midRequire = runtimeRequire;
try { runtimeRequire.resolve('@midscene/web/playwright'); }
catch { midRequire = createRequire(runtimeRequire.resolve('@midscene/cli')); }
const webRequire = createRequire(midRequire.resolve('@midscene/web/playwright'));
const { chromium } = webRequire('playwright');
const { PlaywrightAgent } = midRequire('@midscene/web/playwright');
const root = path.resolve(process.env.AUDIT_DIST || './dist');
const output = path.resolve(process.env.AUDIT_OUTPUT || './test-results/visual-audit');
const origin = process.env.AUDIT_ORIGIN || 'http://127.0.0.1:4324';
await fs.mkdir(output, { recursive: true });
async function files(dir) { const entries = await fs.readdir(dir, { withFileTypes: true }); return (await Promise.all(entries.map(e => e.isDirectory() ? files(path.join(dir,e.name)) : path.join(dir,e.name)))).flat(); }
const inventory = [];
for (const file of (await files(root)).filter(f => f.endsWith('.html'))) {
  const html = await fs.readFile(file,'utf8');
  const relative = path.relative(root,file);
  const route = '/' + relative.replace(/index\.html$/, '').replace(/\/$/,'');
  inventory.push({ route: route || '/', redirect: /http-equiv=["']refresh/i.test(html), file: relative });
}
await fs.writeFile(path.join(output,'inventory.json'),JSON.stringify(inventory,null,2));
let routes = inventory.filter(x => !x.redirect);
if (process.env.AUDIT_FILTER) routes = routes.filter(x => x.route.includes(process.env.AUDIT_FILTER));
if (process.env.AUDIT_ROUTES) {
 const requested = new Set(process.env.AUDIT_ROUTES.split(',').filter(Boolean));
 routes = routes.filter(x => requested.has(x.route));
 if (routes.length !== requested.size) throw new Error('Requested audit routes do not match the rendered inventory');
}
const geometryOnly = process.env.AUDIT_GEOMETRY_ONLY === '1';
const jobs = routes.flatMap(r => [{...r,width:1440,height:1000},{...r,width:390,height:844}]);
const startedAt = new Date().toISOString();
const browser = await chromium.launch({headless:true,channel:'chrome'});
let cursor=0, done=0;
const results=[];
async function inspect(job,index) {
 const context=await browser.newContext({viewport:{width:job.width,height:job.height},reducedMotion:'reduce',colorScheme:process.env.AUDIT_THEME||'light'});
 const page=await context.newPage();
 const id=String(index).padStart(3,'0')+'-'+job.width;
 const result={...job,id,segments:[],geometry:[],errors:[],status:'pass'};
 page.on('pageerror',e=>result.errors.push(e.message));
 try {
  const response=await page.goto(origin+job.route,{waitUntil:'networkidle',timeout:45000});
  result.http=response?.status();
  if(result.http!==200 && job.route!='/404.html') result.errors.push('HTTP '+result.http);
  await page.evaluate(()=>document.fonts.ready);
  // Load lazy media through the real scroll container before fixing the coverage plan.
  // Recheck height on each step so an image that expands the article cannot hide its tail.
  for(let preloadY=0, steps=0;steps<300;steps++){
   const state=await page.evaluate(y=>{const s=document.querySelector('#content-scroll')||document.scrollingElement;s.scrollTop=y;return{end:Math.max(0,s.scrollHeight-s.clientHeight),step:s.clientHeight*.8};},preloadY);
   await page.waitForTimeout(80);
   await page.waitForFunction(()=>[...document.images].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}).every(e=>e.complete),{},{timeout:8000}).catch(()=>{});
   const end=await page.evaluate(()=>{const s=document.querySelector('#content-scroll')||document.scrollingElement;return Math.max(0,s.scrollHeight-s.clientHeight);});
   if(preloadY>=end)break;
   preloadY=Math.min(end,preloadY+state.step);
   if(steps===299)throw new Error('Preload traversal exceeded 300 steps; coverage is incomplete');
  }
  await page.evaluate(()=>{const s=document.querySelector('#content-scroll')||document.scrollingElement;s.scrollTop=0;});
  await page.waitForTimeout(150);
  const plan=await page.evaluate(()=>{
   const s=document.querySelector('#content-scroll')||document.scrollingElement;
   const blocks=[...document.querySelectorAll('article pre,article table,article img,article svg,article blockquote,.prose pre,.prose table,.prose img,.mermaid')];
   const offsets=[0,Math.max(0,s.scrollHeight-s.clientHeight)];
   if(s.scrollHeight>s.clientHeight*1.8) offsets.push((s.scrollHeight-s.clientHeight)/2);
   const sr=s.getBoundingClientRect();
   for(const e of blocks){const r=e.getBoundingClientRect();offsets.push(Math.max(0,Math.min(s.scrollHeight-s.clientHeight,r.top-sr.top+s.scrollTop-60)));}
   for(let y=0;y<s.scrollHeight-s.clientHeight;y+=s.clientHeight*.85)offsets.push(y);
   const sorted=[...new Set(offsets.map(Math.round))].sort((a,b)=>a-b);
   const selected=[];
   for(const y of sorted){if(!selected.length||y-selected.at(-1)>s.clientHeight*.5)selected.push(y);}
   const end=Math.max(0,s.scrollHeight-s.clientHeight);
   if(selected.at(-1)!==end)selected.push(end);
   return {height:s.scrollHeight,clientHeight:s.clientHeight,offsets:selected};
  });
  result.scroll=plan;
  const agent=new PlaywrightAgent(page,{generateReport:true,reportFileName:path.basename(output)+'-'+id,autoPrintReportMsg:false});
  const title=await page.locator('#content-scroll h1').first().textContent().catch(()=>null);
  for(let i=0;i<plan.offsets.length;i++){
   await page.evaluate(y=>{const s=document.querySelector('#content-scroll')||document.scrollingElement;s.scrollTop=y;},plan.offsets[i]);
   await page.waitForTimeout(220);
   await page.waitForFunction(()=>[...document.images].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}).every(e=>e.complete),{},{timeout:8000}).catch(()=>{});
   const geometry=await page.evaluate(()=>{
    const s=document.querySelector('#content-scroll')||document.scrollingElement;const sr=s.getBoundingClientRect();
    const bad=[...s.querySelectorAll('h1,h2,h3,p,pre,table,img,svg,blockquote,ul,ol')].filter(e=>{const r=e.getBoundingClientRect();if(r.width===0||r.bottom<sr.top||r.top>sr.bottom)return false;const parent=e.closest('pre,table');if(parent&&parent!==e)return false;let ancestor=e.parentElement;while(ancestor&&ancestor!==s){const style=getComputedStyle(ancestor);if(['auto','scroll'].includes(style.overflowX)&&ancestor.scrollWidth>ancestor.clientWidth)return false;ancestor=ancestor.parentElement;}return r.right>sr.right+2||r.left<sr.left-2;}).map(e=>({tag:e.tagName,text:(e.textContent||'').slice(0,90),left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right)}));
    const localScrollers=[...s.querySelectorAll('pre,.mermaid')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>{const before=e.scrollLeft;e.scrollLeft=10;const scrollable=e.scrollLeft>0;e.scrollLeft=before;return {tag:e.tagName,scrollable,width:e.clientWidth,scrollWidth:e.scrollWidth};});
    const broken=[...s.querySelectorAll('img')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>=sr.top&&r.top<=sr.bottom&&e.complete&&e.naturalWidth===0;}).map(e=>e.getAttribute('src'));
    return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,contentWidth:s.clientWidth,scrollWidth:s.scrollWidth,overflow:bad,brokenImages:broken,localScrollers};
   });
   result.geometry.push(geometry);
   const screenshot=path.join(output,id+'-'+i+'.png');await page.screenshot({path:screenshot});
   const segment={offset:plan.offsets[i],screenshot,status:'pass'};
   const prompts=['检查当前真实博客画面：终端风格导航、正文与边栏布局合理。所有当前可见文字、标题、列表、图片、表格、代码块、图表应在各自容器内清楚可读，没有相互重叠、异常拉伸、跑出阅读区域、被侧栏或页面边缘裁掉、破图图标、未渲染的HTML或Mermaid报错。代码和表格自身横向滚动是允许的，但不能撑宽整个文章或遮挡其他元素。视口上下边缘因正常纵向滚动只显示部分内容不是错误。文章内嵌截图中的菜单、窗口、隐私遮挡是配图内容，不是本站界面控件；请检查图片本身是否被异常拉伸或跑出容器。代码块超出右侧可视范围本身不算失败，横向滚动可达性由配套 DOM 检查确认。评估实际可见内容，不要求每页都有图片或表格。若有任何明显渲染或布局问题则断言失败。'];
   if(i===0&&title)prompts.push(`主内容标题“${title.trim()}”必须从第一个字到最后一个字完整显示在阅读面板内，可以正常换行。标题和正文段落的左端首字均可见，不能有左半截藏在左侧导航栏或阅读框边缘后面。根据截图实际像素判断，不能因为能猜出标题就认为完整可见。`);
   segment.assertions=[];
   for(const prompt of geometryOnly ? [] : prompts){try{await agent.aiAssert(prompt);segment.assertions.push({status:'pass'});}catch(e){const reason=String(e.message).slice(0,2200);segment.assertions.push({status:'fail',reason});segment.status='fail';segment.reason=reason;result.status='fail';}}
   if(geometry.overflow.length||geometry.brokenImages.length||geometry.scrollWidth>geometry.contentWidth+2||geometry.localScrollers.some(x=>!x.scrollable)){result.status='fail';}
   result.segments.push(segment);
   await fs.writeFile(path.join(output,id+'.json'),JSON.stringify(result,null,2));
  }
 }catch(e){result.status='error';result.errors.push(String(e.message).slice(0,2200));}
 finally{await context.close();}
 if(result.errors.length)result.status='fail';
 results.push(result);done++;
 await fs.writeFile(path.join(output,id+'.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({done,total:jobs.length,route:job.route,width:job.width,status:result.status,segments:result.segments.length,errors:result.errors}));
}
try {await Promise.all(Array.from({length:Number(process.env.AUDIT_CONCURRENCY||6)},async()=>{while(cursor<jobs.length){const i=cursor++;await inspect(jobs[i],i);}}));}
finally {await browser.close();await fs.writeFile(path.join(output,'summary.json'),JSON.stringify({startedAt,finishedAt:new Date().toISOString(),origin,dist:root,mode:geometryOnly?'geometry-only':'midscene-and-geometry',theme:process.env.AUDIT_THEME||'light',totalPages:inventory.length,redirects:inventory.filter(x=>x.redirect).length,renderedRoutes:routes.length,expected:jobs.length,completed:results.length,pass:results.filter(x=>x.status==='pass').length,fail:results.filter(x=>x.status!=='pass').length,results},null,2));}

if(results.length!==jobs.length||results.some(x=>x.status!=='pass'))process.exitCode=1;
