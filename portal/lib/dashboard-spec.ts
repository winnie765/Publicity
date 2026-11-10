import {z} from 'zod';
import type {Dataset,Post} from '../app/model';
import {withMasterRegistry} from './master-relationships';
import {metricReading} from './social-post-workflow';
import {interactionReading,monthKeys,rateReading,validDate} from './analytical-dashboards';
import {latestFollower} from '../app/follower-snapshots';
export const chartTypes=['line','bar','kpi','table'] as const;
export const dimensions=['month','platform','account','brand','format','category','post'] as const;
export const aggregations=['sum','average','count','latest','ratio'] as const;
export const dashboardMetrics={
 interactions:{label:'Recorded Interactions',source:'posts',aggregations:['sum','average'],formula:'Supplied engagement total; otherwise sum of explicitly recorded Likes / Reactions, Comments, Shares and Saves. Averages divide by measured posts only.'},
 facebook_views:{label:'Facebook Views',source:'posts',aggregations:['sum','average'],platform:'Facebook',formula:'Recorded Facebook Views; average = sum of recorded Views ÷ number of posts with Views.'},
 instagram_reach:{label:'Instagram Post Reach',source:'posts',aggregations:['sum','average'],platform:'Instagram',formula:'Recorded Instagram post-level Reach. Summing posts does not give unique people across posts.'},
 instagram_views:{label:'Instagram Views',source:'posts',aggregations:['sum','average'],platform:'Instagram',formula:'Recorded Instagram Views, kept separate from Facebook Views and Instagram Reach.'},
 likes:{label:'Likes / Reactions',source:'posts',aggregations:['sum','average'],formula:'Explicitly recorded Likes / Reactions; unavailable readings are excluded.'},
 comments:{label:'Comments',source:'posts',aggregations:['sum','average'],formula:'Explicitly recorded Comments; unavailable readings are excluded.'},
 shares:{label:'Shares',source:'posts',aggregations:['sum','average'],formula:'Explicitly recorded Shares; unavailable readings are excluded.'},
 saves:{label:'Saves',source:'posts',aggregations:['sum','average'],formula:'Explicitly recorded Saves; unavailable readings are excluded.'},
 post_count:{label:'Recorded Published Posts',source:'posts',aggregations:['count'],formula:'Count of non-draft Facebook / Instagram post records matching the filters. No records means zero recorded posts, not proof of no activity.'},
 facebook_interaction_rate:{label:'Facebook Interaction Rate (%)',source:'posts',aggregations:['ratio'],platform:'Facebook',formula:'Sum of (Likes / Reactions + Comments + Shares + Saves) ÷ sum of Facebook Views × 100, using only posts with all four components and positive Views. Not comparable with an Instagram Reach-based rate.'},
 instagram_interaction_rate:{label:'Instagram Interaction Rate (%)',source:'posts',aggregations:['ratio'],platform:'Instagram',formula:'Sum of (Likes + Comments + Shares + Saves) ÷ sum of Instagram Reach × 100, using only posts with all four components and positive Reach. Not comparable with a Facebook Views-based rate.'},
 followers:{label:'Recorded Followers',source:'followers',aggregations:['latest'],formula:'Latest unambiguous, non-inferred recorded snapshot per account in the selected period/month. Accounts are never summed.'},
 follower_change:{label:'Monthly Follower Change',source:'followers',aggregations:['sum'],formula:'Latest recorded count in a month − latest count in the preceding calendar month, within the same account. Missing/conflicting/inferred snapshots are gaps. Multi-month totals require every selected monthly comparison.'}
} as const;
export type DashboardMetric=keyof typeof dashboardMetrics;
const text=(max:number)=>z.string().trim().min(1).max(max).refine(v=>!/<\/?(?:script|iframe)|javascript:|\beval\s*\(|\bDROP\s+TABLE\b/i.test(v),'Use plain dashboard text, not executable content.');
const ids=z.array(z.string().min(1).max(1200)).max(20).refine(v=>new Set(v).size===v.length,'Remove duplicate filter values.');
export const dashboardFilterSchema=z.object({platforms:z.array(z.enum(['Facebook','Instagram'])).max(2),accounts:ids,brands:ids,formats:ids,categories:ids,start:z.string().refine(validDate,'Choose a valid start date.'),end:z.string().refine(validDate,'Choose a valid end date.')}).strict();
const chartSchema=z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),title:text(120),description:z.string().max(600),type:z.enum(chartTypes),source:z.enum(['posts','followers']),metric:z.enum(Object.keys(dashboardMetrics) as [DashboardMetric,...DashboardMetric[]]),aggregation:z.enum(aggregations),dimension:z.enum(dimensions),series:z.enum(['none','platform','account','brand','format','category']),filters:dashboardFilterSchema,limit:z.number().int().min(1).max(100),order:z.enum(['ascending','descending'])}).strict();
export const dashboardSchema=z.object({version:z.literal(1),title:text(120),description:z.string().max(1000),charts:z.array(chartSchema).min(1).max(12)}).strict();
export type DashboardSpec=z.infer<typeof dashboardSchema>;
export type ChartSpec=DashboardSpec['charts'][number];
export type CatalogEntry={id:string;name:string;platform?:string;brand?:string};
export type DashboardCatalog={accounts:CatalogEntry[];brands:CatalogEntry[];formats:CatalogEntry[];categories:CatalogEntry[];start:string;end:string;availability:Record<DashboardMetric,boolean>};
export function dashboardCatalog(data:Dataset):DashboardCatalog{
 const registry=withMasterRegistry(data.config).masterRegistry!;
 const values=(module:'accounts'|'brands'|'types'|'topics',labels:string[])=>[...new Set(labels.filter(Boolean))].sort().map(name=>({id:registry[module].find(e=>e.name===name||e.aliases.includes(name))?.id||'legacy-'+module+'-'+encodeURIComponent(name),name}));
 const accounts=values('accounts',[...data.config.accounts.map(a=>a.name),...(data.config.followerAccounts||[]).map(a=>a.name),...data.posts.map(p=>p.account),...data.followers.map(f=>f.account)]).map(entry=>{const a=[...data.config.accounts,...(data.config.followerAccounts||[])].find(a=>a.name===entry.name),p=data.posts.find(p=>p.account===entry.name),f=data.followers.find(f=>f.account===entry.name);return {...entry,platform:a?.platform||p?.platform||f?.platform,brand:a?.brand||p?.brand||f?.accountBrand};}).filter(a=>['Facebook','Instagram'].includes(a.platform||''));
 const dates=[...data.posts.filter(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform)),...data.followers].map(p=>p.date).filter(validDate).sort();
 const availability=Object.fromEntries(Object.keys(dashboardMetrics).map(metric=>[metric,metric==='followers'||metric==='follower_change'?data.followers.some(f=>!f.dateInferred):data.posts.some(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform)&&postValue(p,metric as DashboardMetric)!==null)])) as Record<DashboardMetric,boolean>;
 return {accounts,brands:values('brands',[...data.config.brands,...data.posts.map(p=>p.brand)]),formats:values('types',[...data.config.types,...data.posts.map(p=>p.type)]),categories:values('topics',[...data.config.topics,...data.posts.map(p=>p.topic)]),start:dates[0]||'',end:dates.at(-1)||'',availability};
}
export function validateDashboard(value:unknown,catalog:DashboardCatalog):DashboardSpec{
 const parsed=dashboardSchema.safeParse(value);if(!parsed.success)throw Error(parsed.error.issues.slice(0,3).map(i=>i.path.join('.')+': '+i.message).join(' '));
 const dashboard=parsed.data;if(new Set(dashboard.charts.map(c=>c.id)).size!==dashboard.charts.length)throw Error('Each chart needs a different identifier.');
 for(const c of dashboard.charts){
  const rule=dashboardMetrics[c.metric];if(rule.source!==c.source||!(rule.aggregations as readonly string[]).includes(c.aggregation))throw Error('Choose an approved source and aggregation for '+rule.label+'.');
  if(c.filters.start<'1900-01-01'||c.filters.end>'2100-12-31'||c.filters.start>c.filters.end||monthKeys(c.filters.start,c.filters.end).length>120)throw Error('Choose an ordered date range covering at most 120 months.');
  for(const key of ['accounts','brands','formats','categories'] as const)if(c.filters[key].some(id=>!catalog[key].some(entry=>entry.id===id)))throw Error('A selected '+key+' value is no longer available. Edit that filter; no source record was changed.');
  if(new Set(c.filters.platforms).size!==c.filters.platforms.length)throw Error('Remove duplicate platforms.');
  if('platform' in rule){if(c.filters.platforms.some(p=>p!==rule.platform))throw Error(rule.label+' cannot be combined with another platform.');c.filters.platforms=[rule.platform];}
  if(c.filters.accounts.some(id=>{const a=catalog.accounts.find(a=>a.id===id)!;return c.filters.platforms.length&&!c.filters.platforms.includes(a.platform as 'Facebook'|'Instagram');}))throw Error('The selected account does not match the chart platform.');
  if(c.type==='line'&&c.dimension!=='month')throw Error('Line charts require the monthly date dimension.');
  if(c.type==='kpi'&&c.series!=='none')throw Error('A KPI is one result. Use a chart or table for multiple series.');
  if(c.dimension==='post'&&c.series!=='none')throw Error('Post rankings use one row per post, without stacked series.');
  if(c.source==='followers'){
   if(c.filters.formats.length||c.filters.categories.length)throw Error('Follower snapshots do not have content formats or categories.');
   if(!['month','account'].includes(c.dimension)||!['none','account'].includes(c.series))throw Error('Follower history must stay separate by account. Use Month with Account series, or Account rows.');
   const selected=catalog.accounts.filter(a=>(!c.filters.accounts.length||c.filters.accounts.includes(a.id))&&(!c.filters.platforms.length||c.filters.platforms.includes(a.platform as 'Facebook'|'Instagram'))&&(!c.filters.brands.length||c.filters.brands.some(id=>catalog.brands.find(b=>b.id===id)?.name===a.brand)));
   if((c.type==='kpi'||c.dimension==='month'&&c.series==='none')&&selected.length!==1)throw Error('Select one account for a follower KPI or single-series history. Otherwise choose Account series.');
  }
 }
 return dashboard;
}
export function emptyChart(catalog:DashboardCatalog):ChartSpec{
 const fallback=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Singapore'});return {id:'chart-'+crypto.randomUUID(),title:'Recorded Interactions by Month',description:'Published Facebook and Instagram records; missing measurements remain unavailable.',type:'line',source:'posts',metric:'interactions',aggregation:'sum',dimension:'month',series:'platform',filters:{platforms:[],accounts:[],brands:[],formats:[],categories:[],start:catalog.start||fallback,end:catalog.end||fallback},limit:100,order:'ascending'};
}
function postValue(post:Post,metric:DashboardMetric):number|null{
 if(metric==='post_count')return 1;
 if(metric==='interactions')return interactionReading(post).value;
 if(metric==='facebook_views')return post.platform==='Facebook'?metricReading(post,'views'):null;
 if(metric==='instagram_views')return post.platform==='Instagram'?metricReading(post,'views'):null;
 if(metric==='instagram_reach')return post.platform==='Instagram'?metricReading(post,'reach'):null;
 if(metric==='facebook_interaction_rate'||metric==='instagram_interaction_rate')return post.platform===(metric==='facebook_interaction_rate'?'Facebook':'Instagram')?rateReading(post).value:null;
 if(['likes','comments','shares','saves'].includes(metric))return metricReading(post,metric as 'likes'|'comments'|'shares'|'saves');return null;
}
export type DashboardPoint={key:string;label:string;series:string;value:number|null;n:number;total:number;postIds:string[];dates:string[]};
export type ChartResult={spec:ChartSpec;points:DashboardPoint[];formula:string;sampleUnit:string;sourceRecords:number;warnings:string[];explanation:string;generatedAt:string};
const fmt=(n:number)=>new Intl.NumberFormat('en-SG',{maximumFractionDigits:2}).format(n);
export function executeChart(input:ChartSpec,data:Dataset,catalog=dashboardCatalog(data)):ChartResult{
 const spec=validateDashboard({version:1,title:'Calculation',description:'',charts:[input]},catalog).charts[0],f=spec.filters,names=(key:'accounts'|'brands'|'formats'|'categories')=>f[key].map(id=>catalog[key].find(e=>e.id===id)!.name),accounts=names('accounts'),brands=names('brands'),formats=names('formats'),categories=names('categories');
 const warnings=['Calculated from recorded data, not AI-generated figures. Missing readings are never filled with zero.'],points:DashboardPoint[]=[];let sourceRecords=0;
 if(spec.source==='posts'){
  const posts=data.posts.filter(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform)&&validDate(p.date)&&p.date>=f.start&&p.date<=f.end&&(!f.platforms.length||f.platforms.includes(p.platform as 'Facebook'|'Instagram'))&&(!accounts.length||accounts.includes(p.account))&&(!brands.length||brands.includes(p.brand))&&(!formats.length||formats.includes(p.type))&&(!categories.length||categories.includes(p.topic)));sourceRecords=posts.length;
  const label=(p:Post,d:string)=>d==='month'?p.date.slice(0,7):d==='account'?p.platform+' / '+p.account:d==='post'?p.id:d==='format'?p.type:d==='category'?p.topic:d==='platform'?p.platform:p.brand;
  const groups=new Map<string,{key:string;series:string;rows:Post[]}>();for(const p of posts){const key=spec.type==='kpi'?'Selected records':label(p,spec.dimension),series=spec.series==='none'?'Recorded result':label(p,spec.series),id=JSON.stringify([key,series]);const g=groups.get(id)||{key,series,rows:[]};g.rows.push(p);groups.set(id,g);}
  const series=[...new Set([...groups.values()].map(g=>g.series))];if(series.length>8)throw Error('Select at most eight series per chart using account, brand or platform filters.');if(!series.length)series.push('Recorded result');
  if(spec.dimension==='month'&&spec.type!=='kpi')for(const key of monthKeys(f.start,f.end))for(const name of series){const id=JSON.stringify([key,name]);if(!groups.has(id))groups.set(id,{key,series:name,rows:[]});}
  if(spec.type==='kpi'&&!groups.size)groups.set('empty',{key:'Selected records',series:'Recorded result',rows:[]});
  for(const g of groups.values()){
   const known=g.rows.map(p=>({post:p,value:postValue(p,spec.metric)})).filter((r):r is {post:Post;value:number}=>r.value!==null);let value:number|null=known.length?known.reduce((n,r)=>n+r.value,0):null;
   if(spec.aggregation==='count')value=g.rows.length;
   if(spec.aggregation==='average'&&value!==null)value/=known.length;
   if(spec.aggregation==='ratio'){const pairs=known.map(r=>rateReading(r.post));value=pairs.length?pairs.reduce((sum,r)=>sum+r.numerator!,0)/pairs.reduce((sum,r)=>sum+r.exposure!,0)*100:null;}
   points.push({key:g.key,label:spec.dimension==='post'?g.rows[0]?.title||g.key:g.key,series:g.series,value,n:known.length,total:g.rows.length,postIds:g.rows.slice(0,50).map(p=>p.id),dates:[...new Set(g.rows.map(p=>p.date))].sort()});
  }
  if([...groups.values()].some(g=>g.rows.length>50))warnings.push('Source links show the first fifty posts per group. All eligible records are included in the calculations.');
  if(spec.metric==='interactions'&&new Set(posts.filter(p=>interactionReading(p).value!==null).map(p=>interactionReading(p).basis)).size>1)warnings.push('Interaction measurement bases differ between posts. Totals are descriptive recorded activity; raw rankings are not matched-peer comparisons.');
 }else{
  const selected=catalog.accounts.filter(a=>(!accounts.length||accounts.includes(a.name))&&(!f.platforms.length||f.platforms.includes(a.platform as 'Facebook'|'Instagram'))&&(!brands.length||brands.includes(a.brand||'')));
  const raw=data.followers.filter(r=>selected.some(a=>a.name===r.account&&(!r.platform||r.platform===a.platform))&&validDate(r.date)&&!r.dateInferred&&Number.isFinite(r.followers)&&r.followers>=0);sourceRecords=raw.filter(r=>r.date>=f.start&&r.date<=f.end).length;
  const months=monthKeys(f.start,f.end),previousMonth=(key:string)=>new Date(Date.UTC(Number(key.slice(0,4)),Number(key.slice(5,7))-2,1)).toISOString().slice(0,7);
  if(spec.dimension==='month'&&selected.length>8)throw Error('Select at most eight follower accounts per monthly chart.');
  for(const a of selected){
   const source=raw.filter(r=>r.account===a.name&&(!r.platform||r.platform===a.platform)),label=a.platform+' / '+a.name;
   const snapshot=(month:string)=>latestFollower(source.filter(r=>r.date.startsWith(month)&&r.date<=f.end&&(month<f.start.slice(0,7)||r.date>=f.start)));
   const monthly=months.map(month=>{const current=snapshot(month),prior=snapshot(previousMonth(month)),value=spec.metric==='followers'?current?.followers??null:current&&prior?current.followers-prior.followers:null;return {key:month,label:month,series:spec.series==='account'?label:'Recorded result',value,n:value===null?0:1,total:1,postIds:[],dates:[...(current?[current.date]:[]),...(spec.metric==='follower_change'&&prior?[prior.date]:[])]};});
   if(spec.type==='kpi'||spec.dimension==='account'){
    const latest=latestFollower(source.filter(r=>r.date>=f.start&&r.date<=f.end)),valid=monthly.filter(r=>r.value!==null),value=spec.metric==='followers'?latest?.followers??null:monthly.length&&valid.length===monthly.length?valid.reduce((n,r)=>n+r.value!,0):null;
    points.push({key:label,label,series:'Recorded result',value,n:spec.metric==='followers'?(latest?1:0):valid.length,total:spec.metric==='followers'?1:monthly.length,postIds:[],dates:spec.metric==='followers'?(latest?[latest.date]:[]):monthly.flatMap(r=>r.dates)});
   }else points.push(...monthly);
  }
  warnings.push('Accounts remain separate; audience counts can overlap. Only non-inferred, unambiguous snapshots are used. Gaps are not interpolated.');if(spec.metric==='follower_change')warnings.push('Preceding-calendar-month snapshots may be used as baselines outside the selected period. Multi-month totals are unavailable when any monthly comparison is missing.');
 }
 points.sort((a,b)=>spec.dimension==='month'?a.key.localeCompare(b.key)||a.series.localeCompare(b.series):a.value===null?(b.value===null?a.label.localeCompare(b.label):1):b.value===null?-1:(spec.order==='descending'?b.value-a.value:a.value-b.value)||a.label.localeCompare(b.label));
 const output=spec.dimension==='month'?points:points.slice(0,spec.limit),measured=output.filter(p=>p.value!==null),leading=[...measured].sort((a,b)=>b.value!-a.value!)[0];
 if(points.length>output.length)warnings.push('Showing '+output.length+' of '+points.length+' result groups; the displayed limit is saved in the chart.');
 if(!measured.length)warnings.push('No recorded measurements are available for these filters. The approved metric exists, but no figures were fabricated.');
 const explanation=!measured.length?'No measured result is available. Check the selected dates, accounts and source measurements.':spec.type==='kpi'?fmt(measured[0].value!)+' '+dashboardMetrics[spec.metric].label+' from '+measured[0].n+' / '+measured[0].total+' measured '+(spec.source==='posts'?'posts':'account-month observations')+'.':measured.length+' measured result groups. Highest recorded displayed value: '+fmt(leading.value!)+' for '+leading.label+(spec.series!=='none'?' / '+leading.series:'')+'. This is descriptive, not evidence of causation.';
 return {spec,points:output,formula:dashboardMetrics[spec.metric].formula,sampleUnit:spec.source==='posts'?'posts':'account-month observations',sourceRecords,warnings,explanation,generatedAt:new Date().toISOString()};
}
