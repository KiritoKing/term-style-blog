import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const root=process.argv[2] || 'framework';
const source=join(root,'tests/e2e'),output=join(root,'tests/hosted-e2e');
mkdirSync(output,{recursive:false});
const hashes={
  'mermaid-reading.spec.ts':'4b62f50b91c6812a8676fd788ae2287731c1dcdf9b29bf6685e712d68576ef6f',
  'blog-cutover.spec.ts':'b49382774d3d1f19db5b7d6ba0b793c1536c627b4016e4e731c76229465f54dd',
  'sidebar-search.spec.ts':'aa90e8d74d904573a74571d6f38d6258c839c1a694fd1681478fab690c112db4',
};
function once(text,from,to){assert.equal(text.split(from).length,2,'expected single hosted adaptation');return text.replace(from,()=>to);}
for(const name of readdirSync(source)){
  let text=readFileSync(join(source,name),'utf8');
  if(hashes[name])assert.equal(createHash('sha256').update(text).digest('hex'),hashes[name],'accepted test source changed');
  if(name==='mermaid-reading.spec.ts')text=once(text,"url.hostname === '127.0.0.1'","url.origin === 'https://chlorinec.top'");
  if(name==='blog-cutover.spec.ts')text=once(text,'new RegExp(`/posts/${postSlug}$`)','new RegExp(`/posts/${postSlug}/?$`)');
  if(name==='sidebar-search.spec.ts')text=once(text,'/\\/search\\?q=rust$/','/\\/search\\/?\\?q=rust$/');
  writeFileSync(join(output,name),text);
}
console.log('Prepared hosted copies: exact public origin allowlist and optional Pages trailing slash; all geometry, content, case, interaction and console assertions preserved.');
