import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
const out='.sites-runtime/cms-sync-tests';fs.mkdirSync(out,{recursive:true});const compiled=new Set(),ids=new Map();
function resolve(from,target){let file=target.startsWith('@/')?target.slice(2):path.posix.normalize(path.posix.join(path.posix.dirname(from),target));if(file.endsWith('/storage'))file=file.replace(/\/storage$/,'/storage-d1');if(file.endsWith('/media-storage'))file=file.replace(/\/media-storage$/,'/media-storage-d1');for(const suffix of ['.ts','.tsx','/index.ts','/index.tsx'])if(fs.existsSync(file+suffix))return file+suffix;return null;}
function compile(file){const id=file.replace(/[/.]/g,'-')+'.mjs';ids.set(file,id);if(compiled.has(file))return id;compiled.add(file);let source=fs.readFileSync(file,'utf8').replace("import {env} from 'cloudflare:workers';",'const env=globalThis.cmsTestEnv;').replaceAll("from 'next/link'","from 'next/link.js'").replaceAll("from 'next/navigation'","from 'next/navigation.js'");source=source.replace(/import\s+['"][^'"]+\.css['"];?/g,'');source=source.replace(/(from\s*|import\s*\()(['"])([^'"]+)\2/g,(match,prefix,q,target)=>{if(!target.startsWith('.')&&!target.startsWith('@/'))return match;const next=resolve(file,target);if(!next)return match;return prefix+q+'./'+compile(next)+q});fs.writeFileSync(out+'/'+id,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);return id;}
for(const file of ['lib/original-post-url.ts','app/api/site-manager/route.ts','app/api/media/route.ts','lib/storage-d1.ts','lib/workspace-service.ts','lib/record-operations.ts','lib/content-writing.ts','app/model.ts','app/public-site-manager.tsx','app/cms-content-editor.tsx','app/public-portal.tsx','app/rich-story-editor.tsx'])compile(file);
const mod=async p=>import('../'+out+'/'+ids.get(p));
const sql=new DatabaseSync(':memory:');for(const m of JSON.parse(fs.readFileSync('drizzle/meta/_journal.json')).entries)sql.exec(fs.readFileSync('drizzle/'+m.tag+'.sql','utf8'));
const query=(s,v=[])=>({bind:(...values)=>query(s,values),first:async()=>sql.prepare(s).get(...v),all:async()=>({results:sql.prepare(s).all(...v)}),run:()=>sql.prepare(s).run(...v)}),objects=new Map();
globalThis.cmsTestEnv={DB:{prepare:s=>query(s),batch:async statements=>{sql.exec('BEGIN');try{const result=statements.map(s=>s.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}}},BUCKET:{put:async(key,bytes,options)=>objects.set(key,{bytes,type:options.httpMetadata.contentType}),get:async key=>{const r=objects.get(key);return r?{body:r.bytes,size:r.bytes.length,httpMetadata:{contentType:r.type}}:null},delete:async key=>objects.delete(key)}};
process.env.WORKSPACE_PASSWORD=crypto.randomUUID()+crypto.randomUUID();
const {getStorage}=await mod('lib/storage-d1.ts'),store=getStorage(),{blankPost,defaultConfig}=await mod('app/model.ts'),{applyDataAction,loadData}=await mod('lib/data-service.ts'),{saveWorkspaceRecord,publicPortalData}=await mod('lib/workspace-service.ts'),cms=await mod('app/api/site-manager/route.ts'),media=await mod('app/api/media/route.ts'),security=await mod('lib/workspace-security.ts'),{recordOperation}=await mod('lib/record-operations.ts');
const origin='https://portal.test',cookie=security.sessionCookie+'='+await security.createSession(),headers={cookie,origin,'Content-Type':'application/json'},request=(body,custom=headers)=>new Request(origin+'/api/site-manager',{method:'POST',headers:custom,body:JSON.stringify(body)}),read=async()=>{const r=await cms.GET(new Request(origin+'/api/site-manager',{headers}));assert.equal(r.status,200);return r.json()},preview=async()=>{const r=await cms.GET(new Request(origin+'/api/site-manager?preview=1',{headers}));assert.equal(r.status,200);return r.json()},send=async body=>{const r=await cms.POST(request(body));const result=await r.json();assert.equal(r.status,200,JSON.stringify(result));return result;};
assert.equal((await cms.GET(new Request(origin+'/api/site-manager'))).status,401);assert.equal((await cms.GET(new Request(origin+'/api/site-manager?preview=1'))).status,401);assert.equal((await cms.POST(request({},{}))).status,401);assert.equal((await cms.POST(request({},{...headers,origin:'https://other.test'}))).status,403);assert.equal((await media.GET(new Request(origin+'/api/media?list=1'))).status,401);

const {defaultPublicHome}=await mod('lib/public-site-config.ts');
const home={...defaultPublicHome,additionalValues:[{title:'Compassion',description:'Supporting one another.'}],valuesTitle:'Our Shared Values',respectTitle:'Dignity',respectDescription:'Every person matters.',highlightsTitle:'Our Community Moments',brandsTitle:'Meet Our Brands',storiesTitle:'Community Stories',socialTitle:'Connect With Us',facebookGlowLabel:'Follow GLOW',facebookGlowLink:'https://www.facebook.com/customglow',partnersTitle:'Our Trusted Partners'};
await send({kind:'home',action:'publish',record:home,baseUpdatedAt:''});
const feed=await publicPortalData(getStorage());for(const key of ['valuesTitle','respectTitle','respectDescription','highlightsTitle','brandsTitle','storiesTitle','socialTitle','facebookGlowLabel','facebookGlowLink','partnersTitle'])assert.equal(feed.home[key],home[key],key+' persisted into public feed');
const {default:Portal}=await mod('app/public-portal.tsx');const html=renderToStaticMarkup(React.createElement(Portal,{initialData:{...feed,partners:[{id:'partner',title:'Partner',imageUrl:'',url:''}]}}));
assert.deepEqual(feed.home.additionalValues,home.additionalValues);
for(const text of ['Compassion','Supporting one another.','Our Shared Values','Dignity','Every person matters.','Our Community Moments','Meet Our Brands','Community Stories','Connect With Us','Follow GLOW','https://www.facebook.com/customglow','Our Trusted Partners'])assert(html.includes(text),text+' rendered publicly');
const result=await cms.POST(request({kind:'home',action:'publish',record:{...home,facebookGlowLink:'javascript:alert(1)'},baseUpdatedAt:(await read()).entries.find(e=>e.id===home.id).updatedAt}));assert.equal(result.status,400,'unsafe social links rejected');
console.log('PASS: CMS publishes all seven section settings into the public feed and rendered page; unsafe social URLs rejected.');

const latest=(await read()).entries.find(e=>e.id===home.id).updatedAt;const managed={...home,values:[{title:'New Managed Value',description:'Managed card description.'}],socialAccounts:[{label:'Visible account',platform:'Facebook',url:'https://www.facebook.com/visible',hidden:false},{label:'Hidden account',platform:'Instagram',url:'https://www.instagram.com/hidden/',hidden:true}]};await send({kind:'home',action:'publish',record:managed,baseUpdatedAt:latest});let managedFeed=await publicPortalData(getStorage());let managedHtml=renderToStaticMarkup(React.createElement(Portal,{initialData:managedFeed}));assert(managedHtml.includes('New Managed Value'));assert(!managedHtml.includes('Every person matters.'));assert(managedHtml.includes('Visible account'));assert(!managedHtml.includes('Hidden account'));await send({kind:'home',action:'publish',record:{...managed,values:[],socialAccounts:[]},baseUpdatedAt:(await read()).entries.find(e=>e.id===home.id).updatedAt});managedFeed=await publicPortalData(getStorage());managedHtml=renderToStaticMarkup(React.createElement(Portal,{initialData:managedFeed}));assert(!managedHtml.includes('New Managed Value'));assert(!managedHtml.includes('Visible account'));console.log('PASS: individual value removal, social hide and delete persist to the public site without resurrecting defaults.');

const {default:Cards}=await mod('app/cms-section-cards.tsx');for(const section of ['home','values','social']){const cards=renderToStaticMarkup(React.createElement(Cards,{section,home:managed,busy:false,onPublish:async()=>true,onHeroEdit:()=>{}}));for(const action of ['Preview','Publish','Edit'])assert(cards.includes(action),section+' '+action);if(section!=='home')assert(cards.includes('Delete '));if(section==='social')assert(cards.includes('Hide'));}console.log('PASS: Hero, Values and Social management cards render consistent actions.');

const optionalDescriptions={...managed,values:[{title:'Title Only',description:''},{title:'Omitted Description'},{title:'Whitespace Description',description:'   '}],additionalValues:[{title:'Additional Title Only'}]};
await send({kind:'home',action:'publish',record:optionalDescriptions,baseUpdatedAt:(await read()).entries.find(e=>e.id===home.id).updatedAt});
const optionalFeed=await publicPortalData(getStorage());
assert(optionalFeed.home.values.every(value=>value.description===''));
assert.equal(optionalFeed.home.additionalValues[0].description,'');
const optionalHtml=renderToStaticMarkup(React.createElement(Portal,{initialData:optionalFeed}));
for(const title of ['Title Only','Omitted Description','Whitespace Description'])assert(optionalHtml.includes(title));
const missingTitle=await cms.POST(request({kind:'home',action:'publish',record:{...optionalDescriptions,values:[{title:'',description:''}]},baseUpdatedAt:(await read()).entries.find(e=>e.id===home.id).updatedAt}));
assert.equal(missingTitle.status,400,'value title remains required');
console.log('PASS: values with blank, omitted or whitespace-only descriptions publish and render; titles remain required.');

// Several public cards may belong to the same configured brand.
const existingPage=(await read()).records.programmes.find(page=>page.brand==='SEEN');
assert(existingPage,'default SEEN page exists');
const addedPage={...existingPage,id:crypto.randomUUID(),displayName:'New Community Initiative',overview:'A new public brand card.',published:true};
await send({kind:'programme',action:'publish',record:addedPage,baseUpdatedAt:''});
let cardFeed=await publicPortalData(getStorage());
let cardHtml=renderToStaticMarkup(React.createElement(Portal,{initialData:cardFeed}));
assert(cardHtml.includes('New Community Initiative'),'new same-brand page appears publicly');
assert(cardFeed.programmes.some(page=>page.overview===existingPage.overview),'original page is preserved');
await send({kind:'programme',action:'visibility',record:{id:addedPage.id,published:false},baseUpdatedAt:(await read()).entries.find(entry=>entry.id===addedPage.id).updatedAt});
cardFeed=await publicPortalData(getStorage());
cardHtml=renderToStaticMarkup(React.createElement(Portal,{initialData:cardFeed}));
assert(!cardHtml.includes('New Community Initiative'),'hidden page disappears');
assert(cardFeed.brands.includes('SEEN'),'hiding one page preserves other visible pages of that brand');
console.log('PASS: additional same-brand cards publish and render; independent hiding preserves the existing brand page.');

for(const [patch,expected] of [[{overview:''},'Description'],[{overview:'x'.repeat(5001)},'Description'],[{brand:''},'Brand']]){
 const response=await cms.POST(request({kind:'programme',action:'publish',record:{...addedPage,id:crypto.randomUUID(),...patch},baseUpdatedAt:''}));
 assert.equal(response.status,400);const problem=await response.json();assert(problem.error.includes(expected),problem.error);assert(!problem.error.includes('Check the required text fields'),problem.error);
}
const completedPage={...addedPage,id:crypto.randomUUID(),displayName:'Completed Brand Page',overview:'A description written by the user.',subtitle:'',focusAreas:[],imageUrl:''};
await send({kind:'programme',action:'publish',record:completedPage,baseUpdatedAt:''});assert((await publicPortalData(getStorage())).programmes.some(page=>page.displayName==='Completed Brand Page'));
console.log('PASS: brand publishing identifies missing Brand/Description and description length; a completed new page publishes with optional fields blank.');

const retiredDescription='Supporting seniors through active ageing, community participation, wellness activities and meaningful social connections.';
const seededPage={...existingPage,id:'legacy-description-test',overview:retiredDescription};delete seededPage.descriptionSource;
await store.apply([{type:'upsert',record:{id:seededPage.id,kind:'programme_profile',payload:seededPage,updatedAt:new Date().toISOString()}}]);
const withoutDefault=await publicPortalData(getStorage());assert(!withoutDefault.programmes.some(page=>page.overview===retiredDescription),'old seeded descriptions are not public content');
assert.equal((await read()).records.programmes.find(page=>page.id===seededPage.id).overview,'','CMS opens old seeded descriptions blank');
await send({kind:'programme',action:'publish',record:{...seededPage,overview:'My own brand description.'},baseUpdatedAt:(await read()).entries.find(entry=>entry.id===seededPage.id).updatedAt});assert((await publicPortalData(getStorage())).programmes.some(page=>page.overview==='My own brand description.'));
const {default:Showcase}=await mod('app/programme-showcase.tsx');const emptyDescriptionHtml=renderToStaticMarkup(React.createElement(Showcase,{data:{brands:['SEEN'],programmes:[]},renderStories:()=>null}));assert(!emptyDescriptionHtml.includes('ps-programme-description'),'no description fallback when a page does not exist');
console.log('PASS: old seeded description is cleared, authored description is preserved, and absent brand pages have no fallback description.');

const beforeOrdering=await read(),savedBrandPages=beforeOrdering.records.programmes;
await send({kind:'programme',action:'draft',record:{...existingPage,overview:'Unpublished editorial changes.'},baseUpdatedAt:beforeOrdering.entries.find(entry=>entry.id===existingPage.id).updatedAt});
const orderedIds=[completedPage.id,...savedBrandPages.filter(page=>page.id!==completedPage.id).map(page=>page.id)].reverse();orderedIds.splice(orderedIds.indexOf(completedPage.id),1);orderedIds.unshift(completedPage.id);
const orderRequest={kind:'programme',action:'reorder',order:orderedIds.map(id=>({id,baseUpdatedAt:beforeOrdering.entries.find(entry=>entry.id===id).updatedAt}))};
await send(orderRequest);
const afterOrdering=await read();for(const [index,id] of orderedIds.entries()){const page=afterOrdering.records.programmes.find(page=>page.id===id);assert.equal(page.sortOrder,index);const {sortOrder,...content}=page;assert.deepEqual(content,savedBrandPages.find(page=>page.id===id),'reordering preserves content and visibility');}
const orderedDraft=afterOrdering.drafts.find(draft=>draft.record.id===existingPage.id);assert.equal(orderedDraft.record.overview,'Unpublished editorial changes.');assert.equal(orderedDraft.baseUpdatedAt,afterOrdering.entries.find(entry=>entry.id===existingPage.id).updatedAt);
const orderedFeed=await publicPortalData(getStorage()),orderedHtml=renderToStaticMarkup(React.createElement(Showcase,{data:orderedFeed,renderStories:()=>null}));assert.equal(orderedHtml.match(/<h3>([^<]*)<\/h3>/)[1],'Completed Brand Page','public cards use the chosen order across brands and repeated-brand pages');
const staleOrder=await cms.POST(request(orderRequest));assert.equal(staleOrder.status,400,'stale editor cannot overwrite a newer order');
const incompleteOrder=await cms.POST(request({...orderRequest,order:orderRequest.order.slice(1)}));assert.equal(incompleteOrder.status,400,'partial requests cannot drop cards from the order');
console.log('PASS: brand positions persist, public order matches, content/visibility/drafts remain intact, and stale or incomplete reorders are rejected.');
