'use client';
import FieldLabel from '../../field-label';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import BrandLogo from '../../brand-logo';
import {LockKeyhole} from 'lucide-react';
type Challenge={status:string;expiresAt?:number;resendAt?:number};
type LoginResponse=Challenge&{challenge?:Challenge|null;error?:string};
export default function WorkspaceLogin(){
 const [password,setPassword]=useState(''),[code,setCode]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(true),[challenge,setChallenge]=useState<Challenge|null>(null),[now,setNow]=useState(Date.now());
 const inFlight=useRef(false);
 useEffect(()=>{let alive=true;fetch('/api/session',{cache:'no-store'}).then(async r=>await r.json() as LoginResponse).then(data=>{if(alive){if(data.challenge&&['active','pending','expired','delivery-failed','locked'].includes(data.challenge.status))setChallenge(data.challenge);if(data.error)setError(data.error);}}).catch(()=>{if(alive)setError('Unable to check sign-in status. Please try again.');}).finally(()=>{if(alive)setBusy(false);});return()=>{alive=false;};},[]);
 useEffect(()=>{if(!challenge)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[challenge]);
 const seconds=Math.max(0,Math.ceil(((challenge?.resendAt||0)-now)/1000)),expired=!!challenge?.expiresAt&&challenge.expiresAt<=now,locked=challenge?.status==='locked';
 async function submit(action:'password'|'verify'|'resend'|'cancel'){
  if(busy||inFlight.current)return;inFlight.current=true;setBusy(true);setError('');setNotice('');
  try{
   const response=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...(action==='password'?{password}:action==='verify'?{code}:{})})}),data=await response.json() as LoginResponse;
   if(action==='cancel'&&response.ok){setChallenge(null);setCode('');return;}
   if(action==='verify'&&response.ok){const next=new URLSearchParams(window.location.search).get('next');window.location.href=next?.startsWith('/workspace/')&&!next.includes('\\')?next:'/workspace';return;}
   if(data.status==='sent'){setChallenge(data);setCode('');setNow(Date.now());setNotice('A new verification code has been sent.');return;}
   if(data.status==='delivery-failed'){setChallenge(previous=>({...previous,status:data.status,resendAt:previous?.resendAt||Date.now()+60000}));}
   if(data.status==='cooldown'&&challenge)setChallenge({...challenge,resendAt:data.resendAt});
   if(data.status==='locked')setChallenge(previous=>({...previous,status:'locked'}));
   if(data.status==='restart'){setChallenge(null);setCode('');}
   throw Error(data.error||'Unable to sign in. Please try again.');
  }catch(cause){setError(cause instanceof Error?cause.message:'Please try again.');}
  finally{inFlight.current=false;setBusy(false);setPassword('');}
 }
 return <main className="workspace-access"><Link className="public-brand" href="/"><BrandLogo/></Link><section className="card"><LockKeyhole size={28}/><span className="eyebrow">PRIVATE WORKSPACE</span><h1>{challenge?'Email Verification':'A space to plan, learn and grow.'}</h1><p>{challenge?(challenge.status==='delivery-failed'?'We could not send your verification email. Please try Resend Code after the countdown.':challenge.status==='pending'?'Your verification email is being prepared. Please check your inbox shortly.':'We have sent a 6-digit verification code to your registered email address. Please enter the code below to continue.'):'Staff access to intelligence, content planning, reporting and data management.'}</p><form onSubmit={e=>{e.preventDefault();void submit(challenge?'verify':'password');}}>
 {challenge?<label className="field"><FieldLabel required>Verification code</FieldLabel><input type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength={6} value={code} autoFocus onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} aria-describedby="otp-status"/></label>:<label className="field"><FieldLabel required>Workspace password</FieldLabel><input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>}
 {challenge&&<p id="otp-status" role="status">{locked?'Too many incorrect codes. Return to Login to start again.':expired?'This code has expired. Request a new code.':'Codes expire after 5 minutes. Check your inbox and spam folder.'}</p>}
 {error&&<p className="error" role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <button className="button primary" disabled={busy||!!challenge&&(expired||locked||code.length!==6)}>{busy?'Please wait…':challenge?'Verify Code':'Open Workspace'}</button>
 {challenge&&<div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:12}}><button type="button" className="button" disabled={busy||seconds>0||locked} onClick={()=>void submit('resend')}>{seconds>0?'Resend Code in '+seconds+'s':'Resend Code'}</button><button type="button" className="button" disabled={busy} onClick={()=>void submit('cancel')}>Back to Login</button></div>}
 </form><Link href="/">Return to the Public Portal</Link></section></main>;
}
