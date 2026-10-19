import type {Storage,StoredRecord,AuditEntry,Change} from './storage-contract';
import {recycleStorage} from './recycle-bin';
import {supabaseRPC,type SupabaseEnvironment} from './supabase-client';
export function getSupabaseStorage(env:SupabaseEnvironment,fetcher:typeof fetch=fetch):Storage{
 const rpc=supabaseRPC(env,fetcher);return recycleStorage({
 async readRecords(){const rows:StoredRecord[]=[];let after='';for(;;){const page=await rpc<StoredRecord[]>('portal_read_records',{after_id:after,page_size:500});if(!Array.isArray(page)||page.some(r=>!r||typeof r.id!=='string'||typeof r.kind!=='string'||!r.payload))throw Error('Invalid Supabase records response.');if(!page.length)return rows;if(page.some(r=>rows.some(previous=>previous.id===r.id))||new Set(page.map(r=>r.id)).size!==page.length)throw Error('Invalid Supabase pagination.');rows.push(...page);after=page[page.length-1].id;}},
 async readAudit(){return rpc<AuditEntry[]>('portal_read_audit');},
 async apply(changes:Change[]){if(changes.length)await rpc<void>('portal_apply_changes',{changes});}
 });
}
