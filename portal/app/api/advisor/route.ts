import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {loadData} from '../../../lib/data-service';
import {advisorEvidence} from '../../../lib/advisor-service';
import {createProvider} from '../../../lib/intelligence/provider';
import {intelligenceResponse} from '../../../lib/intelligence/service';
import {calculateEvidence} from '../../../lib/intelligence/evidence';
import type {MonthlyReport} from '../../../lib/monthly-report';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const denied=await workspaceGuard(request);if(denied)return denied;
 try{const raw=await request.text();if(raw.length>2500)return Response.json({error:'Please keep your question under six hundred characters.'},{status:413});const body=JSON.parse(raw),pack=advisorEvidence(await loadData(getStorage()),body.question),runtime=getAIRuntime();let provider=null;try{provider=createProvider(runtime.config)}catch{}
 if(/report|briefing/i.test(pack.advisoryQuestion)){const reports=(await getStorage().readRecords()).filter(r=>r.kind==='generated_report').map(r=>r.payload as MonthlyReport).sort((a,b)=>b.generatedAt.localeCompare(a.generatedAt)).filter(r=>(!pack.filters.start||r.period.end>=pack.filters.start)&&(!pack.filters.end||r.period.start<=pack.filters.end)).slice(0,3);for(const report of reports)pack.facts.push({id:'ARCHIVE'+pack.facts.length,label:'Archived report: '+report.period.label,text:'Fixed generated report snapshot. '+JSON.stringify(report.kpis.map(k=>({metric:k.label,current:k.current,previous:k.previous,change:k.change,note:k.note}))).slice(0,10000)});pack.limitations.push('Archived reports are fixed historical snapshots and can differ from current records.');}
 if(pack.scope!=='workvivo'&&/workvivo|all platforms|workspace|key insights/i.test(pack.advisoryQuestion)){const internal=calculateEvidence(await loadData(getStorage()),'workvivo',{start:pack.filters.start,end:pack.filters.end,brand:pack.filters.brand});pack.facts.push(...internal.facts.slice(0,8).map((f,i)=>({...f,id:'INTERNAL'+i})));pack.limitations.push('Internal Workvivo facts must be discussed separately from external outreach.');}
 const analysis=await intelligenceResponse(pack,provider,runtime.cache,runtime.dailyLimit);return Response.json({question:pack.advisoryQuestion,scope:pack.scope,analysis},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Ask a question of up to six hundred characters, or try again shortly.'},{status:400,headers:{'Cache-Control':'no-store'}})}
}
