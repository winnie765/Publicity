import {industryCronAuthorized,industryCronConfigured} from '../../../../lib/industry-cron-security';
import {getStorage} from '../../../../lib/storage';
import {refreshIndustryTrends} from '../../../../lib/industry-trends';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
 if(!industryCronConfigured())return json({error:'Scheduled refresh is not configured.'},503);
 if(!await industryCronAuthorized(request))return json({error:'Scheduled refresh authentication required.'},401);
 const store=getStorage(),now=new Date();
 try{const snapshot=await refreshIndustryTrends(store,fetch,now,{scheduled:true}),outcome=snapshot.fetchedAt!==now.toISOString()?'cached':snapshot.outcome||'no_new',previous=(await store.readRecords(['industry_schedule_status'])).find(r=>r.id==='industry-schedule-status')?.payload;
  await store.apply([{type:'upsert',record:{id:'industry-schedule-status',kind:'industry_schedule_status',payload:{lastRunAt:now.toISOString(),lastSuccessAt:outcome!=='failed'?now.toISOString():previous?.lastSuccessAt,outcome},updatedAt:now.toISOString()}}]);
  return json({outcome,articles:snapshot.articles.length,newItems:snapshot.newItems||0},outcome==='failed'?503:200);
 }catch{console.error('industry_scheduled_refresh_failed',{at:now.toISOString()});try{await store.apply([{type:'upsert',record:{id:'industry-schedule-status',kind:'industry_schedule_status',payload:{lastRunAt:now.toISOString(),outcome:'failed',error:'Scheduled source check failed. Cached updates remain available.'},updatedAt:now.toISOString()}}]);}catch{}return json({error:'Scheduled refresh failed. Cached data was not cleared.'},503);}
}
