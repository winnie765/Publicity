import {workspacePassword,automationSecret} from './workspace-env';
import {saveSession,sessionExists} from './workspace-auth-state';
const encoder=new TextEncoder();
export const sessionCookie='tzuchi_workspace';
const lifetime=8*60*60;
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export const passwordConfigured=()=>workspacePassword().length>=8;
export const automationConfigured=()=>automationSecret().length>=32;
export async function automationAuthorized(request:Request){if(new URL(request.url).pathname!=='/api/report-automation'||!automationConfigured())return false;const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')||'',a=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(supplied))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(automationSecret())));let difference=0;for(let i=0;i<a.length;i++)difference|=a[i]^b[i];return difference===0;}
async function key(){return crypto.subtle.importKey('raw',encoder.encode(workspacePassword()),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function passwordMatches(value:string){if(!passwordConfigured())return false;const a=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(workspacePassword())));let difference=0;for(let i=0;i<a.length;i++)difference|=a[i]^b[i];return difference===0;}
export async function createSession(now=Date.now()){if(!passwordConfigured())throw Error('Workspace access is not configured.');const expiry=Math.floor(now/1000)+lifetime,payload='password1.'+expiry+'.'+crypto.randomUUID(),token=payload+'.'+hex(await crypto.subtle.sign('HMAC',await key(),encoder.encode(payload)));await saveSession(token,expiry*1000);return token;}
export async function authenticated(request:Request,now=Date.now()){
 if(!passwordConfigured())return false;
 const token=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(sessionCookie+'='))?.slice(sessionCookie.length+1)||'';
 const [version,expiry,nonce,signature,...rest]=token.split('.');if(version!=='password1'||rest.length||!/^\d{10}$/.test(expiry)||!/^[a-f0-9-]{36}$/.test(nonce)||!/^[a-f0-9]{64}$/.test(signature)||Number(expiry)<=now/1000||Number(expiry)>now/1000+lifetime+60)return false;
 try{if(!await crypto.subtle.verify('HMAC',await key(),Uint8Array.from(signature.match(/../g)!,b=>parseInt(b,16)),encoder.encode(version+'.'+expiry+'.'+nonce)))return false;return await sessionExists(token,now);}catch{return false;}
}
export function cookieHeader(request:Request,value:string,clear=false){return sessionCookie+'='+value+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+(clear?0:lifetime)+(process.env.NODE_ENV==='production'||new URL(request.url).protocol==='https:'?'; Secure':'');}
export async function workspaceGuard(request:Request){
 if(await automationAuthorized(request))return null;
 if(!await authenticated(request))return Response.json({error:'Workspace sign-in required.'},{status:401,headers:{'Cache-Control':'no-store'}});
 const origin=request.headers.get('origin');if(!['GET','HEAD'].includes(request.method)&&origin!==new URL(request.url).origin)return Response.json({error:'This action must come from the Workspace.'},{status:403});
 return null;
}
