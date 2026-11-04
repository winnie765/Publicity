import type {Dataset} from './model';
import {readApiResponse} from '../lib/api-response';

type Entry={value?:any;at:number;pending?:Promise<any>};
const cache=new Map<string,Entry>();
export function invalidateWorkspaceData(){cache.clear();}
export function notifyWorkspaceChange(){
  invalidateWorkspaceData();
  if(typeof window!=='undefined'){
    window.dispatchEvent(new Event('portal-data-changed'));
    try{localStorage.setItem('portal-data-revision',String(Date.now()))}catch{}
  }
}
export function workspaceData(url:string,force=false):Promise<any>{
  const prior=cache.get(url);
  if(prior?.pending)return prior.pending;
  if(!force&&prior?.value&&Date.now()-prior.at<15000)return Promise.resolve(prior.value);
  const entry:Entry={...prior,at:prior?.at||0};
  entry.pending=fetch(url,{cache:'no-store'}).then(async response=>{const data=await readApiResponse(response);if(!response.ok)throw Error(response.status===401?'Sign in again to continue.':data.error||'Records could not be loaded.');entry.value=data;entry.at=Date.now();return data;}).finally(()=>{entry.pending=undefined});
  cache.set(url,entry);return entry.pending;
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
