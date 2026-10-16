import type {Storage,Change} from './storage-contract';
import {retentionDays,type RecycledRecord} from './recycle-bin';
import {recordOperation} from './record-operations';
export async function reportTrash(store:Storage){const rows=await store.readRecords();return {retentionDays:retentionDays(rows),reports:rows.filter(r=>r.kind==='trash'&&r.payload?.original?.kind==='generated_report').map(r=>{const p=r.payload as RecycledRecord;return {id:r.id,label:p.original.payload.period.label,deletedAt:p.deletedAt,expiresAt:p.expiresAt};}).sort((a,b)=>b.deletedAt.localeCompare(a.deletedAt))};}
export async function manageReport(store:Storage,body:any){
 if(!body||!['delete','restore','purge'].includes(body.action)||typeof body.id!=='string'||!body.id||body.id.length>200)throw Error('Choose a report and a valid action.');
 const row=(await store.readRecords()).find(r=>r.id===body.id);if(!row)throw Error('This report has changed. Refresh and try again.');
 if(body.action==='delete'){
  if(row.kind!=='generated_report')throw Error('Choose an active archived report.');if(body.confirmation!=='delete')throw Error('Confirm report deletion.');
  const changes:Change[]=[{type:'delete',id:row.id,kind:row.kind},{type:'audit',entry:{id:crypto.randomUUID(),actor:'Workspace staff',action:'Move archived report to Reports Trash',record_id:row.id,date:new Date().toISOString()}}];await store.apply(changes);return {ok:true};
 }
 if(row.kind!=='trash'||row.payload?.original?.kind!=='generated_report')throw Error('Choose a report from Reports Trash.');
 return recordOperation(store,{operation:body.action,ids:[row.id],confirmation:body.confirmation});
}
