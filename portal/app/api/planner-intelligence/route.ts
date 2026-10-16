import {getStorage} from '../../../lib/storage';
import {workspaceGuard} from '../../../lib/workspace-security';
import {plannerEvidence} from '../../../lib/planner-intelligence';
import {createProvider} from '../../../lib/intelligence/provider';
import {intelligenceResponse} from '../../../lib/intelligence/service';
import {getAIRuntime} from '../../../lib/ai-runtime';
export const dynamic='force-dynamic';
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>4000)return Response.json({error:'Please shorten the planning question.'},{status:413});const input=JSON.parse(raw),pack=await plannerEvidence(getStorage(),input.question,input.stakeholder??'',input.postId??''),runtime=getAIRuntime();return Response.json(await intelligenceResponse(pack,createProvider(runtime.config),runtime.cache,runtime.dailyLimit),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Planner analysis is temporarily unavailable.'},{status:400});}}
