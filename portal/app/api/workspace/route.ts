import {getStorage} from '../../../lib/storage';
import {workspaceGuard} from '../../../lib/workspace-security';
import {saveWorkspaceRecord,workspaceRecords} from '../../../lib/workspace-service';
export const dynamic='force-dynamic';
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{return Response.json(await workspaceRecords(getStorage()),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'The Workspace records are unavailable.'},{status:503});}}
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>64000)return Response.json({error:'Record is too large.'},{status:413});return Response.json(await saveWorkspaceRecord(getStorage(),JSON.parse(raw)),{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'Could not save the record.'},{status:400});}}
