import type {Storage,StoredRecord} from './storage-contract';
import {dashboardSchema,validateDashboard,type DashboardCatalog,type DashboardSpec} from './dashboard-spec';
export type SavedDashboard={id:string;definition:DashboardSpec;createdAt:string;updatedAt:string};
export function savedDashboardList(rows:StoredRecord[]){const dashboards:SavedDashboard[]=[],warnings:string[]=[];for(const row of rows.filter(r=>r.kind==='saved_dashboard')){const parsed=dashboardSchema.safeParse(row.payload.definition);if(!parsed.success){warnings.push('A saved dashboard definition could not be read. It was retained in storage for recovery.');continue;}dashboards.push({id:row.id,definition:parsed.data,createdAt:row.payload.createdAt||row.updatedAt,updatedAt:row.updatedAt});}return {dashboards:dashboards.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),warnings};}
export async function saveDashboardAction(store:Storage,body:unknown,catalog:DashboardCatalog){
 if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Choose a dashboard action.');const input=body as Record<string,unknown>;
 if(typeof input.id!=='string'||!/^dashboard-[a-zA-Z0-9-]{1,75}$/.test(input.id))throw Error('Choose a valid dashboard identifier.');
 const existing=(await store.readRecords(['saved_dashboard'])).find(r=>r.kind==='saved_dashboard'&&r.id===input.id),now=new Date().toISOString();
 const audit={type:'audit' as const,entry:{id:crypto.randomUUID(),actor:'Workspace staff',action:input.action==='delete'?'Delete saved dashboard':'Save dashboard definition',record_id:input.id,date:now}};
 if(input.action==='delete'){
  if(input.confirmation!==true)throw Error('Confirm deletion of this dashboard definition. Source records will not be deleted.');if(!existing)throw Error('This dashboard is no longer available.');if(input.expectedUpdatedAt!==existing.updatedAt)throw Error('This dashboard changed. Reload it before deleting.');
  await store.apply([{type:'purge',id:existing.id,kind:'saved_dashboard'},audit]);return {ok:true};
 }
 if(input.action!=='save'||input.approved!==true)throw Error('Review the dashboard and approve saving its definition.');
 if(existing&&input.expectedUpdatedAt!==existing.updatedAt)throw Error('This dashboard changed. Reload it or save a new copy to keep your edits.');
 if(!existing&&input.expectedUpdatedAt)throw Error('The original dashboard was deleted. Save a new copy instead.');
 const definition=validateDashboard(input.definition,catalog),record={id:input.id,kind:'saved_dashboard',payload:{definition,createdAt:existing?.payload.createdAt||now},updatedAt:now};
 // Purge + INSERT in the existing transaction prevents an ID collision from updating another record kind.
 await store.apply([...(existing?[{type:'purge' as const,id:existing.id,kind:'saved_dashboard'}]:[]),{type:'insert',record},audit]);
 return {ok:true,dashboard:{id:record.id,definition,createdAt:record.payload.createdAt,updatedAt:now}};
}
