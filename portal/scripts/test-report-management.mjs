// Uses the existing isolated SQLite/cloud-storage test setup, never live records or Gemini.
await import('./test-public-site-manager.mjs');
const {default:fs}=await import('node:fs'),{default:ts}=await import('typescript'),{default:assert}=await import('node:assert/strict');
const dir='.sites-runtime/cms-tests';
const {DatabaseSync}=await import('node:sqlite'),sql=new DatabaseSync(':memory:');for(const m of JSON.parse(fs.readFileSync('drizzle/meta/_journal.json')).entries)sql.exec(fs.readFileSync('drizzle/'+m.tag+'.sql','utf8'));
const query=(s,v=[])=>({bind:(...values)=>query(s,values),first:async()=>sql.prepare(s).get(...v),all:async()=>({results:sql.prepare(s).all(...v)}),run:()=>sql.prepare(s).run(...v)});
globalThis.cmsTestEnv.DB={prepare:s=>query(s),batch:async statements=>{sql.exec('BEGIN');try{const result=statements.map(s=>s.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}}};
function compile(file,name,replacements){let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const [from,to] of Object.entries(replacements))js=js.replaceAll("from '"+from+"'","from './"+to+"'");fs.writeFileSync(dir+'/'+name,js);return import('../'+dir+'/'+name);}
const service=await compile('lib/report-management.ts','report-management.mjs',{'./recycle-bin':'lib-recycle-bin-ts.mjs','./record-operations':'lib-record-operations-ts.mjs'});
const api=await compile('app/api/report-management/route.ts','report-management-route.mjs',{'../../../lib/workspace-security':'lib-workspace-security-ts.mjs','../../../lib/storage':'lib-storage-d1-ts.mjs','../../../lib/report-management':'report-management.mjs'});
const {getStorage}=await import('../'+dir+'/lib-storage-d1-ts.mjs'),security=await import('../'+dir+'/lib-workspace-security-ts.mjs'),store=getStorage();
const origin='https://portal.test',headers={cookie:security.sessionCookie+'='+await security.createSession(),origin,'content-type':'application/json'},post=body=>api.POST(new Request(origin+'/api/report-management',{method:'POST',headers,body:JSON.stringify(body)}));
assert.equal((await api.GET(new Request(origin+'/api/report-management'))).status,401);assert.equal((await api.POST(new Request(origin+'/api/report-management',{method:'POST',headers:{...headers,origin:'https://other.test'},body:'{}'}))).status,403);
const snapshot={id:'report-lifecycle-test',generatedAt:'2026-08-01T01:00:00Z',period:{label:'July 2026',frequency:'monthly'},current:{posts:5},content:'Exact immutable report snapshot',ai:null};
await store.apply([{type:'upsert',record:{id:snapshot.id,kind:'generated_report',payload:snapshot,updatedAt:snapshot.generatedAt}}]);
await store.apply([{type:'upsert',record:{id:'unrelated-post',kind:'posts',payload:{id:'unrelated-post',title:'Unchanged source record'},updatedAt:snapshot.generatedAt}}]);
const other=(await store.readRecords()).find(r=>r.kind==='posts');assert(other);await assert.rejects(()=>service.manageReport(store,{action:'delete',id:other.id,confirmation:'delete'}));
assert.equal((await post({action:'delete',id:snapshot.id})).status,400);assert.equal((await post({action:'delete',id:snapshot.id,confirmation:'delete'})).status,200);assert(!(await store.readRecords()).some(r=>r.id===snapshot.id));
let trash=(await service.reportTrash(store)).reports.find(r=>r.label==='July 2026');assert(trash);assert(trash.expiresAt);assert(!('content'in trash));assert.equal((await service.reportTrash(store)).retentionDays,30);
assert.equal((await post({action:'restore',id:trash.id})).status,200);assert.deepEqual((await store.readRecords()).find(r=>r.id===snapshot.id).payload,snapshot);assert(!(await store.readRecords()).some(r=>r.id===trash.id));
assert.equal((await post({action:'delete',id:snapshot.id,confirmation:'delete'})).status,200);trash=(await service.reportTrash(store)).reports.find(r=>r.label==='July 2026');
await store.apply([{type:'upsert',record:{id:snapshot.id,kind:'generated_report',payload:{...snapshot,content:'Concurrent active report'},updatedAt:snapshot.generatedAt}}]);assert.equal((await post({action:'restore',id:trash.id})).status,400);assert((await store.readRecords()).some(r=>r.id===trash.id));
assert.equal((await post({action:'purge',id:trash.id})).status,400);assert.equal((await post({action:'purge',id:trash.id,confirmation:'purge'})).status,200);assert(!(await store.readRecords()).some(r=>r.id===trash.id));assert.deepEqual((await store.readRecords()).find(r=>r.id===other.id),other);
console.log('PASS: private report APIs, origin protection, confirmation, atomic soft delete, report-only Trash metadata, configured retention, exact snapshot restore, collision protection, permanent delete and unrelated-record preservation.');
sql.close();
