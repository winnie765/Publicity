import {preparePostContentAction} from '../../../lib/post-content-actions';
import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {loadData,applyDataAction} from '@/lib/data-service';
export const runtime='nodejs';
export const maxDuration=300;
export const dynamic='force-dynamic';
const json=(value:any,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Portal-Import-Engine':'bulk-v2',...(process.env.VERCEL_GIT_COMMIT_SHA?{'X-Portal-Revision':process.env.VERCEL_GIT_COMMIT_SHA.slice(0,12)}:{})}});
export async function GET(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const store=getStorage();const [data,audit]=await Promise.all([loadData(store),store.readAudit()]);return json({...data,audit:audit.map(a=>({...a,actor:a.action.toLowerCase().includes('import')?'Workbook upload':'Data update'}))});}catch(e:any){return json({error:e.message},503);}}
export async function POST(req:Request){const denied=await workspaceGuard(req);if(denied)return denied;try{const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Cross-origin request rejected.'},403);if(Number(req.headers.get('content-length')||0)>2_000_000)return json({error:'Upload too large.'},413);const body=await req.text();if(body.length>2_000_000)return json({error:'Upload too large.'},413);return json(await applyDataAction(getStorage(),await preparePostContentAction(getStorage(),JSON.parse(body))));}catch(e:any){return json({error:e.message},400);}}
