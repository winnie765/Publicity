import fs from 'node:fs';import assert from 'node:assert/strict';import {testCompiler} from './test-support/compiler.mjs';
const {PGlite}=await import('../.sites-runtime/password-sql-tools/package/dist/index.js'),db=new PGlite();
await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
await db.exec(fs.readFileSync('supabase/migrations/20261019000000_primary_database.sql','utf8'));
await db.query("INSERT INTO public.portal_records(id,kind,payload) VALUES('preserved-post','posts',$1::jsonb)",[JSON.stringify({title:'Business data preserved',platform:'Facebook',likes:12})]);
const businessBefore=(await db.query("SELECT payload FROM public.portal_records WHERE id='preserved-post'")).rows[0].payload;
const map=r=>({...r,updatedAt:r.updated_at?.toISOString()}),store={
 readRecord:async id=>(await db.query('SELECT * FROM public.portal_records WHERE id=$1',[id])).rows.map(map)[0]||null,
 readRecords:async kinds=>(await db.query('SELECT * FROM public.portal_records WHERE kind=ANY($1::text[])',[kinds])).rows.map(map),
 readRecordsByIds:async ids=>(await db.query('SELECT * FROM public.portal_records WHERE id=ANY($1::text[])',[ids])).rows.map(map),
 apply:async changes=>{await db.query('SELECT public.portal_apply_changes($1::jsonb)',[JSON.stringify(changes)]);}
};
globalThis.passwordTestStore=store;process.env.WORKSPACE_PASSWORD='isolated-password-login-test';delete process.env.VERCEL;
const load=testCompiler('.sites-runtime/password-login-tests',{transform:(source,file)=>file==='lib/storage-d1.ts'?'export const getStorage=()=>globalThis.passwordTestStore;':source}),security=await load('lib/workspace-security.ts'),state=await load('lib/workspace-auth-state.ts'),route=await load('app/api/session/route.ts'),{middleware}=await load('middleware.ts'),{NextRequest}=await import('next/server.js');
let externalCalls=0;globalThis.fetch=async()=>{externalCalls++;throw Error('No external services are needed.');};
const logs=[],info=console.info,warn=console.warn;console.info=(...v)=>logs.push(JSON.stringify(v));console.warn=(...v)=>logs.push(JSON.stringify(v));
const origin='https://portal.test',request=(body,cookie='')=>new Request(origin+'/api/session',{method:'POST',headers:{origin,cookie,'Content-Type':'application/json'},body:JSON.stringify(body)}),post=(body,cookie)=>route.POST(request(body,cookie)),reset=async()=>db.exec("DELETE FROM public.portal_records WHERE kind IN ('workspace_session','workspace_login_attempt')");
try{
 assert.equal((await post({password:'incorrect'})).status,401);
 let r=await post({password:process.env.WORKSPACE_PASSWORD});assert.equal(r.status,200);assert.deepEqual(await r.clone().json(),{ok:true});const header=r.headers.get('set-cookie');assert(header.includes('HttpOnly')&&header.includes('Secure')&&header.includes('SameSite=Lax'));const cookie=header.split(';')[0],authenticatedRequest=new Request(origin+'/api/data',{headers:{cookie}});
 assert(await security.authenticated(authenticatedRequest));assert.equal((await(await route.GET(new Request(origin+'/api/session',{headers:{cookie}}))).json()).authenticated,true);
 assert.equal(await security.authenticated(authenticatedRequest,Date.now()+8*3600000+1000),false);
 assert.equal((await middleware(new NextRequest(origin+'/workspace/settings',{headers:{cookie}}))).status,200);
 assert.equal((await post({action:'logout'},cookie)).status,200);assert.equal(await security.authenticated(authenticatedRequest),false,'logout revokes a copied cookie');
 for(const action of ['verify','resend','cancel'])assert.equal((await post({action,code:'123456'})).status,400,'removed actions are rejected');
 assert.equal((await middleware(new NextRequest(origin+'/workspace'))).status,307);assert.equal((await middleware(new NextRequest(origin+'/api/data'))).status,401);assert.equal((await middleware(new NextRequest(origin+'/api/private.png'))).status,401);assert.equal((await middleware(new NextRequest(origin+'/'))).status,200);
 assert.equal((await route.POST(new Request(origin+'/api/session',{method:'POST',body:'{}'}))).status,403);
 await reset();for(let i=0;i<8;i++)assert.equal((await post({password:'wrong'})).status,401);assert.equal((await post({password:process.env.WORKSPACE_PASSWORD})).status,429);
 assert(await state.passwordAttempt(request({}),Date.now()+15*60000+1000));
 await reset();const concurrent=await Promise.all(Array.from({length:12},()=>state.passwordAttempt(request({}))));const accepted=concurrent.filter(Boolean).length;assert(accepted>0&&accepted<=8);const rows=await store.readRecords(['workspace_login_attempt']);assert.equal(rows.filter(r=>r.payload.scope==='global').length,accepted);assert.equal(rows.length,accepted*2,'failed reservations do not leave partial batches');
 await reset();process.env.VERCEL='1';for(let i=0;i<50;i++){const req=new Request(origin,{headers:{'x-forwarded-for':'192.0.2.'+Math.floor(i/8)}});assert(await state.passwordAttempt(req));}assert.equal(await state.passwordAttempt(new Request(origin,{headers:{'x-forwarded-for':'192.0.2.100'}})),false);delete process.env.VERCEL;
 process.env.REPORT_AUTOMATION_SECRET='isolated-report-automation-secret-more-than-32';process.env.CRON_SECRET='isolated-industry-cron-secret-more-than-32';
 for(const [path,secret] of [['/api/report-automation',process.env.REPORT_AUTOMATION_SECRET],['/api/industry-trends/refresh',process.env.CRON_SECRET]])assert.equal((await middleware(new NextRequest(origin+path,{headers:{authorization:'Bearer '+secret}}))).status,200);
 assert.equal((await middleware(new NextRequest(origin+'/api/data',{headers:{authorization:'Bearer '+process.env.CRON_SECRET}}))).status,401);
 await reset();globalThis.passwordTestStore={...store,apply:async()=>{throw Error('Database unavailable');}};assert.equal((await post({password:process.env.WORKSPACE_PASSWORD})).status,503);globalThis.passwordTestStore=store;
 assert.equal(externalCalls,0);assert(logs.every(line=>!line.includes(process.env.WORKSPACE_PASSWORD)&&!line.includes('password1.')));
 assert.deepEqual((await db.query("SELECT payload FROM public.portal_records WHERE id='preserved-post'")).rows[0].payload,businessBefore);
 // Verify optional archival and rollback preserve metadata/business records in isolated PostgreSQL.
 await db.exec(fs.readFileSync('supabase/migrations/20261124000000_email_login.sql','utf8'));
 await db.exec("INSERT INTO public.portal_login_state VALUES('retired-test','{}',now())");
 const retirement=fs.readFileSync('supabase/migrations/20261124010000_retire_email_login.sql','utf8');assert.equal(retirement,fs.readFileSync('prisma/migrations/20261124010000_retire_email_login/migration.sql','utf8'));await db.exec(retirement);
 assert.equal((await db.query("SELECT to_regclass('public.portal_login_state') AS value")).rows[0].value,null);assert.equal((await db.query('SELECT count(*)::int AS n FROM portal_retired_auth.portal_login_state')).rows[0].n,1);
 await db.exec(fs.readFileSync('scripts/sql/rollback-retired-email-login.sql','utf8'));assert.equal((await db.query('SELECT count(*)::int AS n FROM public.portal_login_state')).rows[0].n,1);await db.exec(retirement);
 r=await post({password:process.env.WORKSPACE_PASSWORD});assert.equal(r.status,200,'login works with old authentication schema retired');
}finally{console.info=info;console.warn=warn;await db.close();}
console.log('PASS password-only login: correct/wrong password, secure session/refresh/expiry/logout, protected pages/APIs, origin checks, durable rolling/global/concurrent limits, no external email, scheduled auth, database failure, business preservation and reversible retirement.');
