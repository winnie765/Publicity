import {getStorage} from '../../../lib/storage';
import {workspaceGuard} from '../../../lib/workspace-security';
import {cmsAction,cmsState,cmsPreview} from '../../../lib/site-manager-service';
export const dynamic='force-dynamic';
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{return Response.json(new URL(request.url).searchParams.get('preview')==='1'?await cmsPreview(getStorage()):await cmsState(getStorage()),{headers:{'Cache-Control':'private, no-store'}})}catch{return Response.json({error:'The site manager is temporarily unavailable.'},{status:503})}}
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>150000)throw Error('This content is too large.');return Response.json(await cmsAction(getStorage(),JSON.parse(raw)),{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'Content could not be saved.'},{status:400})}}
