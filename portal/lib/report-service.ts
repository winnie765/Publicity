import type {ReportIndexRow} from './report-index';
import type {Storage} from './storage-contract';
import {loadData} from './data-service';
import {calculateMonthlyReport,monthlyEvidence,type MonthlyReport} from './monthly-report';
import {createProvider,type ProviderConfig} from './intelligence/provider';
import {calculatedReport,intelligenceResponse} from './intelligence/service';
import type {AICache,IntelligenceReport,EvidencePack} from './intelligence/types';
export type ReportRuntime={config:ProviderConfig;cache:AICache;dailyLimit:number};
export type ReportAutomation={enabled:boolean;frequency:'monthly'|'quarterly';updatedAt:string};
export const automationDefault:ReportAutomation={enabled:false,frequency:'monthly',updatedAt:''};
export async function reportIndex(store:Storage):Promise<ReportIndexRow[]>{if(store.readReportIndex)return store.readReportIndex();return (await archivedReports(store)).map(report=>({id:report.id,label:report.period.label,frequency:report.period.frequency,generatedAt:report.generatedAt,mode:report.ai?.mode||'calculated',posts:report.current.posts}));}
export async function archivedReport(store:Storage,id:string):Promise<MonthlyReport|undefined>{if(store.readRecord){const row=await store.readRecord(id);return row?.kind==='generated_report'?row.payload:undefined;}return (await archivedReports(store)).find(report=>report.id===id);}
export async function archivedReports(store:Storage){return (await store.readRecords(['config','generated_report'])).filter(r=>r.kind==='generated_report').map(r=>r.payload as MonthlyReport).sort((a,b)=>b.generatedAt.localeCompare(a.generatedAt));}
export async function reportAutomation(store:Storage):Promise<ReportAutomation>{return (await store.readRecords(['config','report_settings'])).find(r=>r.id==='monthly-report-automation'&&r.kind==='report_settings')?.payload||automationDefault;}
export function monthlyFallback(pack:EvidencePack):IntelligenceReport{
 return calculatedReport(pack);
}
export async function generateMonthlyReport(store:Storage,runtime:ReportRuntime,year:number,month:number,frequency:'monthly'|'quarterly'='monthly',automaticId?:string,deferAI?:(task:()=>Promise<void>)=>void){
 const archive=await reportIndex(store);if(automaticId){const existing=archive.find(r=>r.id===automaticId);if(existing)return (await archivedReport(store,automaticId))!;}
 if(archive.filter(r=>r.generatedAt.slice(0,10)===new Date().toISOString().slice(0,10)).length>=30)throw Error('The daily report limit has been reached. Please use an archived report or try tomorrow.');
 const report=calculateMonthlyReport(await loadData(store),year,month,frequency);if(automaticId)report.id=automaticId;
 const pack=monthlyEvidence(report);let provider=null;try{provider=createProvider(runtime.config)}catch{}
 report.ai=await intelligenceResponse(pack,deferAI?null:provider,runtime.cache,runtime.dailyLimit);if(report.ai.mode==='calculated')report.ai.report=monthlyFallback(pack);if(deferAI&&provider)report.aiStatus='pending';
 const updatedAt=new Date().toISOString();await store.apply([{type:'upsert',record:{id:report.id,kind:'generated_report',payload:{...report,date:report.period.end},updatedAt}},{type:'audit',entry:{id:crypto.randomUUID(),actor:automaticId?'Report automation':'Public report generator',action:'Generate '+frequency+' report',record_id:report.id,date:updatedAt}}]);if(deferAI&&provider)deferAI(async()=>{try{const ai=await intelligenceResponse(pack,provider,runtime.cache,runtime.dailyLimit);const existing=(await store.readRecords(['config','generated_report'])).find(row=>row.id===report.id&&row.kind==='generated_report');if(!existing)return;const enriched={...existing.payload,ai,aiStatus:ai.mode==='gemini'?'complete':'unavailable'};await store.apply([{type:'upsert',record:{...existing,payload:enriched,updatedAt:new Date().toISOString()}}]);}catch{/* The calculated report remains available even if enrichment fails. */}});return report;
}
export async function runReportAutomation(store:Storage,runtime:ReportRuntime,now=new Date()){
 const setting=await reportAutomation(store);if(!setting.enabled)return {generated:false,reason:'Automation is disabled.'};
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit'}).formatToParts(now),year=Number(parts.find(p=>p.type==='year')!.value),month=Number(parts.find(p=>p.type==='month')!.value);
 if(setting.frequency==='quarterly'&&![1,4,7,10].includes(month))return {generated:false,reason:'Next quarterly report is due after the quarter closes.'};
 const closed=new Date(Date.UTC(year,month-2,1)),periodYear=closed.getUTCFullYear(),periodMonth=closed.getUTCMonth()+1,id='report-auto-'+setting.frequency+'-'+periodYear+'-'+String(periodMonth).padStart(2,'0');
 const existing=(await archivedReports(store)).find(r=>r.id===id);if(existing)return {generated:false,reason:'The scheduled report is already archived.',id};
 const report=await generateMonthlyReport(store,runtime,periodYear,periodMonth,setting.frequency,id);return {generated:true,id:report.id,label:report.period.label};
}
