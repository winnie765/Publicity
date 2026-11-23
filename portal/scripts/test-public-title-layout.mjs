import assert from 'node:assert/strict';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/public-title-layout-tests');
const {publicTitleDensity}=await load('lib/public-title-layout.ts');
const {default:Card}=await load('app/public-post-card.tsx');
for(const title of ['Senior wellness','社区乐龄活动','GLOW 社区活动'])assert.equal(publicTitleDensity(title),'short');
for(const title of ['A community programme bringing seniors and families together for healthier living and stronger social connections','社区乐龄活动与健康生活分享让长者与家人共同参与社区关怀计划并建立更紧密的联系与友谊','GLOW 社区乐龄活动 — Supporting seniors and families through meaningful programmes and lifelong learning','A'.repeat(40)]){
 assert.equal(publicTitleDensity(title),'long');
 const html=renderToStaticMarkup(React.createElement(Card,{title},React.createElement('h3',null,title)));
 assert(html.includes('data-title-density="long"'));assert(html.includes(title));assert(!html.includes('line-clamp'));
}
console.log('PASS short/long English, Chinese and mixed title presentation hints; complete titles preserved.');
