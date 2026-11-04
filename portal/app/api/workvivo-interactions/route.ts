import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getWorkvivoInteractions,saveWorkvivoInteraction} from '../../../lib/workvivo-interactions';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{return json(await getWorkvivoInteractions(getStorage(),new URL(request.url).searchParams.get('postId')||''));}catch(error){return json({error:error instanceof Error?error.message:'Interactions could not be loaded.'},400);}}
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Cross-origin request rejected.'},403);const raw=await request.text();if(raw.length>15000)return json({error:'Please use shorter interaction notes.'},413);return json(await saveWorkvivoInteraction(getStorage(),JSON.parse(raw)));}catch(error){return json({error:error instanceof Error?error.message:'The interaction could not be saved.'},400);}}
