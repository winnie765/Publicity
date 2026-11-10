import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {loadData} from '../../../lib/data-service';
import {getAIRuntime} from '../../../lib/ai-runtime';
import {createProvider} from '../../../lib/intelligence/provider';
import {intelligenceResponse} from '../../../lib/intelligence/service';
import {analystAnalysis,analystEvidence,safeAnalystInsights,opportunityKinds,approvedCaption} from '../../../lib/social-analyst';
import {createAnalystPlan,linkExperimentPosts,evaluateExperiment,experimentScope} from '../../../lib/analyst-experiments';
import {generateWriting} from '../../../lib/content-writing';
import type {AnalyticalFilters} from '../../../lib/analytical-dashboards';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
 const denied=await workspaceGuard(request);if(denied)return denied;
 try{const store=getStorage();await Promise.all([store.readRecords(['config','posts','analyst_experiment','content_plan']),store.readAudit()]);const data=await loadData(store,'social'),url=new URL(request.url),filters=Object.fromEntries(['platform','account','brand','start','end'].filter(k=>url.searchParams.has(k)).map(k=>[k,url.searchParams.get(k)])) as Partial<AnalyticalFilters>;
 const config={accounts:data.config.accounts.filter(a=>['Facebook','Instagram'].includes(a.platform)),brands:data.config.brands,types:data.config.types};
 if(!data.posts.some(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform)))return json({analysis:null,config,experiments:[],message:'No published Facebook or Instagram records are available. Record posts before analysing performance.'});
 const analysis=await analystAnalysis(data,filters),rows=await store.readRecords(['analyst_experiment','content_plan']);
 const experiments=rows.filter(r=>r.kind==='analyst_experiment').map(row=>{const experiment=experimentScope(row.payload,data);return {experiment,updatedAt:row.updatedAt,planExists:rows.some(p=>p.kind==='content_plan'&&p.id===experiment.planId),result:evaluateExperiment(experiment,data.posts),choices:data.posts.filter(p=>p.status!=='draft'&&p.platform===experiment.platform&&p.account===experiment.account&&p.brand===experiment.brand&&p.type===experiment.format&&p.date>=experiment.start&&p.date<=experiment.end).map(p=>({id:p.id,title:p.title,date:p.date}))};}).filter(r=>(!analysis.filters.platform||r.experiment.platform===analysis.filters.platform)&&(!analysis.filters.account||r.experiment.account===analysis.filters.account)&&(!analysis.filters.brand||r.experiment.brand===analysis.filters.brand));
 return json({analysis,config,experiments});
 }catch(e){return json({error:e instanceof Error?e.message:'The analyst data could not be loaded. Try Refresh Analysis.'},400);}
}
export async function POST(request:Request){
 const denied=await workspaceGuard(request);if(denied)return denied;
 try{const raw=await request.text();if(raw.length>10000)return json({error:'Shorten the analyst request.'},413);const body=JSON.parse(raw),store=getStorage();
 if(body.action==='create-plan')return json(await createAnalystPlan(store,body));
 if(body.action==='follow-up')return json(await linkExperimentPosts(store,body));
 if(body.action==='interpret'){
  const analysis=await analystAnalysis(await loadData(store,'social'),body.filters);if(body.revision!==analysis.revision)return json({error:'Source data changed. Refresh Analysis before requesting Gemini interpretation.'},409);
  const runtime=getAIRuntime(),response=await intelligenceResponse(analystEvidence(analysis),createProvider(runtime.config),runtime.cache,runtime.dailyLimit),insights=safeAnalystInsights(response,analysis);
  return json({mode:response.mode,reason:response.reason,cached:response.cached,generatedAt:response.generatedAt,insights,message:response.mode!=='gemini'?({not_configured:'Gemini is not configured for this deployment.',busy:'Gemini is busy or its daily allowance has been reached. Try again later.',no_data:'No suitable measured data is available.',unavailable:'Gemini is temporarily unavailable.'}[response.reason||'unavailable']+' Calculated findings remain available.'):!insights.length?'Gemini returned no safely supported recommendations. Use the calculated findings or try again.':undefined});
 }
 if(body.action==='writing'){
  if(!opportunityKinds.includes(body.kind)||!['Health promotion','Active ageing','Community activities','Volunteer appreciation','Community impact','Partnership stories'].includes(body.topic)||!['Ask a respectful open question','Invite enquiries','Invite participation using placeholders'].includes(body.cta)||!['Facebook','Instagram'].includes(body.platform))throw Error('Choose a content request, topic, call to action and platform.');
  const caption=approvedCaption(body.caption??'',body.privacyApproved);if(['Improved Caption','Alternative Caption Versions'].includes(body.kind)&&!caption)throw Error('Enter a reviewed, anonymised caption first.');
  const runtime=getAIRuntime(),result=await generateWriting({analystRequest:body.kind,action:body.kind==='Improved Caption'?'Improve Caption':body.kind==='Alternative Caption Versions'?'Rewrite':'Generate Captions',language:'English',event:'Community programme draft',description:body.kind+'. Topic: '+body.topic+'. These are proposed ideas, not claims about an existing event. Offer practical Singapore community-care ideas; alternative caption requests should offer distinct warm, concise and invitation-led versions.',audience:'Singapore community-care participants, including older adults as an intended communication audience, not an inferred demographic. Use plain respectful language, accessible calls to action, no age stereotypes and no medical promises.',message:body.cta+'. Do not invent programme names, dates, attendance, personal stories or performance statistics. Use placeholders where details are needed.',caption,brand:'Community Care'},runtime);
  const text=result.output[body.platform==='Facebook'?'facebook':'instagram'].english;
  if(text.length>5000)throw Error('The generated draft was too long for a content plan. Try a shorter caption or a narrower idea request.');
  const allowed=new Set(caption.match(/\d+(?:[.,:\/-]\d+)*/g)||[]);if((text.match(/\d+(?:[.,:\/-]\d+)*/g)||[]).some(n=>!allowed.has(n)))throw Error('The generated draft included unsupported numbers. Nothing was saved; try another draft.');
  return json({text,cached:result.cached,notice:'AI draft only. Review the facts, consent, wording and accessibility before saving or publishing.'});
 }
 return json({error:'Choose a supported analyst action.'},400);
 }catch(e){return json({error:e instanceof Error?e.message:'The analyst request failed. Your records were not changed.'},400);}
}
