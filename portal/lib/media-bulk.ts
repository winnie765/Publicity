import type {Storage,Change} from './storage-contract';
import {assetKey,mediaFolders} from './content-media';
type Bucket={delete:(key:string)=>Promise<void>};
export async function mediaBulkAction(store:Storage,bucket:Bucket,body:any){
 if(!['deleteSelected','moveSelected'].includes(body?.action)||!Array.isArray(body.keys)||!body.keys.length||body.keys.length>200||body.keys.some((key:unknown)=>typeof key!=='string'||!assetKey('/api/media?key='+encodeURIComponent(key))))throw Error('Select up to 200 uploaded images.');
 const keys=[...new Set<string>(body.keys)],rows=await store.readRecords(),assets=keys.map(key=>rows.find(row=>row.kind==='media_asset'&&row.payload.key===key));if(assets.some(asset=>!asset))throw Error('Some selected images are no longer available. Refresh the library.');
 if(body.action==='moveSelected'){
  if(!mediaFolders.includes(body.folder)||body.folder==='workvivo'||keys.some(key=>key.startsWith('workvivo/')))throw Error('Private Workvivo images must remain in their private category.');
  const now=new Date().toISOString();await store.apply(assets.map(asset=>({type:'upsert' as const,record:{...asset!,payload:{...asset!.payload,folder:body.folder},updatedAt:now}})));return {ok:true,moved:keys.length};
 }
 if(body.confirmation!=='deleteSelected')throw Error('Confirm deletion of the selected images.');
 const selected=new Set(keys),used=new Set<string>();function references(value:unknown):void{if(typeof value==='string'){const key=assetKey(value);if(selected.has(key))used.add(key);}else if(Array.isArray(value))value.forEach(references);else if(value&&typeof value==='object')Object.values(value).forEach(references);}
 rows.filter(row=>row.kind!=='media_asset').forEach(row=>references(row.payload));const deleted:string[]=[],skipped=keys.filter(key=>used.has(key)),failed:string[]=[];
 for(const asset of assets){if(used.has(asset!.payload.key))continue;try{await bucket.delete(asset!.payload.key);await store.apply([{type:'delete',id:asset!.id,kind:'media_asset'}]);deleted.push(asset!.payload.key);}catch{failed.push(asset!.payload.key);}}
 return {ok:true,deleted,skipped,failed};
}
