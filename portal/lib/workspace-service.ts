import type {Storage} from './storage-contract';
import {loadData} from './data-service';
export type Plan={id:string;title:string;date:string;kind:'Post'|'Event'|'Campaign';status:'Idea'|'Draft'|'Scheduled'|'Published'|'Cancelled';platform:string;account:string;brand:string;format:string;notes:string;postId?:string};
export type Publication={id:string;postId:string;title:string;summary:string;body?:string;imageUrl:string;section:string;featured:boolean;published:boolean};
export type Impact={id:string;date:string;period:string;programmes:number|null;activities:number|null;participants?:number|null;volunteers:number|null;communityReach:number|null;source:string;published:boolean};
export type PublicEvent={id:string;title:string;date:string;location:string;summary:string;imageUrl:string;brand:string;url:string;published:boolean};
export type PublicPartner={id:string;title:string;imageUrl:string;url:string;published:boolean};
export type ProgrammeProfile={id:string;brand:string;overview:string;imageUrl:string;published:boolean};
export const storySections=['Community','Senior','Volunteer','Health Promotion','HHP','AAC','Success Story','Event'];
const text=(value:unknown,max:number,required=false)=>{if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw Error('Check the required text fields and their length.');return value.trim();};
const date=(value:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw Error('Choose a valid calendar date.');return value;};
export function safeImage(value:string){if(!value)return '';try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}}
export function safeSocialLink(value:string){try{const u=new URL(value);return u.protocol==='https:'&&['facebook.com','www.facebook.com','m.facebook.com','fb.watch','instagram.com','www.instagram.com'].includes(u.hostname)?u.href:'';}catch{return '';}}
export async function workspaceRecords(store:Storage){const rows=await store.readRecords();return {plans:rows.filter(r=>r.kind==='content_plan').map(r=>r.payload as Plan),publications:rows.filter(r=>r.kind==='public_content').map(r=>r.payload as Publication),impacts:rows.filter(r=>r.kind==='community_impact').map(r=>r.payload as Impact),events:rows.filter(r=>r.kind==='public_event').map(r=>r.payload as PublicEvent),partners:rows.filter(r=>r.kind==='public_partner').map(r=>r.payload as PublicPartner),programmes:rows.filter(r=>r.kind==='programme_profile').map(r=>r.payload as ProgrammeProfile)};}
export async function saveWorkspaceRecord(store:Storage,body:any){
 const kinds:Record<string,string>={plan:'content_plan',publication:'public_content',impact:'community_impact',event:'public_event',partner:'public_partner',programme:'programme_profile'},kind=kinds[body?.kind];if(!kind||!['save','delete'].includes(body?.action))throw Error('Choose a supported Workspace action.');
 const input=body.record;if(!input||typeof input.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(input.id))throw Error('Invalid Workspace record.');
 const rows=await store.readRecords(),existing=rows.find(r=>r.id===input.id);if(existing&&existing.kind!==kind)throw Error('This ID belongs to another record type.');
 const now=new Date().toISOString(),audit={type:'audit' as const,entry:{id:crypto.randomUUID(),actor:'Workspace staff',action:body.action+' '+kind,record_id:input.id,date:now}};
 if(body.action==='delete'){await store.apply([{type:'delete',id:input.id,kind},audit]);return {ok:true};}
 let record:Plan|Publication|Impact|PublicEvent|PublicPartner|ProgrammeProfile;
 if(kind==='content_plan'){
  const data=await loadData(store);if(!['Post','Event','Campaign'].includes(input.kind)||!['Idea','Draft','Scheduled','Published','Cancelled'].includes(input.status))throw Error('Choose a content kind and status.');
  const account=data.config.accounts.find(a=>a.name===input.account);if(input.account&&(!account||account.platform!==input.platform||account.brand&&account.brand!==input.brand))throw Error('Account, platform and brand must match.');if(input.brand&&!data.config.brands.includes(input.brand))throw Error('Choose a configured brand.');if(input.platform&&!['Facebook','Instagram','Workvivo'].includes(input.platform))throw Error('Choose a valid platform.');
  record={id:input.id,title:text(input.title,300,true),date:date(input.date),kind:input.kind,status:input.status,platform:text(input.platform,80),account:text(input.account,100),brand:text(input.brand,100),format:text(input.format,100),notes:text(input.notes,5000),...(input.postId?{postId:text(input.postId,100)}:{})};
 }else if(kind==='public_content'){
  const data=await loadData(store),post=data.posts.find(p=>p.id===input.postId);if(!post||!['Facebook','Instagram'].includes(post.platform)||post.status==='draft')throw Error('Choose a published Facebook or Instagram post. Workvivo remains private.');
  const imageUrl=text(input.imageUrl,2000);if(imageUrl&&!safeImage(imageUrl))throw Error('Use a public HTTPS image URL.');if(!storySections.includes(input.section)||typeof input.featured!=='boolean'||typeof input.published!=='boolean')throw Error('Choose a story section and publication status.');
  if(rows.some(r=>r.kind===kind&&r.id!==input.id&&r.payload.postId===post.id))throw Error('This post already has a public story. Edit that story instead.');
  record={id:input.id,postId:post.id,title:text(input.title,300,true),summary:text(input.summary,1800,true),body:text(input.body??'',20000),imageUrl,section:input.section,featured:input.featured,published:input.published};
 }else if(['public_event','public_partner','programme_profile'].includes(kind)){
  if(typeof input.published!=='boolean')throw Error('Choose a publication status.');
  const imageUrl=text(input.imageUrl??'',2000);if(imageUrl&&!safeImage(imageUrl))throw Error('Use a public HTTPS image URL.');
  const base={id:input.id,imageUrl,published:input.published};
  if(kind==='programme_profile'){
   const data=await loadData(store),brand=text(input.brand,100,true);if(!data.config.brands.includes(brand))throw Error('Choose a configured brand.');
   if(rows.some(r=>r.kind===kind&&r.id!==input.id&&r.payload.brand===brand))throw Error('Edit the existing programme overview.');
   record={...base,brand,overview:text(input.overview,5000,true)};
  }else{
   const url=text(input.url??'',2000);if(url&&!safeImage(url))throw Error('Use an HTTPS website link.');
   if(kind==='public_partner'){
    if(!imageUrl)throw Error('Add an approved partner logo URL.');record={...base,title:text(input.title,150,true),url};
   }else{
    const data=await loadData(store),brand=text(input.brand??'',100);if(brand&&!data.config.brands.includes(brand))throw Error('Choose a configured brand.');
    record={...base,title:text(input.title,300,true),date:date(input.date),location:text(input.location,300,true),summary:text(input.summary,1800,true),brand,url};
   }
  }
 }else{
  const count=(key:string)=>{const v=input[key];if(v===null||v==='')return null;if(!Number.isInteger(v)||v<0||v>1e9)throw Error('Impact figures must be non-negative whole numbers, or left unavailable.');return v;};
  if(typeof input.published!=='boolean')throw Error('Choose a publication status.');record={id:input.id,date:date(input.date),period:text(input.period,150,true),programmes:count('programmes'),activities:count('activities'),participants:input.participants===undefined?null:count('participants'),volunteers:count('volunteers'),communityReach:count('communityReach'),source:text(input.source,1800,true),published:input.published};
 }
 await store.apply([{type:'upsert',record:{id:record.id,kind,payload:record,updatedAt:now}},audit]);return {ok:true};
}
export async function publicPortalData(store:Storage,today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Singapore'})){
 const data=await loadData(store),{publications,impacts,events,partners,programmes}=await workspaceRecords(store);
 const eligible=data.posts.filter(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform)&&p.date<=today);
 const stories=publications.filter(p=>p.published).flatMap(p=>{const post=eligible.find(post=>post.id===p.postId);return post?[{id:p.id,title:p.title,summary:p.summary,body:p.body||'',imageUrl:safeImage(p.imageUrl),section:p.section,featured:p.featured,brand:post.brand==='Unclassified'?'Community Care':post.brand,platform:post.platform,date:post.date,url:safeSocialLink(post.url)}]:[];}).sort((a,b)=>b.date.localeCompare(a.date));
 const latest=impacts.filter(i=>i.published&&i.date<=today).sort((a,b)=>b.date.localeCompare(a.date))[0];
 return {stories,brands:data.config.brands.filter(b=>b!=='Unclassified'),events:events.filter(e=>e.published&&e.date>=today).map(e=>({id:e.id,title:e.title,date:e.date,location:e.location,summary:e.summary,imageUrl:safeImage(e.imageUrl),brand:e.brand,url:safeImage(e.url)})).sort((a,b)=>a.date.localeCompare(b.date)),partners:partners.filter(p=>p.published).map(p=>({id:p.id,title:p.title,imageUrl:safeImage(p.imageUrl),url:safeImage(p.url)})),programmes:programmes.filter(p=>p.published).map(p=>({brand:p.brand,overview:p.overview,imageUrl:safeImage(p.imageUrl)})),impact:latest?{period:latest.period,date:latest.date,programmes:latest.programmes,activities:latest.activities,participants:latest.participants??null,volunteers:latest.volunteers,communityReach:latest.communityReach}:null};
}
