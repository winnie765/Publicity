import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import fs from 'node:fs';import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/public-page-data-tests');
const {default:Portal}=await load('app/public-portal.tsx'),{publicPageData}=await load('lib/public-page-data.ts'),{defaultPublicHome}=await load('lib/public-site-config.ts');
const stories=Array.from({length:100},(_,i)=>({id:'story-'+i,title:'Community activity '+i,summary:'Verified programme update',body:'Public text',bodyFormat:'plain',author:'',imageUrl:'',gallery:[],section:'Community',brand:'GLOW',platform:'Facebook',date:'2026-11-01',featured:false,showInStories:true}));
const selection={featured:['story-8','story-7'],performance:['story-9'],engagement:['story-9'],reach:[],views:[],trending:[]};
const data={home:defaultPublicHome,stories,brands:['GLOW'],events:[],partners:[],programmes:[],impact:null,showcases:{automatic:selection,asOf:'2026-11-20',latestPosts:['story-99'],latestStories:[],latestHighlights:[],periods:{'30d':selection,'90d':selection,ytd:selection}}};
for(const page of ['home','community','activities','stories','programmes','partners','impact','article']){
 const slug=page==='article'?'story-20':'';const projected=publicPageData(data,page,slug);
 const full=renderToStaticMarkup(React.createElement(Portal,{initialData:data,page,slug,preview:true})),compact=renderToStaticMarkup(React.createElement(Portal,{initialData:projected,page,slug,preview:true}));
 assert.equal(compact,full,'route transfer must preserve rendered content: '+page);assert(projected.stories.length<stories.length);
}
assert.equal(publicPageData(data,'programme'),data);assert.equal(publicPageData(data,'event'),data);
const source=fs.readFileSync('app/public-portal.tsx','utf8');assert(!source.includes("addEventListener('focus'"));assert(source.includes('300000'));assert(!source.includes('setInterval(refresh,30000)'));
const unavailable=renderToStaticMarkup(React.createElement(Portal,{initialUnavailable:true}));assert(unavailable.includes('temporarily unavailable'));assert(!unavailable.includes('Gathering our community stories'));
console.log('PASS route-specific payloads preserve all rendered public content; preview, first-load error and controlled background checks.');
const oldContent=renderToStaticMarkup(React.createElement(Portal,{initialData:data,generatedAt:'2020-01-01T00:00:00Z'}));
assert(!oldContent.includes('latest content check is delayed'));assert(!oldContent.includes('Showing previously published content'));assert(oldContent.includes('Community activity'));
console.log('PASS previously loaded content stays visible without a delayed-refresh banner.');
// Exercise the actual refresh effect with a fake clock and network, without production data.
let effect,scheduled,requests=0,fail=true,updates=0;
globalThis.publicRetryHooks={useState:value=>[value,()=>{updates++;}],useEffect:fn=>{effect=fn;}};
const retryLoad=testCompiler('.sites-runtime/public-retry-tests',{transform:(source,file)=>file==='app/public-portal.tsx'?source.replace("import {useEffect,useState} from 'react';",'const {useEffect,useState}=globalThis.publicRetryHooks;'):source});
const {default:RetryPortal}=await retryLoad('app/public-portal.tsx');
const original={fetch:globalThis.fetch,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,window:globalThis.window,document:globalThis.document};
try{
 globalThis.setTimeout=(fn,ms)=>{scheduled={fn,ms};return 1;};globalThis.clearTimeout=()=>{};
 globalThis.document={visibilityState:'visible'};globalThis.window={addEventListener(){},removeEventListener(){}};
 globalThis.fetch=async()=>{requests++;if(fail)throw Error('offline');return new Response(null,{status:304});};
 RetryPortal({initialData:data,initialRevision:'same'});const cleanup=effect();
 assert.equal(requests,0,'Server data does not trigger a duplicate initial fetch');assert.equal(scheduled.ms,300000);
 await scheduled.fn();assert.equal(requests,1);assert.equal(scheduled.ms,30000);
 await scheduled.fn();assert.equal(requests,2);assert.equal(scheduled.ms,60000);
 fail=false;await scheduled.fn();assert.equal(scheduled.ms,300000,'Successful validation resets retry delay');
 const count=requests;globalThis.document.visibilityState='hidden';await scheduled.fn();assert.equal(requests,count,'Hidden pages do not poll');
 cleanup();assert(updates>0);
 console.log('PASS actual refresh effect: automatic retries, increasing delay, success reset, no duplicate initial fetch and hidden-tab pause.');
}finally{Object.assign(globalThis,original);delete globalThis.publicRetryHooks;}
