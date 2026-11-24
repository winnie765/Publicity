import {createHmac,randomBytes,randomInt} from 'node:crypto';
import {workspacePassword} from './workspace-env';
import {loginOperation} from './login-store';

export const challengeCookie='tzuchi_login_challenge';
export function otpConfigured(){return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(process.env.OTP_RECIPIENT_EMAIL||'')&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(process.env.OTP_FROM_EMAIL||'')&&!!process.env.RESEND_API_KEY&&(process.env.OTP_SECRET||'').length>=32;}
export function authDigest(value:string){return createHmac('sha256',process.env.OTP_SECRET||'').update(workspacePassword()+'\0'+(process.env.OTP_RECIPIENT_EMAIL||'')+'\0'+value).digest('hex');}
export function challengeToken(request:Request){const token=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(challengeCookie+'='))?.slice(challengeCookie.length+1)||'';return /^[a-f0-9]{64}$/.test(token)?token:'';}
export function challengeHeader(request:Request,token='',clear=false){return challengeCookie+'='+token+'; Path=/api/session; HttpOnly; SameSite=Strict; Max-Age='+(clear?0:900)+(process.env.NODE_ENV==='production'||new URL(request.url).protocol==='https:'?'; Secure':'');}
export function clientLimitKey(request:Request){
 // Vercel overwrites this header. Other hosts use a global bucket unless a trusted proxy is explicitly configured.
 const ip=process.env.VERCEL==='1'?request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown':'non-vercel';
 return authDigest('ip:'+ip);
}
export async function sendLoginCode(code:string,idempotencyKey:string){
 if(!otpConfigured())throw Error('Email verification is not configured.');
 const text='Tzu Chi Social Media Intelligence Portal\n\nYour login verification code is:\n\n'+code+'\n\nThis code will expire in 5 minutes.\n\nIf you did not attempt to sign in, please disregard this email and inform the appropriate administrator if you suspect unauthorised access.';
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({from:process.env.OTP_FROM_EMAIL,to:[process.env.OTP_RECIPIENT_EMAIL],subject:'Tzu Chi Portal - Login Verification Code',text,html:'<div style="font-family:Arial,sans-serif;color:#243c2e;max-width:560px;margin:auto"><h2>Tzu Chi Social Media Intelligence Portal</h2><p>Your login verification code is:</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px">'+code+'</p><p>This code will expire in 5 minutes.</p><p>If you did not attempt to sign in, please disregard this email and inform the appropriate administrator if you suspect unauthorised access.</p></div>'}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Email delivery unavailable.');
}
export async function issueLoginCode(token:string,key:string,resend=false){
 const code=String(randomInt(0,1000000)).padStart(6,'0'),version=randomBytes(16).toString('hex'),id=authDigest('challenge:'+token),hash=authDigest('code:'+token+':'+code);
 const result=await loginOperation(resend?'resend':'start',{id,key,hash,version});
 if(result.status!=='pending')return result;
 try{await sendLoginCode(code,'portal-login-'+version);return await loginOperation('activate',{id,version});}
 catch{await loginOperation('delivery-failed',{id,version});return {status:'delivery-failed'};}
}
export const newChallengeToken=()=>randomBytes(32).toString('hex');
