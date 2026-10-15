import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {loadData} from '../../../lib/data-service';
import {dashboardEvidence} from '../../../lib/dashboard-evidence';
import {createProvider} from '../../../lib/intelligence/provider';
import {intelligenceResponse} from '../../../lib/intelligence/service';
import type {Filters} from '../../../lib/intelligence/types';
export const dynamic='force-dynamic';
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>3000)throw Error('Request too large.');const body=JSON.parse(raw);if(!body.filters||typeof body.filters!=='object'||Array.isArray(body.filters))throw Error('Choose valid filters.');const filters:Filters={};for(const key of ['start','end','brand','account','location','platform'] as const){const v=body.filters[key];if(v!==undefined){if(typeof v!=='string'||v.length>120)throw Error('Invalid filter.');if(v)filters[key]=v;}}for(const key of ['start','end'] as const)if(filters[key]&&(!/^\d{4}-\d{2}-\d{2}$/.test(filters[key]!)||new Date(filters[key]!).toISOString().slice(0,10)!==filters[key]))throw Error('Invalid date.');if(filters.start&&filters.end&&filters.start>filters.end)throw Error('Invalid date range.');if(filters.platform&&!['Facebook','Instagram'].includes(filters.platform))throw Error('Choose an external platform.');const pack=dashboardEvidence(await loadData(getStorage()),filters),runtime=getAIRuntime();let provider=null;try{provider=createProvider(runtime.config)}catch{}return Response.json(await intelligenceResponse(pack,provider,runtime.cache,runtime.dailyLimit),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'The briefing is temporarily unavailable. Calculated dashboard results remain available.'},{status:400,headers:{'Cache-Control':'no-store'}})}}
