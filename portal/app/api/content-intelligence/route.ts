import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {contentIntelligenceEvidence} from '../../../lib/content-intelligence-service';
import {createProvider} from '../../../lib/intelligence/provider';
import {intelligenceResponse} from '../../../lib/intelligence/service';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>3000)throw Error('The analysis request is too large.');const evidence=await contentIntelligenceEvidence(getStorage(),JSON.parse(raw)),runtime=getAIRuntime();let provider=null;try{provider=createProvider(runtime.config)}catch{}const analysis=await intelligenceResponse(evidence.pack,provider,runtime.cache,runtime.dailyLimit);return Response.json({...('assessment' in evidence?{assessment:evidence.assessment}:{}),...analysis},{headers:{'Cache-Control':'no-store'}});}catch(error){return Response.json({error:error instanceof Error?error.message:'Content analysis is unavailable.'},{status:400,headers:{'Cache-Control':'no-store'}});}}

export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const params=new URL(request.url).searchParams;if(!params.get('postId'))throw Error('Choose a saved post.');const {assessment}=await contentIntelligenceEvidence(getStorage(),{postId:params.get('postId'),context:params.get('context')||'social'});return Response.json({assessment},{headers:{'Cache-Control':'no-store'}});}catch(error){return Response.json({error:error instanceof Error?error.message:'Post comparison is unavailable.'},{status:400});}}
