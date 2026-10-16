import type {Storage,StoredRecord,Change} from './storage-contract';
export const managedKinds=['posts','followers','interactions','kpis','content_plan','planner_idea','planner_campaign','planner_note','public_content','public_event','public_partner','programme_profile','community_impact'] as const;
export const recoverableKinds=new Set<string>([...managedKinds,'generated_report']);
export type RecycledRecord={original:StoredRecord;deletedAt:string;expiresAt:string|null;batchId:string;rootId:string};
export function retentionDays(rows:StoredRecord[]){const n=rows.find(r=>r.kind==='recycle_settings')?.payload.retentionDays;return Number.isInteger(n)&&n>=1&&n<=365?n:30;}
// Preserve an exact recovery copy before removing a record from active queries.
// Both storage adapters commit the recovery copy and active deletion atomically.
export function recycleStorage(base:Storage):Storage{return {...base,async apply(changes){
 if(!changes.some(c=>['delete','deleteInteractions','deleteAllData','archive','purge'].includes(c.type)))return base.apply(changes);
 const rows=await base.readRecords(),targets=new Map<string,{record:StoredRecord;mode:'trash'|'archive';rootId:string}>(),now=new Date(),batchId=crypto.randomUUID();
 const add=(record:StoredRecord|undefined,mode:'trash'|'archive',rootId?:string)=>{if(record&&recoverableKinds.has(record.kind))targets.set(record.id,{record,mode,rootId:rootId||record.id})};
 for(const c of changes){if(c.type==='delete'||c.type==='archive')add(rows.find(r=>r.id===c.id&&r.kind===c.kind),c.type==='archive'?'archive':'trash');else if(c.type==='deleteInteractions')for(const r of rows.filter(r=>r.kind==='interactions'&&r.payload.postId===c.postId))add(r,'trash',c.postId);else if(c.type==='deleteAllData')for(const r of rows.filter(r=>['posts','followers','interactions','kpis'].includes(r.kind)))add(r,'trash');}
 for(const {record,mode} of [...targets.values()])if(record.kind==='posts')for(const related of rows.filter(r=>['interactions','public_content'].includes(r.kind)&&r.payload.postId===record.id))add(related,mode,record.id);
 const preserved=changes.filter(c=>!['deleteInteractions','deleteAllData','archive'].includes(c.type)&&!(c.type==='delete'&&targets.has(c.id))).map(c=>c.type==='purge'?{type:'delete' as const,id:c.id,kind:c.kind}:c);
 const recovery:Change[]=[];
 for(const {record} of targets.values())if(record.kind==='public_content'&&record.payload.publicSource){const post=rows.find(r=>r.kind==='posts'&&r.id===record.payload.postId);if(post&&!targets.has(post.id))recovery.push({type:'upsert',record:{...post,payload:{...post.payload,show_on_public_site:false,show_on_home_page:false},updatedAt:now.toISOString()}});}

 for(const {record,mode,rootId} of targets.values()){
  const id='recycled-'+crypto.randomUUID();recovery.push({type:'upsert',record:{id,kind:mode,payload:{original:record,deletedAt:now.toISOString(),expiresAt:mode==='trash'?new Date(now.getTime()+retentionDays(rows)*86400000).toISOString():null,batchId,rootId} satisfies RecycledRecord,updatedAt:now.toISOString()}},{type:'delete',id:record.id,kind:record.kind});
 }
 await base.apply([...preserved,...recovery,...(recovery.length?[{type:'clearAICache' as const}]:[])]);
}};}
