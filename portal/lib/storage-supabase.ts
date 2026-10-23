import type {ReportIndexRow} from './report-index';
import {requestStorage} from './request-storage';
import {masterStorage} from './master-relationships';
import type {Storage,StoredRecord,AuditEntry,Change} from './storage-contract';
import {recycleStorage} from './recycle-bin';
import {supabaseRPC,type SupabaseEnvironment} from './supabase-client';
export function getSupabaseStorage(env:SupabaseEnvironment,fetcher:typeof fetch=fetch):Storage{
 const rpc=supabaseRPC(env,fetcher);return requestStorage(masterStorage(recycleStorage(requestStorage({
 async readRecordsByIds(ids){return ids.length?rpc<StoredRecord[]>('portal_read_records_by_ids',{record_ids:[...ids]}):[];},
 async readReportIndex(){return rpc<ReportIndexRow[]>('portal_read_report_index');},
 async readRecord(id){return rpc<StoredRecord|null>('portal_read_record',{record_id:id});},
 async readRecords(kinds){const rows:StoredRecord[]=[],seen=new Set<string>();let after='';for(;;){const page=await rpc<StoredRecord[]>(kinds?'portal_read_records_scoped':'portal_read_records',{after_id:after,page_size:500,...(kinds?{record_kinds:[...kinds]}:{})});if(!Array.isArray(page)||page.some(r=>!r||typeof r.id!=='string'||typeof r.kind!=='string'||!r.payload))throw Error('Invalid Supabase records response.');if(!page.length)return rows;if(page.some(r=>seen.has(r.id))||new Set(page.map(r=>r.id)).size!==page.length)throw Error('Invalid Supabase pagination.');rows.push(...page);for(const row of page)seen.add(row.id);if(page.length<500)return rows;after=page[page.length-1].id;}},
 async readAudit(){return rpc<AuditEntry[]>('portal_read_audit');},
 async apply(changes:Change[]){if(changes.length)await rpc<void>('portal_apply_changes',{changes});}
 }))));}
