import {AuthenticatedRequest} from './workspace-test-session.mjs';
import './test-monthly-reports.mjs';
import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');for(const m of JSON.parse(fs.readFileSync('drizzle/meta/_journal.json')).entries)sql.exec(fs.readFileSync('drizzle/'+m.tag+'.sql','utf8'));
const query=(text,bindings=[])=>({bind:(...values)=>query(text,values),first:async()=>sql.prepare(text).get(...bindings),all:async()=>({results:sql.prepare(text).all(...bindings)}),run:async()=>sql.prepare(text).run(...bindings),execute:()=>/^\s*SELECT/i.test(text)?{results:sql.prepare(text).all(...bindings)}:{results:[],meta:sql.prepare(text).run(...bindings)}});
globalThis.reportTestEnv={DB:{prepare:text=>query(text),batch:async statements=>{sql.exec('BEGIN');try{const values=statements.map(s=>s.execute());sql.exec('COMMIT');return values}catch(e){sql.exec('ROLLBACK');throw e}}}};
for(const file of ['lib/storage-d1.ts','lib/ai-runtime-d1.ts','app/api/reports/route.ts','app/api/report-automation/route.ts']){
 const name=file.includes('report-automation')?'report-automation-route':file.includes('/reports/')?'report-route':file.split('/').at(-1).replace('.ts','');
 const code=fs.readFileSync(file,'utf8').replace("import {env} from 'cloudflare:workers';",'const env=globalThis.reportTestEnv;').replace("from '../../../lib/storage'","from './storage-d1.mjs'").replace("from '../../../lib/ai-runtime'","from './ai-runtime-d1.mjs'").replace(/from ['"](?:\.\.\/|\.\/)+(?:lib\/)?([\w-]+)['"]/g,"from './$1.mjs'");
 fs.writeFileSync('.sites-runtime/'+name+'.mjs',ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
}
const {GET,POST}=await import('../.sites-runtime/report-route.mjs'),{POST:run}=await import('../.sites-runtime/report-automation-route.mjs');
const request=(body,origin='https://portal.test')=>POST(new AuthenticatedRequest('https://portal.test/api/reports',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}));
let response=await GET(new AuthenticatedRequest('https://portal.test/api/reports'));assert.deepEqual((await response.json()).reports,[]);
assert.equal((await request({action:'generate',year:2026,month:13})).status,400);assert.equal((await request({action:'generate',year:2026,month:9},'https://evil.test')).status,403);
response=await request({action:'generate',year:2026,month:9});assert.equal(response.status,200);const {report}=await response.json();assert.equal(report.ai.mode,'calculated');assert.equal(report.current.posts,0);assert.equal(sql.prepare("SELECT count(*) n FROM records WHERE kind='generated_report'").get().n,1);
response=await GET(new AuthenticatedRequest('https://portal.test/api/reports?id='+report.id));assert.equal((await response.json()).report.id,report.id);assert.equal((await GET(new AuthenticatedRequest('https://portal.test/api/reports?id=missing'))).status,404);
response=await request({action:'automation',enabled:true,frequency:'monthly'});assert.equal(response.status,200);assert.equal((await response.json()).automation.enabled,true);assert.equal((await request({action:'automation',enabled:'yes',frequency:'monthly'})).status,400);
response=await run(new AuthenticatedRequest('https://portal.test/api/report-automation',{method:'POST'}));assert.equal(response.status,200);const auto=await response.json();assert(auto.generated);response=await run(new AuthenticatedRequest('https://portal.test/api/report-automation',{method:'POST'}));assert.equal((await response.json()).generated,false);
assert.equal(sql.prepare("SELECT count(*) n FROM records WHERE kind IN ('posts','followers','interactions')").get().n,0);sql.close();
console.log('PASS: real SQLite archive persistence, reports GET/POST, historical generation, origin protection, period validation, automation settings, automatic generation and duplicate prevention.');
