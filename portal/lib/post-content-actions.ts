import type {Storage} from './storage-contract';
import {contentFields,validateContent} from './content-media';
// Preserve staff-managed publishing metadata during metric-only updates and Excel imports.
// The existing data service still owns validation, calculations and atomic persistence.
export async function preparePostContentAction(store:Storage,body:any){
 if(!body||!['upsert','import'].includes(body.action))return body;
 const batches=body.action==='import'?body.batches:[{kind:body.kind,items:body.items}];if(!Array.isArray(batches)||!batches.some(b=>b?.kind==='posts'&&Array.isArray(b.items)))return body;
 const rows=await store.readRecords();const prepared=batches.map(batch=>batch?.kind!=='posts'||!Array.isArray(batch.items)?batch:{...batch,items:batch.items.map((item:any)=>{if(!item||typeof item!=='object')return item;const previous=rows.find(r=>r.kind==='posts'&&r.id===item.id)?.payload;const merged={...Object.fromEntries(contentFields.filter(k=>previous?.[k]!==undefined&&item[k]===undefined).map(k=>[k,previous[k]])),...item};validateContent(merged,merged.platform,merged.status);return merged})});
 return body.action==='import'?{...body,batches:prepared}:{...body,items:prepared[0].items};
}
