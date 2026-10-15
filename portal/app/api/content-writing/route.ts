import {workspaceGuard} from '../../../lib/workspace-security';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {generateWriting,writingInput} from '../../../lib/content-writing';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const denied=await workspaceGuard(request);if(denied)return denied;
 let input;try{const raw=await request.text();if(raw.length>15000)return Response.json({error:'Please shorten the source text.'},{status:413});input=writingInput(JSON.parse(raw));}catch(e){return Response.json({error:e instanceof Error?e.message:'Check the writing fields.'},{status:400});}
 try{return Response.json(await generateWriting(input,getAIRuntime()),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'AI writing is temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
