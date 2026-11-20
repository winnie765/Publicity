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
