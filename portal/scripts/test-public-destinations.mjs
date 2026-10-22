import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
const out='.sites-runtime/public-destinations-tests';fs.mkdirSync(out,{recursive:true});const compiled=new Set();
function compile(file){const id=file.replace(/[/.]/g,'-')+'.mjs';if(compiled.has(file))return id;compiled.add(file);let source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/import\s+['"][^'"]+\.css['"];?/g,'').replaceAll("from 'next/link'","from 'next/link.js'").replaceAll("from 'next/navigation'","from 'next/navigation.js'");source=source.replace(/(from\s*|import\s*\()(['"])([^'"]+)\2/g,(match,prefix,q,target)=>{if(!target.startsWith('.'))return match;const base=path.posix.normalize(path.posix.join(path.posix.dirname(file),target)),next=['.ts','.tsx','/index.ts','/index.tsx'].map(s=>base+s).find(p=>fs.existsSync(p));return next?prefix+q+'./'+compile(next)+q:match});fs.writeFileSync(out+'/'+id,source);return id;}
const load=async file=>import('../'+out+'/'+compile(file));



const {selectedDestinations,toggleDestination}=await load('lib/public-destinations.ts');
const {default:Fields}=await load('app/public-publishing-fields.tsx');
const {blankPost}=await load('app/model.ts');
let post={...blankPost(),public_summary:'Approved summary',public_article:'Saved article'};
const toggle=key=>{post={...post,...toggleDestination(post,key)}};
assert.deepEqual(selectedDestinations(post),['private']);
toggle('homepage');assert.equal(post.show_on_public_site,true);assert.equal(post.show_in_community_highlights,true);assert.equal(post.show_on_home_page,true);
toggle('stories');toggle('programme');assert.equal(selectedDestinations(post).length,4);
const render=()=>renderToStaticMarkup(React.createElement(Fields,{post,onChange(){}}));
assert(render().includes('Story Category'));assert(render().includes('Public Article'));
toggle('highlights');assert.equal(post.show_on_home_page,false);assert.equal(post.show_in_stories,true);
toggle('stories');assert(!render().includes('Story Category'));assert(!render().includes('Public Article'));
toggle('private');assert.deepEqual(selectedDestinations(post),['private']);assert.equal(post.show_on_public_site,false);assert.equal(post.public_article,'Saved article');assert.equal(post.public_summary,'Approved summary');
assert.equal((render().match(/aria-pressed=/g)||[]).length,5);
assert(render().includes('Internal notes and analytics remain private.'));
assert.deepEqual(selectedDestinations({show_on_public_site:true,show_on_home_page:true}),['highlights','homepage']);
console.log('PASS: destination dependencies, multiple selections, private reset, content preservation and conditional story fields.');
