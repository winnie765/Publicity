import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
mkdirSync('.sites-runtime',{recursive:true});
writeFileSync('.sites-runtime/original-post-url.mjs',ts.transpileModule(readFileSync('lib/original-post-url.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
writeFileSync('.sites-runtime/model.mjs',ts.transpileModule(readFileSync('app/model.ts','utf8').replace("from '../lib/original-post-url'","from './original-post-url.mjs'"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
writeFileSync('.sites-runtime/fixture.mjs',ts.transpileModule(readFileSync('scripts/fixtures/data.ts','utf8').replace("from '../../app/model'","from './model.mjs'"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {testData}=await import('../.sites-runtime/fixture.mjs');
const {engagement,breakout,insights,validate,defaultConfig}=await import('../.sites-runtime/model.mjs');
const data=testData(),external=data.posts.filter(p=>p.platform!=='Workvivo'),internal=data.posts.filter(p=>p.platform==='Workvivo');
assert.equal(data.posts.length,144);
for(const p of data.posts)validate('posts',p,data.config);
assert.equal(engagement({likes:10,comments:3,shares:2,saves:1}),16);
assert(external.every(p=>p.platform!=='Workvivo'));
assert(internal.every(p=>p.platform==='Workvivo'));
for(const r of breakout(external)){const peers=external.filter(p=>p.platform===r.post.platform&&p.type===r.post.type&&p.id!==r.post.id);assert.equal(r.peers,peers.length);const expected=peers.reduce((n,p)=>n+engagement(p),0)/peers.length;assert.equal(r.baseline,expected);}
const p=data.posts[0];assert.throws(()=>validate('posts',{...p,reach:-1},data.config));assert.throws(()=>validate('posts',{...p,date:'2026-02-31'},data.config));assert.throws(()=>validate('posts',{...p,brand:'Unknown'},data.config));assert.throws(()=>validate('posts',{...p,account:'SEEN Instagram',platform:'Facebook'},data.config));assert.throws(()=>validate('posts',{...p,url:'javascript:alert(1)'},data.config));assert.throws(()=>validate('interactions',{...data.interactions[0],count:0},data.config));
assert.equal(insights(external.slice(0,2)).length,0);assert(insights(external).every(i=>i.n>=3&&Number.isFinite(i.lift)));assert(insights([]).length===0);assert(breakout([]).length===0);
console.log('PASS: validation, peer baseline, feature evidence, empty states, and platform isolation.');
