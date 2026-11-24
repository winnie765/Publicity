'use client';
import FieldLabel from '../../field-label';
import Link from 'next/link';
import {useRef,useState} from 'react';
import BrandLogo from '../../brand-logo';
import {LockKeyhole} from 'lucide-react';
export default function WorkspaceLogin(){
 const [password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),inFlight=useRef(false);
 async function submit(){
  if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');
  try{const response=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})}),data=await response.json() as {error?:string};if(!response.ok)throw Error(data.error||'Please try again.');window.location.assign('/workspace');}
  catch(cause){setError(cause instanceof Error?cause.message:'Please try again.');}
  finally{inFlight.current=false;setBusy(false);setPassword('');}
 }
 return <main className="workspace-access"><Link className="public-brand" href="/"><BrandLogo/></Link><section className="card"><LockKeyhole size={28}/><span className="eyebrow">PRIVATE WORKSPACE</span><h1>A space to plan, learn and grow.</h1><p>Staff access to intelligence, content planning, reporting and data management.</p><form onSubmit={e=>{e.preventDefault();void submit();}}><label className="field"><FieldLabel required>Workspace password</FieldLabel><input type="password" required maxLength={300} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy?'Opening Workspace…':'Open Workspace'}</button></form><Link href="/">Return to the Public Portal</Link></section></main>;
}
