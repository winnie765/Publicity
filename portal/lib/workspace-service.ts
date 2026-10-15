import type {Storage} from './storage-contract';
import {loadData} from './data-service';
import {defaultPublicHome,publicHomeFields,type PublicHomeSettings} from './public-site-config';
import {safeContentImage,validateGallery,validatePublicImages,type GalleryImage} from './content-media';
export type Plan={id:string;title:string;date:string;kind:'Post'|'Event'|'Campaign';status:'Idea'|'Draft'|'Scheduled'|'Published'|'Cancelled';platform:string;account:string;brand:string;format:string;notes:string;postId?:string};
export type Publication={id:string;postId:string;title:string;summary:string;body?:string;imageUrl:string;imageAlt?:string;thumbnailUrl?:string;gallery?:GalleryImage[];section:string;featured:boolean;featuredStory?:boolean;showInStories?:boolean;showOnProgramme?:boolean;published:boolean};
export type Impact={id:string;date:string;period:string;programmes:number|null;activities:number|null;participants?:number|null;events?:number|null;volunteers:number|null;communityReach:number|null;source:string;published:boolean};
export type PublicEvent={id:string;title:string;date:string;location:string;summary:string;imageUrl:string;imageAlt?:string;thumbnailUrl?:string;gallery?:GalleryImage[];brand:string;url:string;published:boolean};
export type PublicPartner={id:string;title:string;imageUrl:string;url:string;published:boolean};
export type ProgrammeProfile={id:string;brand:string;overview:string;imageUrl:string;published:boolean};
export const storySections=['Community','Senior','Volunteer','Health Promotion','HHP','AAC','Success Story','Event','Programme'];
const text=(value:unknown,max:number,required=false)=>{if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw Error('Check the required text fields and their length.');return value.trim();};
const date=(value:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw Error('Choose a valid calendar date.');return value;};
export function safeImage(value:string){return safeContentImage(value)}
export function safeSocialLink(value:string){try{const u=new URL(value);return u.protocol==='https:'&&['facebook.com','www.facebook.com','m.facebook.com','fb.watch','instagram.com','www.instagram.com'].includes(u.hostname)?u.href:'';}catch{return '';}}
export async function workspaceRecords(store:Storage){const rows=await store.readRecords();return {plans:rows.filter(r=>r.kind==='content_plan').map(r=>r.payload as Plan),publications:rows.filter(r=>r.kind==='public_content').map(r=>r.payload as Publication),impacts:rows.filter(r=>r.kind==='community_impact').map(r=>r.payload as Impact),events:rows.filter(r=>r.kind==='public_event').map(r=>r.payload as PublicEvent),partners:rows.filter(r=>r.kind==='public_partner').map(r=>r.payload as PublicPartner),programmes:rows.filter(r=>r.kind==='programme_profile').map(r=>r.payload as ProgrammeProfile),home:rows.find(r=>r.kind==='public_home'&&r.id===defaultPublicHome.id)?.payload as PublicHomeSettings|undefined};}
export async function saveWorkspaceRecord(store:Storage,body:any){
 const kinds:Record<string,string>={plan:'content_plan',publication:'public_content',impact:'community_impact',event:'public_event',partner:'public_partner',programme:'programme_profile',home:'public_home'},kind=kinds[body?.kind];if(!kind||!['save','delete'].includes(body?.action))throw Error('Choose a supported Workspace action.');
 const input=body.record;if(!input||typeof input.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(input.id))throw Error('Invalid Workspace record.');
 const rows=await store.readRecords(),existing=rows.find(r=>r.id===input.id);if(existing&&existing.kind!==kind)throw Error('This ID belongs to another record type.');
 const now=new Date().toISOString(),audit={type:'audit' as const,entry:{id:crypto.randomUUID(),actor:'Workspace staff',action:body.action+' '+kind,record_id:input.id,date:now}};
 if(body.action==='delete'){await store.apply([{type:'delete',id:input.id,kind},audit]);return {ok:true};}
 let record:Plan|Publication|Impact|PublicEvent|PublicPartner|ProgrammeProfile|PublicHomeSettings;
 if(kind==='public_home'){
  if(input.id!==defaultPublicHome.id)throw Error('Choose the existing home page settings.');
  const home={...defaultPublicHome};for(const key of publicHomeFields)home[key]=text(input[key],key==='heroImageUrl'?2000:key.endsWith('Title')?300:1800,key!=='heroImageUrl');
  validatePublicImages([home.heroImageUrl]);if(home.heroImageUrl&&!safeImage(home.heroImageUrl))throw Error('Use a public HTTPS banner image URL.');record=home;
 }else if(kind==='content_plan'){
  const data=await loadData(store);if(!['Post','Event','Campaign'].includes(input.kind)||!['Idea','Draft','Scheduled','Published','Cancelled'].includes(input.status))throw Error('Choose a content kind and status.');
  const account=data.config.accounts.find(a=>a.name===input.account);if(input.account&&(!account||account.platform!==input.platform||account.brand&&account.brand!==input.brand))throw Error('Account, platform and brand must match.');if(input.brand&&!data.config.brands.includes(input.brand))throw Error('Choose a configured brand.');if(input.platform&&!['Facebook','Instagram','Workvivo'].includes(input.platform))throw Error('Choose a valid platform.');
  record={id:input.id,title:text(input.title,300,true),date:date(input.date),kind:input.kind,status:input.status,platform:text(input.platform,80),account:text(input.account,100),brand:text(input.brand,100),format:text(input.format,100),notes:text(input.notes,5000),...(input.postId?{postId:text(input.postId,100)}:{})};
 }else if(kind==='public_content'){
  const data=await loadData(store),post=data.posts.find(p=>p.id===input.postId);if(!post||!['Facebook','Instagram'].includes(post.platform)||post.status==='draft')throw Error('Choose a published Facebook or Instagram post. Workvivo remains private.');
  const imageUrl=text(input.imageUrl,2000);if(imageUrl&&!safeImage(imageUrl))throw Error('Use a public HTTPS image URL.');if(!storySections.includes(input.section)||typeof input.featured!=='boolean'||typeof input.published!=='boolean')throw Error('Choose a story section and publication status.');
  if(rows.some(r=>r.kind===kind&&r.id!==input.id&&r.payload.postId===post.id))throw Error('This post already has a public story. Edit that story instead.');
  if(input.featuredStory!==undefined&&typeof input.featuredStory!=='boolean')throw Error('Choose a featured story status.');
  const thumbnailUrl=text(input.thumbnailUrl??'',2000);if(thumbnailUrl&&!safeImage(thumbnailUrl))throw Error('Choose a valid thumbnail.');const gallery=validateGallery(input.gallery);validatePublicImages([imageUrl,thumbnailUrl,...gallery.flatMap(g=>[g.url,g.thumbnail||''])]);
  for(const k of ['showInStories','showOnProgramme'])if(input[k]!==undefined&&typeof input[k]!=='boolean')throw Error('Choose a valid page visibility.');
  record={id:input.id,postId:post.id,title:text(input.title,300,true),summary:text(input.summary,1800,true),body:text(input.body??'',20000),imageUrl,thumbnailUrl,imageAlt:text(input.imageAlt??'',500),gallery,section:input.section,featured:input.featured,...(input.featuredStory!==undefined?{featuredStory:input.featuredStory}:{}),...(input.showInStories!==undefined?{showInStories:input.showInStories}:{}),...(input.showOnProgramme!==undefined?{showOnProgramme:input.showOnProgramme}:{}),published:input.published};
 }else if(['public_event','public_partner','programme_profile'].includes(kind)){
  if(typeof input.published!=='boolean')throw Error('Choose a publication status.');
  const imageUrl=text(input.imageUrl??'',2000);if(imageUrl&&!safeImage(imageUrl))throw Error('Use a public HTTPS image URL.');
  const thumbnailUrl=text(input.thumbnailUrl??'',2000);if(thumbnailUrl&&!safeImage(thumbnailUrl))throw Error('Choose a valid thumbnail.');const gallery=validateGallery(input.gallery);validatePublicImages([imageUrl,thumbnailUrl,...gallery.flatMap(g=>[g.url,g.thumbnail||''])]);const base={id:input.id,imageUrl,published:input.published};
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
    record={...base,title:text(input.title,300,true),date:date(input.date),location:text(input.location,300,true),summary:text(input.summary,1800,true),imageAlt:text(input.imageAlt??'',500),thumbnailUrl,gallery,brand,url};
   }
  }
 }else{
  const count=(key:string)=>{const v=input[key];if(v===null||v==='')return null;if(!Number.isInteger(v)||v<0||v>1e9)throw Error('Impact figures must be non-negative whole numbers, or left unavailable.');return v;};
  if(typeof input.published!=='boolean')throw Error('Choose a publication status.');record={id:input.id,date:date(input.date),period:text(input.period,150,true),programmes:count('programmes'),activities:count('activities'),participants:input.participants===undefined?null:count('participants'),events:input.events===undefined?null:count('events'),volunteers:count('volunteers'),communityReach:count('communityReach'),source:text(input.source,1800,true),published:input.published};
 }
 await store.apply([{type:'upsert',record:{id:record.id,kind,payload:record,updatedAt:now}},audit]);return {ok:true};
}
export async function publicPortalData(store:Storage,today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Singapore'})){
 const data=await loadData(store),{publications,impacts,events,partners,programmes,home}=await workspaceRecords(store);
 const eligible=data.posts.filter(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform)&&p.date<=today);
 const legacy=publications.filter(p=>p.published).flatMap(p=>{const post=eligible.find(post=>post.id===p.postId&&post.show_on_public_site===undefined);return post?[{id:p.id,title:p.title,summary:p.summary,body:p.body||'',imageUrl:safeImage(p.imageUrl),thumbnailUrl:safeImage(p.thumbnailUrl||p.imageUrl),imageAlt:p.imageAlt||p.title,gallery:validateGallery(p.gallery),section:p.section,featured:p.featured,featuredStory:p.featuredStory??p.featured,showInStories:p.showInStories??true,showOnProgramme:p.showOnProgramme??true,brand:post.brand==='Unclassified'?'Community Care':post.brand,platform:post.platform,date:post.date,url:safeSocialLink(post.url)}]:[];});
 const direct=eligible.filter(p=>p.show_on_public_site===true&&p.public_summary?.trim()).map(p=>({id:'post-'+p.id,title:p.title,summary:p.public_summary!,body:p.public_article||'',imageUrl:safeImage(p.featured_image_url||''),thumbnailUrl:safeImage(p.thumbnail_url||p.featured_image_url||''),imageAlt:p.featured_image_alt_text||p.title,gallery:validateGallery(p.gallery_images),section:p.public_category||'Community',featured:p.show_in_community_highlights===true,featuredStory:p.show_on_home_page===true,showInStories:p.show_in_stories===true,showOnProgramme:p.show_on_programme_page===true,brand:p.brand==='Unclassified'?'Community Care':p.brand,platform:p.platform,date:p.date,url:safeSocialLink(p.url)}));
 const stories=[...legacy,...direct].sort((a,b)=>b.date.localeCompare(a.date));
 const latest=impacts.filter(i=>i.published&&i.date<=today).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const publicHome={...defaultPublicHome,...Object.fromEntries(publicHomeFields.map(key=>[key,typeof home?.[key]==='string'?home[key]:defaultPublicHome[key]])),heroImageUrl:safeImage(home?.heroImageUrl||'')};
 return {home:publicHome,stories,brands:data.config.brands.filter(b=>b!=='Unclassified'),events:events.filter(e=>e.published&&e.date>=today).map(e=>({id:e.id,title:e.title,date:e.date,location:e.location,summary:e.summary,imageUrl:safeImage(e.imageUrl),imageAlt:e.imageAlt||e.title,thumbnailUrl:safeImage(e.thumbnailUrl||e.imageUrl),gallery:validateGallery(e.gallery),brand:e.brand,url:safeImage(e.url)})).sort((a,b)=>a.date.localeCompare(b.date)),partners:partners.filter(p=>p.published).map(p=>({id:p.id,title:p.title,imageUrl:safeImage(p.imageUrl),url:safeImage(p.url)})),programmes:programmes.filter(p=>p.published).map(p=>({brand:p.brand,overview:p.overview,imageUrl:safeImage(p.imageUrl)})),impact:latest?{period:latest.period,date:latest.date,programmes:latest.programmes,activities:latest.activities,participants:latest.participants??null,events:latest.events??null,volunteers:latest.volunteers,communityReach:latest.communityReach}:null};
}
