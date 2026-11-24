import {getStorage} from './storage';
import {workspacePassword} from './workspace-env';
import type {Storage,StoredRecord} from './storage-contract';
const sessionKind='workspace_session',attemptKind='workspace_login_attempt',windowMs=15*60*1000;
const encoder=new TextEncoder();
async function digest(value:string){const key=await crypto.subtle.importKey('raw',encoder.encode('workspace-auth-state:'+workspacePassword()),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
const sessionId=async(token:string)=>'workspace-session-'+await digest('session:'+token);
export async function saveSession(token:string,expiresAt:number,store:Storage=getStorage()){
 await store.apply([{type:'insert',record:{id:await sessionId(token),kind:sessionKind,payload:{expiresAt},updatedAt:new Date().toISOString()}}]);
}
export async function sessionExists(token:string,now=Date.now(),store:Storage=getStorage()){
 const id=await sessionId(token),row=store.readRecord?await store.readRecord(id):(await store.readRecords([sessionKind])).find(r=>r.id===id);
 return row?.kind===sessionKind&&typeof row.payload.expiresAt==='number'&&row.payload.expiresAt>now;
}
export async function revokeSession(token:string,store:Storage=getStorage()){if(token)await store.apply([{type:'purge',id:await sessionId(token),kind:sessionKind}]);}
async function cleanup(now:number,store:Storage){
 const expired=(await store.readRecords([sessionKind,attemptKind])).filter(r=>[sessionKind,attemptKind].includes(r.kind)&&typeof r.payload.expiresAt==='number'&&r.payload.expiresAt<=now);
 for(let i=0;i<expired.length;i+=1000)await store.apply(expired.slice(i,i+1000).map(r=>({type:'purge' as const,id:r.id,kind:r.kind})));
}
/** Unique insert-only slots enforce rolling-window limits atomically using existing storage.
 * Prisma transactions and the Supabase apply RPC both reject duplicate inserts and roll back batches.
 * No read/modify/write counter, process memory, email secret or new database table is required.
 */
export async function passwordAttempt(request:Request,now=Date.now(),store:Storage=getStorage()){
 const ip=process.env.VERCEL==='1'?request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown':'non-vercel',identity=await digest('ip:'+ip),bucket=Math.floor(now/windowMs);
 const ids=(period:number,key:string,limit:number)=>Array.from({length:limit},(_,i)=>'workspace-attempt-'+period+'-'+key+'-'+i);
 const currentGlobal=ids(bucket,'global',50),currentIp=ids(bucket,identity,8),allIds=[...currentGlobal,...currentIp,...ids(bucket-1,'global',50),...ids(bucket-1,identity,8)];
 const read=async()=>store.readRecordsByIds?await store.readRecordsByIds(allIds):(await store.readRecords([attemptKind])).filter(r=>allIds.includes(r.id));
 for(let retry=0;retry<4;retry++){
  const rows=await read(),recent=rows.filter(r=>r.kind===attemptKind&&r.payload.at>now-windowMs),occupied=new Set(rows.map(r=>r.id));
  if(recent.filter(r=>r.payload.scope==='global').length>=50||recent.filter(r=>r.payload.scope===identity).length>=8)return false;
  const global=currentGlobal.find(id=>!occupied.has(id)),local=currentIp.find(id=>!occupied.has(id));if(!global||!local)return false;
  const record=(id:string,scope:string):StoredRecord=>({id,kind:attemptKind,payload:{at:now,expiresAt:now+windowMs,scope},updatedAt:new Date(now).toISOString()});
  try{await store.apply([{type:'insert',record:record(global,'global')},{type:'insert',record:record(local,identity)}]);}
  catch(error){const after=await read();if(after.some(r=>r.id===global||r.id===local))continue;throw error;}
  if(global===currentGlobal[0])try{await cleanup(now,store);}catch{/* Expiry is enforced on reads; cleanup can wait for the next window. */}
  return true;
 }
 return false;
}
