import {normalizePostStandard,normalizeConfiguredPost,postContentTypes,validatePostStandard,prepareWorkvivoLink} from './post-standard';
import {isImportedHistoricalPost} from '../app/model';
import {postUrlValue} from './original-post-url';
import type {Storage} from './storage-contract';
import {contentFields,validateContent} from './content-media';
// Preserve staff-managed publishing metadata during metric-only updates and Excel imports.
// The existing data service still owns validation, calculations and atomic persistence.
export async function preparePostContentAction(store:Storage,body:any){
 if(body?.action==='associateWorkvivo'){
  if(typeof body.id!=='string'||!body.id||body.id.length>100)throw Error('Choose an existing post.');
  const row=(await store.readRecords()).find(r=>r.kind==='posts'&&r.id===body.id);
  if(!row||!['Facebook','Instagram'].includes(row.payload.platform))throw Error('Choose an existing Facebook or Instagram post.');
  if(row.payload.is_workvivo_associated===true)throw Error('This post is already associated with Workvivo. Refresh the Post Library.');
  return preparePostContentAction(store,{action:'upsert',kind:'posts',items:[{...row.payload,is_workvivo_associated:true,workvivo_category:body.workvivo_category||'General Update',workvivo_url:body.workvivo_url??'',workvivo_caption:body.workvivo_caption??''}]});
 }
 if(!body||!['upsert','import'].includes(body.action))return body;
 const batches=body.action==='import'?body.batches:[{kind:body.kind,items:body.items}];if(!Array.isArray(batches)||!batches.some(b=>b?.kind==='posts'&&Array.isArray(b.items)))return body;
 const rows=await store.readRecords();const configured=rows.find(r=>r.kind==='config')?.payload.types;const formats=Array.isArray(configured)&&configured.length?configured:[...postContentTypes];const prepared=batches.map(batch=>batch?.kind!=='posts'||!Array.isArray(batch.items)?batch:{...batch,items:batch.items.map((item:any)=>{if(!item||typeof item!=='object')return item;const previous=rows.find(r=>r.kind==='posts'&&r.id===item.id)?.payload;let merged:any={...Object.fromEntries(contentFields.filter(k=>previous?.[k]!==undefined&&item[k]===undefined).map(k=>[k,previous[k]])),...item};if(previous?.description!==undefined&&(item.description===undefined||body.action==='import'&&item.description===''))merged.description=previous.description;if(body.action==='import'||isImportedHistoricalPost(merged)||previous&&isImportedHistoricalPost(previous)){merged.record_origin='excel_import';merged.status='published';if(previous?.importSheet&&!merged.importSheet)merged.importSheet=previous.importSheet;}if(merged.original_post_url===undefined){if(body.action==='import'&&previous&&!item.url)merged.original_post_url=postUrlValue(previous);else if(typeof merged.url==='string')merged.original_post_url=merged.url;}merged=normalizeConfiguredPost(merged,formats);validatePostStandard(merged,body.action==='import'||isImportedHistoricalPost(merged)?'import':'record',formats);merged=prepareWorkvivoLink(merged,previous);validateContent(merged,merged.platform,merged.status);return merged})});
 return body.action==='import'?{...body,batches:prepared}:{...body,items:prepared[0].items};
}
