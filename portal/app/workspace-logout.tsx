'use client';
import {useState} from 'react';
import {LogOut} from 'lucide-react';
export default function WorkspaceLogout(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function logout(){
  if(busy)return;
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});
   if(!response.ok)throw Error('Could not log out. Please try again.');
   window.location.replace('/');
  }catch{setError('Could not log out. Please try again.');setBusy(false);}
 }
 return <div className="workspace-logout"><button className="button" onClick={logout} disabled={busy} aria-label="Log out of Workspace"><LogOut size={17}/><span>{busy?'Logging out...':'Log out'}</span></button>{error&&<p role="alert">{error}</p>}</div>;
}
