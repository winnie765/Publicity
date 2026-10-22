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
