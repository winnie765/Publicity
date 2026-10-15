import {getStorage} from '../../../lib/storage';
import {authenticated,cookieHeader,createSession,passwordConfigured,passwordMatches} from '../../../lib/workspace-security';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200,headers:Record<string,string>={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store',...headers}});
export async function GET(request:Request){return json({authenticated:await authenticated(request),configured:passwordConfigured()});}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open Workspace access on this website.'},403);
 if(!passwordConfigured())return json({error:'Workspace access is locked until WORKSPACE_PASSWORD is configured as a hosting secret (at least 16 characters).'},503);
 try{
  const text=await request.text();if(text.length>1000)return json({error:'Request is too large.'},413);const body=JSON.parse(text);
  if(body.action==='logout')return json({ok:true},200,{'Set-Cookie':cookieHeader(request,'',true)});
  if(typeof body.password!=='string'||body.password.length>300)return json({error:'Enter the Workspace password.'},400);
  const store=getStorage(),ip=request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]||'unknown',digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip))),b=>b.toString(16).padStart(2,'0')).join(''),id='workspace-login-'+digest;
  const rows=await store.readRecords(),now=Date.now(),old=rows.find(r=>r.id===id)?.payload,attempts=old&&old.until>now?old.attempts:0;
  if(attempts>=8)return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
  if(!await passwordMatches(body.password)){await store.apply([{type:'upsert',record:{id,kind:'workspace_login_limit',payload:{attempts:attempts+1,until:old?.until>now?old.until:now+900000},updatedAt:new Date(now).toISOString()}}]);return json({error:'The Workspace password was not recognised.'},401);}
  await store.apply([{type:'delete',id,kind:'workspace_login_limit'}]);return json({ok:true},200,{'Set-Cookie':cookieHeader(request,await createSession())});
 }catch{return json({error:'Workspace access is temporarily unavailable.'},503);}
}
