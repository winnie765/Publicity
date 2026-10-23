import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
const out='.sites-runtime/bulk-recovery-tests';fs.mkdirSync(out,{recursive:true});const compiled=new Set();
function compile(file){const id=file.replace(/[/.]/g,'-')+'.mjs';if(compiled.has(file))return id;compiled.add(file);let source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/import\s+['"][^'"]+\.css['"];?/g,'').replaceAll("from 'next/link'","from 'next/link.js'").replaceAll("from 'next/navigation'","from 'next/navigation.js'");source=source.replace(/(from\s*|import\s*\()(['"])([^'"]+)\2/g,(match,prefix,q,target)=>{if(!target.startsWith('.'))return match;const base=path.posix.normalize(path.posix.join(path.posix.dirname(file),target)),next=['.ts','.tsx','/index.ts','/index.tsx'].map(s=>base+s).find(p=>fs.existsSync(p));return next?prefix+q+'./'+compile(next)+q:match});fs.writeFileSync(out+'/'+id,source);return id;}
const load=async file=>import('../'+out+'/'+compile(file));



const {bulkRecoveryChanges,bulkRecordsSql,bulkDeletesSql}=await load('lib/bulk-records.ts');
const {recycleStorage}=await load('lib/recycle-bin.ts');
const {PGlite}=await import('../.sites-runtime/pg-validation/node_modules/@electric-sql/pglite/dist/index.js');
const db=new PGlite();await db.exec('CREATE TABLE portal_records(id text PRIMARY KEY,kind text,payload jsonb,record_date date,updated_at timestamp)');
const rows=Array.from({length:1000},(_,i)=>({id:'post-'+i,kind:'posts',payload:{id:'post-'+i,title:'Historical post',likes:i,date:'2026-10-01'},updatedAt:new Date().toISOString()}));
rows.push({id:'configuration',kind:'config',payload:{brands:['GLOW']},updatedAt:new Date().toISOString()});
const initial=bulkRecoveryChanges([{type:'delete',id:'unused',kind:'posts'},...rows.map(record=>({type:'upsert',record}))]);
await db.query(bulkRecordsSql,[JSON.stringify(initial.records)]);
let plan;const store=recycleStorage({readRecords:async()=>rows,readAudit:async()=>[],apply:async changes=>{plan=bulkRecoveryChanges(changes);assert(plan);await db.transaction(async tx=>{await tx.query(bulkRecordsSql,[JSON.stringify(plan.records)]);await tx.query(bulkDeletesSql,[JSON.stringify(plan.deleted)])})}});
await store.apply([{type:'deleteAllData'},{type:'clearFacebookSnapshots'},{type:'clearAICache'}]);
assert.equal(plan.deleted.length,1000);assert.equal(plan.records.length,1000);assert(plan.clearCache&&plan.clearSnapshots);
const result=await db.query('SELECT kind,count(*)::int AS n FROM portal_records GROUP BY kind');assert.deepEqual(Object.fromEntries(result.rows.map(r=>[r.kind,r.n])),{config:1,trash:1000});
assert.equal((await db.query("SELECT payload->'original'->'payload'->>'likes' AS likes FROM portal_records WHERE kind='trash' AND payload->'original'->>'id'='post-999'")).rows[0].likes,'999');
assert.equal(bulkRecoveryChanges([{type:'delete',id:'same',kind:'posts'},{type:'upsert',record:{...rows[0],id:'same'}}]),null);
const before=(await db.query('SELECT count(*)::int AS n FROM portal_records')).rows[0].n;
await assert.rejects(()=>db.transaction(async tx=>{await tx.query(bulkDeletesSql,[JSON.stringify([{id:'configuration',kind:'config'}])]);await tx.exec('SELECT missing_column FROM portal_records')}));
assert.equal((await db.query('SELECT count(*)::int AS n FROM portal_records')).rows[0].n,before);
await db.close();console.log('PASS: 1,000-record bulk trash operation, exact recovery values, configuration preservation, ordered-change fallback and transaction rollback.');
