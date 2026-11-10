import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {loadData} from '../../../lib/data-service';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {dashboardCatalog,validateDashboard,executeChart} from '../../../lib/dashboard-spec';
import {proposeDashboard} from '../../../lib/dashboard-creator';
import {savedDashboardList,saveDashboardAction} from '../../../lib/saved-dashboards';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const store=getStorage();await Promise.all([store.readRecords(['config','posts','followers','saved_dashboard']),store.readAudit()]);const data=await loadData(store,'followers');return json({catalog:dashboardCatalog(data),...savedDashboardList(await store.readRecords(['saved_dashboard']))});}catch{return json({error:'Dashboard settings could not be loaded. Try again; saved source records are unchanged.'},503);}}
export async function POST(request:Request){
 const denied=await workspaceGuard(request);if(denied)return denied;
 try{const raw=await request.text();if(raw.length>150000)return json({error:'The dashboard is too large. Use at most twelve concise charts and fewer filter values.'},413);const body=JSON.parse(raw);if(!body||typeof body!=='object')throw Error('Choose a dashboard action.');const store=getStorage();
  const data=await loadData(store,'followers'),catalog=dashboardCatalog(data);
  if(body.action==='propose'){const proposal=await proposeDashboard(body.question,data,getAIRuntime());return json({...proposal,results:proposal.definition.charts.map(chart=>executeChart(chart,data,catalog))});}
  if(body.action==='evaluate'){const definition=validateDashboard(body.definition,catalog);return json({definition,results:definition.charts.map(chart=>executeChart(chart,data,catalog))});}
  if(['save','delete'].includes(body.action))return json(await saveDashboardAction(store,body,catalog));
  throw Error('Choose a supported dashboard action.');
 }catch(error){return json({error:error instanceof Error?error.message:'The dashboard request failed. No source records were changed.'},400);}
}
