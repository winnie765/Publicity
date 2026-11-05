import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {readIndustryTrends,refreshIndustryTrends,industryEvidence,industryTopics} from '../../../lib/industry-trends';
import {createProvider} from '../../../lib/intelligence/provider';
import {intelligenceResponse} from '../../../lib/intelligence/service';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const snapshot=await readIndustryTrends(getStorage());return Response.json({snapshot,topics:industryTopics(snapshot)},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Sector updates could not be loaded.'},{status:503});}}
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>1000)throw Error('The request is too large.');const body=JSON.parse(raw||'{}'),store=getStorage();if(body.action==='refresh'){const snapshot=await refreshIndustryTrends(store);return Response.json({snapshot,topics:industryTopics(snapshot)},{headers:{'Cache-Control':'no-store'}});}if(body.action!=='analyse')throw Error('Choose a supported industry action.');const snapshot=await readIndustryTrends(store);if(!snapshot?.articles.length)throw Error('Load dated sector updates before requesting an industry briefing.');const runtime=getAIRuntime();let provider=null;try{provider=createProvider(runtime.config)}catch{}return Response.json(await intelligenceResponse(industryEvidence(snapshot),provider,runtime.cache,runtime.dailyLimit),{headers:{'Cache-Control':'no-store'}});}catch(error){return Response.json({error:error instanceof Error?error.message:'Industry updates are unavailable.'},{status:400});}}
