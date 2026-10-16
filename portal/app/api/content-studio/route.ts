import {workspaceGuard} from '../../../lib/workspace-security';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {studioInput,generateStudio} from '../../../lib/content-studio';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const denied=await workspaceGuard(request);if(denied)return denied;
 let input;try{const raw=await request.text();if(raw.length>30000)return Response.json({error:'Please shorten your brief or draft.'},{status:413});input=studioInput(JSON.parse(raw));}catch(e){return Response.json({error:e instanceof Error?e.message:'Check your brief.'},{status:400});}
 try{return Response.json(await generateStudio(input,getAIRuntime()),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Writing is temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
