import {mediaReferences,logBlockedMedia,type MediaReference} from './media-references';
import type {Storage,Change} from './storage-contract';
import {assetKey,mediaFolders} from './content-media';
type Bucket={delete:(key:string)=>Promise<void>};
export async function mediaBulkAction(store:Storage,bucket:Bucket,body:any){
 if(!['deleteSelected','moveSelected'].includes(body?.action)||!Array.isArray(body.keys)||!body.keys.length||body.keys.length>200||body.keys.some((key:unknown)=>typeof key!=='string'||!assetKey('/api/media?key='+encodeURIComponent(key))))throw Error('Select up to 200 uploaded images.');
 const keys=[...new Set<string>(body.keys)],rows=await store.readRecords(),assets=keys.map(key=>rows.find(row=>row.kind==='media_asset'&&row.payload.key===key)||{id:'media-'+key.split('/').at(-1)!.split('.')[0],kind:'media_asset',payload:{key,url:'/api/media?key='+encodeURIComponent(key),name:key.split('/').at(-1),folder:key.split('/')[0],mimeType:'image/'+(key.endsWith('.jpg')?'jpeg':key.endsWith('.png')?'png':'webp'),size:0,createdAt:new Date().toISOString()},updatedAt:new Date().toISOString()});
 if(body.action==='moveSelected'){
  if(!mediaFolders.includes(body.folder)||body.folder==='workvivo'||keys.some(key=>key.startsWith('workvivo/')))throw Error('Private Workvivo images must remain in their private category.');
  const now=new Date().toISOString();await store.apply(assets.map(asset=>({type:'upsert' as const,record:{...asset!,payload:{...asset!.payload,folder:body.folder},updatedAt:now}})));return {ok:true,moved:keys.length};
 }
 if(body.confirmation!=='deleteSelected')throw Error('Confirm deletion of the selected images.');
 const blocked=assets.map(asset=>{const references=mediaReferences(rows,{key:asset.payload.key,id:asset.id,url:asset.payload.url,name:asset.payload.name});if(references.length)logBlockedMedia({key:asset.payload.key,id:asset.id,name:asset.payload.name},references);return {key:asset.payload.key,name:asset.payload.name,references};}).filter(item=>item.references.length),used=new Set(blocked.map(item=>item.key));const deleted:string[]=[],skipped=[...used],failed:string[]=[];
 for(const asset of assets){if(used.has(asset!.payload.key))continue;try{await bucket.delete(asset!.payload.key);await store.apply([{type:'delete',id:asset!.id,kind:'media_asset'}]);deleted.push(asset!.payload.key);}catch{failed.push(asset!.payload.key);}}
 return {ok:true,deleted,skipped,failed,blocked};
}
