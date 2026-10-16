import {getStorage} from '../../../lib/storage';
import {workspaceGuard} from '../../../lib/workspace-security';
import {recordLibrary,recordOperation} from '../../../lib/record-operations';
export const dynamic='force-dynamic';
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{return Response.json(await recordLibrary(getStorage()),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Workspace records could not be loaded.'},{status:503});}}
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>150000)return Response.json({error:'Please use a smaller batch.'},{status:413});return Response.json(await recordOperation(getStorage(),JSON.parse(raw)),{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'This action could not be completed.'},{status:400});}}
