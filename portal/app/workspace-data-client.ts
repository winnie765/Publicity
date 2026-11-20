import type {Dataset} from './model';
import {readApiResponse} from '../lib/api-response';

type Entry={value?:any;at:number;pending?:Promise<any>;controller?:AbortController};
const cache=new Map<string,Entry>();
let generation=0;
export const workspaceCachePolicy={records:300000,configuration:600000,analysis:60000};
function scope(url:string){if(!/^\/api\/data(?:\?|$)/.test(url))return -1;const s=new URL(url,'https://workspace.invalid').searchParams.get('scope');return s==='config'?0:s==='social'?1:s==='followers'?2:3;}
function reusable(url:string){const wanted=scope(url);return [...cache].filter(([key,value])=>value.value&&(key===url||wanted>=0&&scope(key)>=wanted)).sort((a,b)=>b[1].at-a[1].at)[0]?.[1];}
export function workspaceDataReceivedAt(url:string){const at=reusable(url)?.at;return at?new Date(at).toISOString():undefined;}
export function invalidateWorkspaceData(){generation++;for(const entry of cache.values())entry.controller?.abort();cache.clear();}
export function notifyWorkspaceChange(){
  invalidateWorkspaceData();
  if(typeof window!=='undefined'){
    window.dispatchEvent(new Event('portal-data-changed'));
    try{localStorage.setItem('portal-data-revision',String(Date.now()))}catch{}
  }
}
export function workspaceData(url:string,force=false):Promise<any>{
  const prior=reusable(url),epoch=generation;
  if(cache.get(url)?.pending)return cache.get(url)!.pending!;
  const ttl=url.includes('scope=config')?workspaceCachePolicy.configuration:url.includes('/api/social-analyst')?workspaceCachePolicy.analysis:workspaceCachePolicy.records;
  if(!force&&prior?.value&&Date.now()-prior.at<ttl)return Promise.resolve(prior.value);
  const entry:Entry={...prior,at:prior?.at||0};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);
  entry.controller=controller;
  entry.pending=fetch(url,{cache:'no-store',signal:controller.signal}).then(async response=>{if(response.status===401||response.status===403){invalidateWorkspaceData();if(typeof window!=='undefined')window.dispatchEvent(new Event('portal-session-expired'));throw Error('Sign in again to continue.');}const data=await readApiResponse(response);if(!response.ok)throw Error(data.error||'Records could not be loaded.');if(epoch!==generation)throw Error('Records changed while loading. Please retry.');entry.value=data;entry.at=Date.now();if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('portal-cache-updated',{detail:url}));return data;}).catch(error=>{if(controller.signal.aborted&&error.message!=='Sign in again to continue.')throw Error('Loading was interrupted. Your saved records are unchanged. Try Again to reconnect.');throw error;}).finally(()=>{clearTimeout(timeout);entry.pending=undefined;entry.controller=undefined});
  if(cache.size>=64&&!cache.has(url)){const oldest=cache.keys().next().value;if(oldest&&!cache.get(oldest)?.pending)cache.delete(oldest);}cache.set(url,entry);if(!force&&prior?.value&&Date.now()-prior.at<1800000){void entry.pending.catch(()=>{});return Promise.resolve(prior.value);}return entry.pending;
}
/** Optimistic state is local to this screen and is rolled back if the write fails. */
export function optimisticDataset(data:Dataset,body:any):Dataset{
  const next=structuredClone(data);
  if(body.action==='config'){next.config=structuredClone(body.items);return next;}
  if(body.action==='deleteAll'){next.posts=[];next.followers=[];next.interactions=[];next.kpis=[];return next;}
  if(body.action==='delete'){
    const list=(next as any)[body.kind];if(Array.isArray(list))(next as any)[body.kind]=list.filter((row:any)=>row.id!==body.id);
    if(body.kind==='posts')next.interactions=next.interactions.filter(row=>row.postId!==body.id);
  }
  if(body.action==='deleteFollowerSnapshot'||body.action==='deleteFacebookFollower')next.followers=next.followers.filter(row=>row.account!==body.account||row.date!==body.snapshotDate);
  if(body.action==='associateWorkvivo')next.posts=next.posts.map(row=>row.id===body.id?{...row,is_workvivo_associated:true,workvivo_category:body.workvivo_category,workvivo_url:body.workvivo_url,workvivo_caption:body.workvivo_caption}:row);
  if(body.action==='followerSnapshot'||body.action==='facebookFollower'){
    const existing=next.followers.find(row=>row.id===body.id||row.account===body.account&&row.date===body.snapshotDate&&row.origin==='manual');
    const account=[...(next.config.followerAccounts||[]),...next.config.accounts].find(account=>account.name===body.account);
    const row={id:existing?.id||body.id||'pending-follower-'+body.account+'-'+body.snapshotDate,account:body.account,date:body.snapshotDate,followers:body.followerCount,platform:account?.platform,accountBrand:account?.brand,origin:'manual'};
    next.followers=[...next.followers.filter(value=>value.id!==existing?.id),row];
  }
  for(const batch of body.action==='upsert'?[{kind:body.kind,items:body.items}]:body.action==='import'?body.batches||[]:[]){
    const list=(next as any)[batch.kind];if(!Array.isArray(list)||!Array.isArray(batch.items))continue;
    const values=new Map(list.map((value:any)=>[value.id,value]));for(const value of batch.items)values.set(value.id,value);(next as any)[batch.kind]=[...values.values()];
  }
  return next;
}
