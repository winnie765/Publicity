import {authenticated,cookieHeader,createSession,passwordConfigured,passwordMatches,sessionCookie} from '../../../lib/workspace-security';
import {passwordAttempt,revokeSession} from '../../../lib/workspace-auth-state';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;
function json(value:unknown,status=200,cookie?:string){return Response.json(value,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});}
export async function GET(request:Request){return json({authenticated:await authenticated(request),configured:passwordConfigured()});}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open Workspace access on this website.'},403);
 try{
  const text=await request.text();if(text.length>1000)return json({error:'Request is too large.'},413);
  let body;try{body=JSON.parse(text);}catch{return json({error:'Invalid sign-in request.'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid sign-in request.'},400);
  if(body.action==='logout'){
   const token=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(sessionCookie+'='))?.slice(sessionCookie.length+1)||'';
   await revokeSession(token);console.info('workspace_access',{outcome:'logout'});
   return json({ok:true},200,cookieHeader(request,'',true));
  }
  if(body.action!==undefined&&body.action!=='password')return json({error:'Choose a supported sign-in action.'},400);
  if(!passwordConfigured())return json({error:'Workspace access is locked until WORKSPACE_PASSWORD is configured as a hosting secret (at least 8 characters).'},503);
  if(typeof body.password!=='string'||!body.password||body.password.length>300)return json({error:'Enter the Workspace password.'},400);
  if(!await passwordAttempt(request)){console.info('workspace_access',{outcome:'rate_limited'});return Response.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429,headers:{'Cache-Control':'no-store','Retry-After':'900'}});}
  if(!await passwordMatches(body.password)){console.info('workspace_access',{outcome:'rejected'});return json({error:'The Workspace password was not recognised.'},401);}
  const session=await createSession();console.info('workspace_access',{outcome:'accepted'});
  return json({ok:true},200,cookieHeader(request,session));
 }catch{console.warn('workspace_access',{outcome:'unavailable'});return json({error:'Workspace access is temporarily unavailable. Please try again.'},503);}
}
