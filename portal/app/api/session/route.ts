import {authenticated,cookieHeader,createSession,passwordConfigured,passwordMatches,sessionCookie} from '../../../lib/workspace-security';
import {authDigest,challengeHeader,challengeToken,clientLimitKey,issueLoginCode,newChallengeToken,otpConfigured} from '../../../lib/email-otp';
import {loginOperation,type LoginResult} from '../../../lib/login-store';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;
function json(value:unknown,status=200,cookies:string[]=[]){const headers=new Headers({'Cache-Control':'no-store'});for(const cookie of cookies)headers.append('Set-Cookie',cookie);return Response.json(value,{status,headers});}
const message=(status:string)=>({incorrect:'The code is incorrect. Please try again.',locked:'Too many incorrect codes. Return to Login and start again.',expired:'This code has expired. Request a new code.',restart:'Return to Login and enter your password again.',cooldown:'Please wait before requesting another code.',limited:'Too many requests. Please try again later.','delivery-failed':'Unable to send the verification email. Please try again after the cooldown.','not-ready':'The code is not ready. Request a new code.'}[status]||'Email verification is temporarily unavailable.');
function resultResponse(result:LoginResult,cookies:string[]=[]){return json({...result,...(result.status!=='sent'?{error:message(result.status)}:{})},result.status==='sent'?200:['limited','cooldown','locked'].includes(result.status)?429:result.status==='delivery-failed'?503:400,cookies);}
export async function GET(request:Request){
 try{const token=challengeToken(request),challenge=token&&otpConfigured()?await loginOperation('status',{id:authDigest('challenge:'+token)}):null;return json({authenticated:await authenticated(request),configured:passwordConfigured()&&otpConfigured(),challenge});}
 catch{return json({error:'Sign-in is temporarily unavailable.'},503);}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open Workspace access on this website.'},403);
 try{
  const text=await request.text();if(text.length>1000)return json({error:'Request is too large.'},413);
  const body=JSON.parse(text);if(!body||typeof body!=='object')return json({error:'Invalid request.'},400);
  const token=challengeToken(request),id=token?authDigest('challenge:'+token):'';
  if(body.action==='logout'||body.action==='cancel'){
   const session=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(sessionCookie+'='))?.slice(sessionCookie.length+1)||'';
   await loginOperation('logout',{id,session:authDigest('session:'+session)});
   return json({ok:true},200,[cookieHeader(request,'',true),challengeHeader(request,'',true)]);
  }
  if(!passwordConfigured()||!otpConfigured())return json({error:'Sign-in is locked until password and email verification are configured by the administrator.'},503);
  if(body.action==='verify'){
   if(!token)return json({error:message('restart')},401);
   if(typeof body.code!=='string'||!/^\d{6}$/.test(body.code))return json({error:'Enter the 6-digit verification code.'},400);
   const session=await createSession(),result=await loginOperation('verify',{id,hash:authDigest('code:'+token+':'+body.code),session:authDigest('session:'+session)});
   if(result.status!=='verified')return resultResponse(result);
   return json({ok:true},200,[cookieHeader(request,session),challengeHeader(request,'',true)]);
  }
  if(body.action==='resend'){
   if(!token)return json({error:message('restart')},401);
   return resultResponse(await issueLoginCode(token,clientLimitKey(request),true));
  }
  if(body.action!==undefined&&body.action!=='password')return json({error:'Invalid sign-in action.'},400);
  if(typeof body.password!=='string'||body.password.length>300)return json({error:'Enter the Workspace password.'},400);
  if((await loginOperation('password-limit',{key:clientLimitKey(request)})).status!=='ok')return json({error:'Too many attempts. Try again in 15 minutes.'},429);
  if(!await passwordMatches(body.password))return json({error:'The Workspace password was not recognised.'},401);
  const next=newChallengeToken(),result=await issueLoginCode(next,clientLimitKey(request));
  // A concurrent/cooldown response must not replace an already-issued challenge cookie.
  const issued=result.status==='sent'||result.status==='delivery-failed';
  if(issued&&token)await loginOperation('logout',{id,session:''});
  return resultResponse(result,issued?[cookieHeader(request,'',true),challengeHeader(request,next)]:[]);
 }catch{return json({error:'Sign-in is temporarily unavailable. Please try again.'},503);}
}
