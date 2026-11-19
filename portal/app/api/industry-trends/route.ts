import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {industryCronConfigured} from '../../../lib/industry-cron-security';
import {readIndustryTrends,refreshIndustryTrends,industryTopics} from '../../../lib/industry-trends';
import {industryOpportunityEvidence} from '../../../lib/industry-opportunities';
import {createProvider} from '../../../lib/intelligence/provider';
import {intelligenceResponse} from '../../../lib/intelligence/service';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const store=getStorage(),snapshot=await readIndustryTrends(store),schedule=(await store.readRecords(['industry_schedule_status'])).find(r=>r.id==='industry-schedule-status')?.payload;return json({snapshot,topics:industryTopics(snapshot),schedule,scheduledConfigured:industryCronConfigured()});}catch{return json({error:'Sector updates could not be loaded. Retry without clearing the cache.'},503);}}
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>8000)throw Error('The request is too large.');const body=JSON.parse(raw||'{}'),store=getStorage();if(body.action==='refresh'){const snapshot=await refreshIndustryTrends(store,fetch,new Date(),{manual:body.manual===true});return json({snapshot,topics:industryTopics(snapshot)});}if(body.action!=='analyse')throw Error('Choose a supported industry action.');const {pack,articles}=await industryOpportunityEvidence(store,body.filters,body.articleIds),runtime=getAIRuntime();let provider=null;try{provider=createProvider(runtime.config)}catch{}const result=await intelligenceResponse(pack,provider,runtime.cache,runtime.dailyLimit),seen=new Set<string>();result.report.insights=result.report.insights.filter(i=>{const ids=i.evidenceIds.filter(id=>/^I\d{3}$/.test(id)&&id!=='I000');if(ids.some(id=>seen.has(id)))return false;ids.forEach(id=>seen.add(id));return true;});return json({...result,articles});}catch(e){return json({error:e instanceof Error?e.message:'Industry updates are unavailable.'},400);}}
