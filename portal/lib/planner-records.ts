import type {Storage} from './storage-contract';
export type PlannerIdea={id:string;title:string;description:string;category:string;priority:'Low'|'Normal'|'High';status:'Open'|'Converted'|'Archived';convertedPlanId?:string};
export type PlannerCampaign={id:string;title:string;date:string;endDate:string;objective:string;audience:string;linkedPlanIds:string[];linkedPostIds:string[]};
export type PlannerNote={id:string;title:string;body:string;linkedPlanId:string};
export const planStages=['Idea','Draft','Ready','Scheduled','Published','Archived'] as const;
export const stageLabel=(stage:string)=>(({Idea:'Ideas',Draft:'Drafting',Cancelled:'Archived'} as Record<string,string>)[stage]||stage);
export const plannerText=(v:unknown,max:number,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw Error('Check the planner text fields and their length.');return v.trim();};
export const plannerDate=(v:unknown)=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Choose a valid calendar date.');return v;};
export function planExtras(input:any){const priority=input.priority??'Normal';if(!['Low','Normal','High'].includes(priority))throw Error('Choose a valid priority.');const stakeholders=input.targetStakeholders??[];if(!Array.isArray(stakeholders)||stakeholders.length>30)throw Error('Choose up to thirty target stakeholders.');return {category:plannerText(input.category??'',120),description:plannerText(input.description??'',3000),priority:priority as PlannerIdea['priority'],targetStakeholders:[...new Set(stakeholders.map(s=>plannerText(s,150,true)))]};}
export async function savePlannerRecord(store:Storage,body:any){
 const kinds:Record<string,string>={idea:'planner_idea',campaign:'planner_campaign',note:'planner_note'},kind=kinds[body?.kind],input=body?.record;
 if(!kind||!['save','delete','convert'].includes(body.action)||!input||typeof input.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(input.id))throw Error('Choose a valid planner record.');
 const rows=await store.readRecords(),existing=rows.find(r=>r.id===input.id);if(existing&&existing.kind!==kind)throw Error('This ID belongs to another record type.');
 const now=new Date().toISOString(),audit={type:'audit' as const,entry:{id:crypto.randomUUID(),actor:'Workspace staff',action:body.action+' '+kind,record_id:input.id,date:now}},upsert=(payload:any,recordKind=kind)=>({type:'upsert' as const,record:{id:payload.id,kind:recordKind,payload,updatedAt:now}});
 if(body.action==='convert'){
  if(kind!=='planner_idea'||!existing)throw Error('Choose a saved idea to convert.');
  const idea=existing.payload as PlannerIdea;if(idea.status==='Archived')throw Error('Reopen this idea before converting it.');
  if(idea.convertedPlanId&&rows.some(r=>r.kind==='content_plan'&&r.id===idea.convertedPlanId))return {ok:true,planId:idea.convertedPlanId};
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(idea.id)),planId='idea-plan-'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  const plan={id:planId,title:idea.title,date:plannerDate(body.date),kind:'Post',status:'Draft',platform:'',account:'',brand:'',format:'',notes:idea.description,...planExtras({...idea,targetStakeholders:[]})};
  await store.apply([upsert(plan,'content_plan'),upsert({...idea,status:'Converted',convertedPlanId:planId}),audit]);return {ok:true,planId};
 }
 if(body.action==='delete'){await store.apply([{type:'delete',id:input.id,kind},audit]);return {ok:true};}
 const title=plannerText(input.title,300,true);let record:PlannerIdea|PlannerCampaign|PlannerNote;
 if(kind==='planner_idea'){
  if(!['Open','Converted','Archived'].includes(input.status)||!['Low','Normal','High'].includes(input.priority))throw Error('Choose an idea status and priority.');
  const convertedPlanId=existing?.payload.convertedPlanId;if(input.status==='Converted'&&!convertedPlanId)throw Error('Use Convert to Planned Content to convert this idea.');
  record={id:input.id,title,description:plannerText(input.description,3000),category:plannerText(input.category,120),priority:input.priority,status:input.status,...(convertedPlanId?{convertedPlanId}:{})};
 }else if(kind==='planner_campaign'){
  const date=plannerDate(input.date),endDate=plannerDate(input.endDate);if(date>endDate)throw Error('Campaign start date must be on or before its end date.');
  const linked=(key:string,recordKind:string)=>{const ids=input[key]??[];if(!Array.isArray(ids)||ids.length>500||ids.some(id=>typeof id!=='string'||!rows.some(r=>r.id===id&&r.kind===recordKind)))throw Error('Choose existing linked posts or plans.');return [...new Set<string>(ids)];};
  record={id:input.id,title,date,endDate,objective:plannerText(input.objective,3000,true),audience:plannerText(input.audience,500),linkedPlanIds:linked('linkedPlanIds','content_plan'),linkedPostIds:linked('linkedPostIds','posts')};
 }else{
  const linkedPlanId=plannerText(input.linkedPlanId??'',100);if(linkedPlanId&&!rows.some(r=>r.id===linkedPlanId&&r.kind==='content_plan'))throw Error('Choose an existing plan for this note.');record={id:input.id,title,body:plannerText(input.body,10000,true),linkedPlanId};
 }
 await store.apply([upsert(record),audit]);return {ok:true};
}
