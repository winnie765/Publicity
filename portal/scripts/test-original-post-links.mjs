import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import JSZip from 'jszip';
const out='.sites-runtime/original-post-tests';fs.mkdirSync(out,{recursive:true});const compiled=new Set();
function compile(file){
 const id=file.replace(/[/.]/g,'-')+'.mjs';if(compiled.has(file))return id;compiled.add(file);
 let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/import\s+['"][^'"]+\.css['"];?/g,'').replaceAll("from 'next/link'","from 'next/link.js'").replaceAll("from 'next/navigation'","from 'next/navigation.js'");
 code=code.replace(/(from\s*|import\s*\()(['"])([^'"]+)\2/g,(match,prefix,q,target)=>{if(!target.startsWith('.')&&!target.startsWith('@/'))return match;const base=target.startsWith('@/')?target.slice(2):path.posix.normalize(path.posix.join(path.posix.dirname(file),target)),next=['.ts','.tsx','/index.ts','/index.tsx'].map(s=>base+s).find(p=>fs.existsSync(p));return next?prefix+q+'./'+compile(next)+q:match});
 fs.writeFileSync(out+'/'+id,code);return id;
}
const load=async file=>import('../'+out+'/'+compile(file));
const {originalPostUrl,safeOriginalPostUrl}=await load('lib/original-post-url.ts');
assert.equal(originalPostUrl({url:'https://www.facebook.com/legacy'}),'https://www.facebook.com/legacy');
assert.equal(originalPostUrl({url:'https://www.facebook.com/legacy',original_post_url:''}),'','Clearing a link must not revive the old alias');
for(const value of ['javascript:alert(1)','data:text/html,test','//example.com/post','https://user:password@example.com/post','https://'])assert.equal(safeOriginalPostUrl(value),'');
const {blankPost,defaultConfig}=await load('app/model.ts'),{preparePostContentAction}=await load('lib/post-content-actions.ts'),{applyDataAction,loadData}=await load('lib/data-service.ts');
const config={...structuredClone(defaultConfig),topics:['HHP'],types:['Image'],locations:['Nanyang'],accounts:['Facebook','Instagram','Workvivo'].map(platform=>({name:platform+' GLOW',platform,brand:'GLOW'}))};
const values=new Map([['configuration',{id:'configuration',kind:'config',payload:config,updatedAt:new Date().toISOString()}]]);
const store={readRecords:async()=>structuredClone([...values.values()]),readAudit:async()=>[],apply:async changes=>{for(const change of changes){if(change.type==='upsert')values.set(change.record.id,structuredClone(change.record));else if(change.type==='delete')values.delete(change.id);}}};
const urls={Facebook:'https://www.facebook.com/glow/posts/source?a=1&b=2',Instagram:'https://www.instagram.com/p/source/',Workvivo:'https://staff.workvivo.com/spaces/source'};
const save=async post=>applyDataAction(store,await preparePostContentAction(store,{action:'upsert',kind:'posts',items:[post]}));
for(const platform of Object.keys(urls)){
 const account=config.accounts.find(a=>a.platform===platform),post={...blankPost(),id:platform,title:platform+' story',description:'Verified source description.',date:'2026-10-01',platform,account:account.name,brand:account.brand||'GLOW',location:'Nanyang',type:config.types[0],topic:config.topics[0],likes:10,original_post_url:urls[platform],url:'https://www.facebook.com/legacy',show_on_public_site:platform!=='Workvivo',public_summary:'Approved public story.',show_in_community_highlights:platform!=='Workvivo',show_in_stories:platform!=='Workvivo'};
 await save(post);assert.equal(values.get(platform).payload.original_post_url,urls[platform]);
 const imported={...post,likes:12};delete imported.original_post_url;
 const prepared=await preparePostContentAction(store,{action:'import',batches:[{kind:'posts',items:[imported]}]});assert.equal(prepared.batches[0].items[0].original_post_url,urls[platform]);
 await assert.rejects(()=>save({...post,original_post_url:'javascript:alert(1)'}));
}
const legacy={...values.get('Facebook'),id:'legacy-record',payload:{...values.get('Facebook').payload,id:'legacy-record',url:urls.Facebook}};delete legacy.payload.original_post_url;values.set(legacy.id,legacy);const oldImport=await preparePostContentAction(store,{action:'import',batches:[{kind:'posts',items:[{...legacy.payload,url:''}]}]});assert.equal(oldImport.batches[0].items[0].original_post_url,urls.Facebook,'Metric-only import preserves an old legacy URL');values.delete(legacy.id);
const {publicPortalData}=await load('lib/workspace-service.ts');
let publicData=await publicPortalData(store,'2026-10-19');
assert.equal(publicData.stories.find(s=>s.platform==='Facebook').url,urls.Facebook);
assert.equal(publicData.stories.find(s=>s.platform==='Instagram').url,urls.Instagram);
assert.ok(!JSON.stringify(publicData).includes(urls.Workvivo),'Private Workvivo URL must never enter public data');
const {default:Link}=await load('app/original-post-link.tsx'),{default:Cards}=await load('app/post-performance-cards.tsx'),{default:Fields}=await load('app/post-content-fields.tsx');
const data=await loadData(store),post=data.posts.find(p=>p.platform==='Facebook');
const link=renderToStaticMarkup(React.createElement(Link,{post}));assert.ok(link.includes('target="_blank"'));assert.ok(link.includes('rel="noopener noreferrer"'));assert.ok(link.includes('View Original Post'));assert.ok(!link.includes('legacy'));
assert.equal(renderToStaticMarkup(React.createElement(Link,{post:{url:'javascript:alert(1)'}})),'');
for(const platform of Object.keys(urls)){const p=data.posts.find(p=>p.platform===platform);assert.ok(renderToStaticMarkup(React.createElement(Cards,{posts:[p],platform})).includes('View Original Post'));assert.ok(renderToStaticMarkup(React.createElement(Fields,{post:p,onChange(){}})).includes('Original Post URL'));}
const {default:Landing}=await load('app/public-landing.tsx'),{default:Highlights}=await load('app/community-highlights-carousel.tsx');
assert.ok(renderToStaticMarkup(React.createElement(Landing,{data:publicData})).includes('View Original Facebook Post'));
assert.ok(renderToStaticMarkup(React.createElement(Highlights,{stories:publicData.stories})).includes('View Original Facebook Post'));
const {calculateMonthlyReport}=await load('lib/monthly-report.ts'),{reportHTML,reportSections}=await load('lib/report-document.ts'),{downloadReportWord}=await load('app/report-exports.ts');
const report=calculateMonthlyReport(data,2026,10);assert.equal(report.hits.find(p=>p.platform==='Facebook').original_post_url,urls.Facebook);assert.ok(reportSections(report).some(section=>section.tables.some(table=>table.headers.includes('Original Post'))));
const html=reportHTML(report);assert.ok(html.includes('View Original Post'));assert.ok(html.includes('source?a=1&amp;b=2'));
let blob;const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL,oldDocument=globalThis.document;
try{URL.createObjectURL=value=>{blob=value;return 'blob:test'};URL.revokeObjectURL=()=>{};globalThis.document={createElement:()=>({click(){}})};await downloadReportWord(report);const zip=await JSZip.loadAsync(await blob.arrayBuffer()),doc=await zip.file('word/document.xml').async('string'),rels=await zip.file('word/_rels/document.xml.rels').async('string');assert.ok(doc.includes('<w:hyperlink'));assert.ok(rels.includes('TargetMode="External"'));assert.ok(rels.includes('source?a=1&amp;b=2'));}finally{URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;globalThis.document=oldDocument;}
await save({...post,original_post_url:''});publicData=await publicPortalData(store,'2026-10-19');assert.equal(publicData.stories.find(s=>s.platform==='Facebook').url,'');
const {normalizeRecord}=await load('app/import.ts');const importedPost={...post};delete importedPost.original_post_url;assert.equal(normalizeRecord('posts',{...importedPost,'Original Post URL':urls.Facebook}).original_post_url,urls.Facebook);
console.log('PASS: persisted source URLs across platforms, legacy fallback, clearing, import preservation, safe new-tab links, post forms and cards, public projection and privacy, HTML and Word report hyperlinks. No live AI calls.');
