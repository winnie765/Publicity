import type {Change} from './storage-contract';
// Parameterized SQL: all user content is passed separately as one JSON value.
export const bulkRecordsSql=`INSERT INTO portal_records (id, kind, payload, record_date, updated_at)
 SELECT id, kind, payload, record_date, updated_at
 FROM jsonb_to_recordset($1::jsonb) AS r(id text, kind text, payload jsonb, record_date date, updated_at timestamp)
 ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload, record_date=EXCLUDED.record_date, updated_at=EXCLUDED.updated_at`;
export function bulkRecordChanges(changes:Change[]){
 if(!changes.length||changes.some(c=>c.type!=='upsert'&&c.type!=='audit'))return null;
 const records=new Map<string,{id:string;kind:string;payload:any;record_date:string|null;updated_at:string}>();
 const audits=[];
 for(const c of changes){if(c.type==='audit'){audits.push({id:c.entry.id,actor:c.entry.actor,action:c.entry.action,recordId:c.entry.record_id,date:new Date(c.entry.date)});continue;}if(c.type==='upsert'){const r=c.record,payload={...r.payload};delete payload.date;records.set(r.id,{id:r.id,kind:r.kind,payload,record_date:r.payload.date||null,updated_at:r.updatedAt});}}
 return {records:[...records.values()],audits};
}

// Recovery copies and active deletions must commit together, with no per-row round trips.
export const bulkDeletesSql=`DELETE FROM portal_records AS target USING jsonb_to_recordset($1::jsonb) AS removed(id text, kind text) WHERE target.id=removed.id AND target.kind=removed.kind`;
export function bulkRecoveryChanges(changes:Change[]){
 if(!changes.some(c=>c.type==='delete')||changes.some(c=>!['upsert','delete','audit','clearAICache','clearFacebookSnapshots'].includes(c.type)))return null;
 const writes=changes.filter(c=>c.type==='upsert'||c.type==='audit');
 const deleted=changes.filter((c):c is Extract<Change,{type:'delete'}>=>c.type==='delete');
 const ids=new Set(deleted.map(c=>c.id));
 if(writes.some(c=>c.type==='upsert'&&ids.has(c.record.id)))return null;
 const bulk=bulkRecordChanges(writes);
 return {records:bulk?.records||[],audits:bulk?.audits||[],deleted:deleted.map(c=>({id:c.id,kind:c.kind})),clearCache:changes.some(c=>c.type==='clearAICache'),clearSnapshots:changes.some(c=>c.type==='clearFacebookSnapshots')};
}
