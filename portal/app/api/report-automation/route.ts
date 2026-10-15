import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {runReportAutomation} from '../../../lib/report-service';
export const dynamic='force-dynamic';
export const maxDuration=120;
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Cross-origin request rejected.'},{status:403});try{return Response.json(await runReportAutomation(getStorage(),getAIRuntime()),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Scheduled generation could not finish. It can be retried safely.'},{status:503})}}
