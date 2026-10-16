import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {reportTrash,manageReport} from '../../../lib/report-management';
export const dynamic='force-dynamic';
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{return Response.json(await reportTrash(getStorage()),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Reports Trash could not be loaded.'},{status:503});}}
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>1500)return Response.json({error:'Request is too large.'},{status:413});return Response.json(await manageReport(getStorage(),JSON.parse(raw)),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Report management is unavailable.'},{status:400});}}
