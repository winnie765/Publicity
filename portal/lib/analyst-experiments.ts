import type {Dataset,Post} from '../app/model';
import type {Storage,Change} from './storage-contract';
import {loadData} from './data-service';
import {saveWorkspaceRecord} from './workspace-service';
import {resolveMasterReferences} from './master-data';
import {masterPayload,withMasterRegistry} from './master-relationships';
import {analystAnalysis,type AnalystCandidate} from './social-analyst';
import {interactionReading,validDate,type AnalyticalFilters} from './analytical-dashboards';
export type AnalystExperiment={id:string;planId:string;createdAt:string;requestKey:string;candidate:AnalystCandidate;filters:AnalyticalFilters;platform:string;account:string;brand:string;format:string;account_id?:string;brand_id?:string;content_type_id?:string;start:string;end:string;minimumPosts:number;minimumAgeDays:number;targetLift:number;baseline:number;basis:string;postIds:string[]};
export function experimentScope(experiment:AnalystExperiment,data:Dataset){const resolved=masterPayload(experiment,withMasterRegistry(data.config).masterRegistry!,false) as AnalystExperiment;resolveMasterReferences(resolved,'posts',data.config);return resolved;}
export function evaluateExperiment(experiment:AnalystExperiment,posts:Post[],asOf=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Singapore'})){
 const eligible:Post[]=[],excluded:{id:string;reason:string}[]=[];
 for(const id of experiment.postIds){const p=posts.find(p=>p.id===id);let reason='';
  if(!p)reason='Post no longer available';else if(p.status==='draft'||p.platform!==experiment.platform||p.account!==experiment.account||p.brand!==experiment.brand||p.type!==experiment.format)reason='Not a published post from the saved account, brand and format';else if(!validDate(p.date)||p.date<experiment.start||p.date>experiment.end||p.date>asOf)reason='Outside the predeclared publication window';else if(interactionReading(p).basis!==experiment.basis||interactionReading(p).value===null)reason='Different or missing measurement basis';else if(!p.metrics_updated_at||!Number.isFinite(Date.parse(p.metrics_updated_at))||Date.parse(p.metrics_updated_at)<Date.parse(p.date+'T00:00:00+08:00')+experiment.minimumAgeDays*86400000||Date.parse(p.metrics_updated_at)>Date.parse(asOf+'T23:59:59+08:00'))reason='Needs a known metrics update after the minimum post age';
  if(reason)excluded.push({id,reason});else eligible.push(p!);
 }
 const observed=eligible.length?eligible.reduce((n,p)=>n+interactionReading(p).value!,0)/eligible.length:null,target=experiment.baseline*(1+experiment.targetLift/100),ready=asOf>=experiment.end&&eligible.length>=experiment.minimumPosts;
 return {status:asOf<experiment.end?'Pending':!ready?'Insufficient data':observed!>=target?'Criteria met':'Criteria not met',observed,target,n:eligible.length,minimumPosts:experiment.minimumPosts,eligibleIds:eligible.map(p=>p.id),excluded,asOf,limitations:['The result evaluates a predefined descriptive criterion, not causal impact or statistical significance.','Metrics were updated after the minimum post age, but exact equal-age measurement cannot be verified. Promotion and audience exposure may differ.','Only explicitly linked posts are evaluated. Review the complete experiment series to avoid cherry-picking.']};
}
const hash=async(value:unknown)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)))),b=>b.toString(16).padStart(2,'0')).join('');
export async function createAnalystPlan(store:Storage,body:any){
 if(body.approved!==true)throw Error('Review the plan and measurement criteria before saving.');
 if(typeof body.id!=='string'||!/^analyst-[a-zA-Z0-9-]{1,70}$/.test(body.id))throw Error('Use a valid recommendation save identifier.');
 const requestKey=await hash({candidateId:body.candidateId,revision:body.revision,filters:body.filters,title:body.title,start:body.start,end:body.end,minimumPosts:body.minimumPosts,targetLift:body.targetLift});
 const existing=(await store.readRecords()).find(r=>r.kind==='analyst_experiment'&&r.id===body.id);if(existing){if(existing.payload.requestKey!==requestKey)throw Error('This save identifier belongs to another plan.');return {ok:true,planId:existing.payload.planId};}
 const data=await loadData(store,'social'),analysis=await analystAnalysis(data,body.filters),candidate=analysis.candidates.find(c=>c.id===body.candidateId);
 if(analysis.revision!==body.revision)throw Error('The source evidence changed. Refresh analysis and review the recommendation again.');
 if(!candidate||candidate.baseline===null||candidate.baseline<=0||candidate.kind==='measurement')throw Error('A supported positive comparison baseline is needed for a measurable experiment.');
 if(!validDate(body.start)||!validDate(body.end)||body.start>body.end||body.start<=analysis.filters.end)throw Error('Choose an experiment window after the analysed period.');
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Singapore'});if(body.start<=today)throw Error('Start the experiment after today so the criteria are recorded before the trial posts.');
 if((Date.parse(body.end)-Date.parse(body.start))/86400000>180)throw Error('Keep an experiment within 180 days.');
 if(!Number.isInteger(body.minimumPosts)||body.minimumPosts<3||body.minimumPosts>30||typeof body.targetLift!=='number'||!Number.isFinite(body.targetLift)||body.targetLift<0||body.targetLift>200)throw Error('Choose 3–30 posts and a staff-set improvement target from 0–200%.');
 const first=data.posts.find(p=>p.id===(candidate.examples[0]?.id)),planId=body.id+'-plan',now=new Date().toISOString();
 const experiment:AnalystExperiment={id:body.id,planId,createdAt:now,requestKey,candidate,filters:analysis.filters,platform:candidate.platform,account:candidate.account,brand:candidate.brand,format:candidate.format,...(first?.account_id?{account_id:first.account_id}:{}),...(first?.brand_id?{brand_id:first.brand_id}:{}),...(first?.content_type_id?{content_type_id:first.content_type_id}:{}),start:body.start,end:body.end,minimumPosts:body.minimumPosts,minimumAgeDays:7,targetLift:body.targetLift,baseline:candidate.baseline,basis:candidate.basis,postIds:[]};
 const record={id:planId,title:body.title,date:body.start,kind:'Post',status:'Draft',platform:candidate.platform,account:candidate.account,brand:candidate.brand,format:candidate.format,notes:['AI Analyst experiment (staff approved).',candidate.observation,candidate.statistics,'Action: '+candidate.action,'Success metric: '+candidate.successMetric,'Frozen baseline: '+candidate.baseline+'; target lift (staff choice): '+body.targetLift+'%.','Publication window: '+body.start+' to '+body.end+'. Minimum '+body.minimumPosts+' posts; metrics update at least seven days after posting.'].join('\n'),category:'AI Analyst Experiment',description:candidate.action,priority:'Normal',targetStakeholders:[]};
 const staged:Change[]=[];await saveWorkspaceRecord({readRecords:k=>store.readRecords(k),readAudit:()=>store.readAudit(),apply:async changes=>{staged.push(...changes);}}, {kind:'plan',action:'save',record});
 await store.apply([...staged.map(change=>change.type==='upsert'&&change.record.id===planId?{...change,type:'insert' as const}:change),{type:'insert',record:{id:experiment.id,kind:'analyst_experiment',payload:experiment,updatedAt:now}}]);
 return {ok:true,planId};
}
export async function linkExperimentPosts(store:Storage,body:any){
 if(body.approved!==true)throw Error('Confirm the experiment posts before saving the follow-up.');
 const row=(await store.readRecords(['analyst_experiment'])).find(r=>r.id===body.id);if(!row)throw Error('Choose a saved analyst experiment.');if(body.expectedUpdatedAt!==row.updatedAt)throw Error('This experiment changed. Refresh before linking results.');
 if(!Array.isArray(body.postIds)||body.postIds.length>100||body.postIds.some((id:unknown)=>typeof id!=='string'))throw Error('Choose up to 100 existing result posts.');
 const data=await loadData(store,'social'),experiment=experimentScope({...row.payload,postIds:[...new Set<string>(body.postIds)]},data),result=evaluateExperiment(experiment,data.posts);
 const invalid=result.excluded.filter(e=>!e.reason.startsWith('Needs a known'));if(invalid.length)throw Error(invalid.map(e=>e.id+': '+e.reason).join('; '));
 const now=new Date().toISOString();await store.apply([{type:'upsert',record:{...row,payload:{...row.payload,postIds:experiment.postIds},updatedAt:now}},{type:'audit',entry:{id:crypto.randomUUID(),actor:'Workspace staff',action:'Link AI analyst experiment results',record_id:row.id,date:now}}]);return {ok:true,result};
}
