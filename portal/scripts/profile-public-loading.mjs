import {publicBrowserProfile} from './test-support/public-browser-profile.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {testCompiler} from './test-support/compiler.mjs';
const label=process.env.PUBLIC_PROFILE_LABEL||'after',build=process.env.PUBLIC_PROFILE_BUILD||'.sites-runtime/public-loading-next',port=3152,base='http://localhost:'+port;
const dir=path.resolve('.sites-runtime/public-performance-'+label+'-'+Date.now());fs.mkdirSync(dir,{recursive:true});
const load=testCompiler('.sites-runtime/public-profile-fixtures'),{defaultConfig,blankPost}=await load('app/model.ts'),{defaultPublicHome}=await load('lib/public-site-config.ts');
const {withMasterRegistry}=await load('lib/master-relationships.ts');
const config=withMasterRegistry({...structuredClone(defaultConfig),types:['Picture'],accounts:[{name:'Facebook GLOW',platform:'Facebook',brand:'GLOW',profileUrl:'https://www.facebook.com/glow',active:true}]});
const home={...defaultPublicHome,heroTitle:'Published performance fixture',socialAccounts:[{label:'Facebook GLOW',platform:'Facebook',url:'https://www.facebook.com/glow',hidden:false}]};
const rows=[{id:'configuration',kind:'config',payload:config,updatedAt:new Date().toISOString()},{id:home.id,kind:'public_home',payload:home,updatedAt:new Date().toISOString()},...Array.from({length:600},(_,i)=>{const post={...blankPost(),id:'public-post-'+String(i).padStart(4,'0'),title:'Published activity '+i,platform:'Facebook',account:'Facebook GLOW',brand:'GLOW',date:'2026-11-01',type:'Picture',status:'published',likes:i,comments:2,shares:1,show_on_public_site:true};return {id:post.id,kind:'posts',payload:post,updatedAt:new Date().toISOString()};}),{id:'private-draft',kind:'cms_draft',payload:{secret:'PRIVATE_DRAFT_SENTINEL'},updatedAt:new Date().toISOString()}];
const file=path.join(dir,'rows.json'),log=path.join(dir,'rpc.jsonl');fs.writeFileSync(file,JSON.stringify(rows));fs.writeFileSync(log,'');
const env={...process.env,NEXT_BUILD_DIR:build,DATABASE_PROVIDER:'supabase',SUPABASE_URL:'https://public-performance.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-only',DATABASE_URL:'postgresql://test:test@127.0.0.1:1/test',DIRECT_URL:'postgresql://test:test@127.0.0.1:1/test',WORKSPACE_PASSWORD:'isolated-public-test-password',PUBLIC_FIXTURE_FILE:file,PUBLIC_FIXTURE_LOG:log,NODE_OPTIONS:'--require '+JSON.stringify(path.resolve('scripts/test-support/public-performance-preload.cjs'))};
const server=spawn(path.resolve('../.tools/node.exe'),['node_modules/next/dist/bin/next','start','-p',String(port)],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';server.stdout.on('data',v=>output+=v);server.stderr.on('data',v=>output+=v);
const samples=[],rpcCount=()=>fs.readFileSync(log,'utf8').trim().split('\n').filter(Boolean).length;
async function measure(url,headers={}){const before=rpcCount(),start=performance.now(),r=await fetch(base+url,{headers}),body=await r.text(),sample={url,status:r.status,ms:performance.now()-start,bytes:Buffer.byteLength(body),rpcCalls:rpcCount()-before,serverTiming:r.headers.get('server-timing'),containsPublished:body.includes('Published activity'),loading:body.includes('Gathering our community stories'),etag:r.headers.get('etag')};samples.push(sample);assert(!body.includes('PRIVATE_DRAFT_SENTINEL'));return {r,body,sample};}
try{
 for(let i=0;i<100;i++){try{if((await fetch(base+'/workspace/login')).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 const first=await measure('/');
 if(label==='after'){assert(first.sample.containsPublished,'published content must exist in server HTML');assert(!first.sample.loading);}
 const api=await measure('/api/public');assert.equal(api.r.status,200);assert(JSON.parse(api.body).stories.length===600);
 await measure('/');await measure('/activities');await measure('/stories/post-public-post-0000');
 if(label==='after'){
  assert.equal(samples.slice(1).reduce((n,v)=>n+v.rpcCalls,0),0,'warm pages and API must reuse one cache');
  const conditional=await measure('/api/public',{'if-none-match':api.r.headers.get('etag')});assert.equal(conditional.r.status,304);assert.equal(conditional.body,'');
  const login=await fetch(base+'/api/session',{method:'POST',headers:{origin:base,'Content-Type':'application/json'},body:JSON.stringify({password:env.WORKSPACE_PASSWORD})});assert.equal(login.status,200,await login.clone().text());const cookie=login.headers.get('set-cookie').split(';')[0];
  const homeRows=JSON.parse(fs.readFileSync(file,'utf8')),record={...homeRows.find(r=>r.kind==='public_home').payload,heroTitle:'Approved updated hero'};
  const post=async action=>fetch(base+'/api/site-manager',{method:'POST',headers:{cookie,origin:base,'Content-Type':'application/json'},body:JSON.stringify({kind:'home',action,record,baseUpdatedAt:homeRows.find(r=>r.kind==='public_home').updatedAt})});
  let response=await post('draft');assert.equal(response.status,200,await response.text());let unchanged=await measure('/api/public');assert.equal(JSON.parse(unchanged.body).home.heroTitle,home.heroTitle,'draft cannot enter public cache');
  response=await post('publish');assert.equal(response.status,200,await response.text());const changed=await measure('/api/public');assert.equal(JSON.parse(changed.body).home.heroTitle,'Approved updated hero');assert(changed.sample.rpcCalls>0,'publication invalidates cache');assert.notEqual(changed.sample.etag,api.sample.etag);
  const denied=await fetch(base+'/api/site-manager',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'home',action:'publish',record})});assert.equal(denied.status,401);
 }
 const browser=await publicBrowserProfile(base,label,dir);
 fs.writeFileSync('.sites-runtime/public-performance-'+label+'.json',JSON.stringify({label,build,environment:'local production Next / 600 published posts / fake Supabase RPC / fixed 100 ms per RPC',samples,browser},null,2));console.log(JSON.stringify({label,samples,browser}));
}catch(error){console.log(output.slice(-6000));throw error;}finally{server.kill();}
