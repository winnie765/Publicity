import {interactionReading,rateReading,summariseValues} from './post-measurements';
import type {Dataset,Post} from '../app/model';
import {metricReading} from './social-post-workflow';
import {originalPostUrl} from './original-post-url';
import {latestFollower} from '../app/follower-snapshots';

export type AnalyticalFilters={platform:string;account:string;brand:string;start:string;end:string};
export const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const dayMs=86400000;
const day=(time:number)=>new Date(time).toISOString().slice(0,10);
const components=['likes','comments','shares','saves'] as const;
const mean=(values:number[])=>summariseValues(values).average;
export {interactionReading,rateReading} from './post-measurements';
export function defaultAnalyticalFilters(data:Dataset):AnalyticalFilters{
 const dates=[...data.posts.filter(p=>['Facebook','Instagram'].includes(p.platform)&&p.status!=='draft'),...data.followers].map(p=>p.date).filter(validDate).sort();
 return {platform:'',account:'',brand:'',start:dates[0]||'',end:dates.at(-1)||''};
}
export function analyticalScope(data:Dataset,filters:AnalyticalFilters){
 const errors:string[]=[];if(!validDate(filters.start)||!validDate(filters.end))errors.push('Choose a valid start and end date.');else if(filters.start>filters.end)errors.push('Start date must be on or before end date.');
 const eligible=data.posts.filter(p=>['Facebook','Instagram'].includes(p.platform)&&p.status!=='draft');
 const match=(p:Post)=>(!filters.platform||p.platform===filters.platform)&&(!filters.account||p.account===filters.account)&&(!filters.brand||p.brand===filters.brand);
 const duration=errors.length?0:Math.round((Date.parse(filters.end)-Date.parse(filters.start))/dayMs)+1;
 const previous={start:duration?day(Date.parse(filters.start)-duration*dayMs):'',end:duration?day(Date.parse(filters.start)-dayMs):''};
 const selected=errors.length?[]:eligible.filter(p=>match(p)&&validDate(p.date)&&p.date>=filters.start&&p.date<=filters.end);
 const prior=errors.length?[]:eligible.filter(p=>match(p)&&validDate(p.date)&&p.date>=previous.start&&p.date<=previous.end);
 return {selected,prior,previous,errors,duration,excludedDrafts:data.posts.filter(p=>['Facebook','Instagram'].includes(p.platform)&&p.status==='draft'&&match(p)).length,invalidDates:eligible.filter(p=>match(p)&&!validDate(p.date)).length};
}
export function summarisePosts(posts:Post[]){
 const readings=posts.map(interactionReading),known=readings.filter(r=>r.value!==null),values=known.map(r=>r.value!);
 const metrics=(key:'views'|'reach')=>{const rows=posts.filter(p=>p.platform===(key==='views'?'Facebook':'Instagram')).map(p=>metricReading(p,key)).filter((n):n is number=>n!==null);return {value:rows.length?rows.reduce((a,b)=>a+b,0):null,n:rows.length};};
 return {posts:posts.length,measured:known.length,total:values.length?values.reduce((a,b)=>a+b,0):null,average:mean(values),coverage:posts.length?known.length/posts.length*100:null,complete:readings.filter(r=>r.complete).length,views:metrics('views'),reach:metrics('reach')};
}
export function monthKeys(start:string,end:string){
 const keys:string[]=[];if(!validDate(start)||!validDate(end)||start>end)return keys;
 let key=start.slice(0,7);while(key<=end.slice(0,7)&&keys.length<2400){keys.push(key);const date=new Date(key+'-01T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+1);key=date.toISOString().slice(0,7);}return keys;
}
export function analyticalTrend(posts:Post[],start:string,end:string){return monthKeys(start,end).map(key=>{
 const rows=posts.filter(p=>p.date.startsWith(key)),facebook=summarisePosts(rows.filter(p=>p.platform==='Facebook')),instagram=summarisePosts(rows.filter(p=>p.platform==='Instagram'));
 return {month:key,facebook:facebook.total,instagram:instagram.total,views:facebook.views.value,reach:instagram.reach.value,posts:rows.length,average:summarisePosts(rows).average,measured:facebook.measured+instagram.measured,facebookPosts:facebook.posts,facebookMeasured:facebook.measured,instagramPosts:instagram.posts,instagramMeasured:instagram.measured,viewsCount:facebook.views.n,reachCount:instagram.reach.n};
});}
export function peerPerformance(posts:Post[]){
 const buckets=new Map<string,{n:number;total:number}>();
 const key=(p:Post)=>JSON.stringify([p.platform,p.account,p.type,p.date.slice(0,7),interactionReading(p).basis]);
 for(const p of posts){const k=key(p),value=interactionReading(p).value;if(value===null)continue;const bucket=buckets.get(k)||{n:0,total:0};bucket.n++;bucket.total+=value;buckets.set(k,bucket);}
 return posts.map(post=>{const value=interactionReading(post),bucket=buckets.get(key(post)),peers=(bucket?.n||0)-(value.value===null?0:1),baseline=peers>0?(bucket!.total-(value.value??0))/peers:null,ratio=value.value!==null&&baseline!==null&&baseline>0&&peers>=3?value.value/baseline:null;
 return {post,...value,peers,baseline,ratio,review:ratio!==null&&ratio<0.75?'Below 75% of peer average':value.value===null?'Missing measurements':peers<3?'Insufficient comparable posts':baseline===0?'Zero peer baseline':'Within / above peer range',rate:rateReading(post)};});
}
export function contentPatterns(posts:Post[],dimension:'type'|'topic'){
 const names=[...new Set(posts.map(p=>p[dimension]))].filter(n=>n&&n!=='Unclassified');
 return names.map(name=>{const rows=posts.filter(p=>p[dimension]===name),stats=summarisePosts(rows);let actual=0,expected=0,n=0,peerCount=0;const peerIds=new Set<string>();
 const strata=new Map<string,Post[]>();
 for(const p of posts){if(interactionReading(p).value===null||!p[dimension]||p[dimension]==='Unclassified')continue;const key=JSON.stringify([p.platform,p.account,p.date.slice(0,7),interactionReading(p).basis,...(dimension==='topic'?[p.type]:[])]);strata.set(key,[...(strata.get(key)||[]),p]);}
 for(const group of strata.values()){const target=group.filter(p=>p[dimension]===name),others=group.filter(p=>p[dimension]!==name);if(target.length<3||others.length<3)continue;const base=mean(others.map(p=>interactionReading(p).value!))!;actual+=target.reduce((n,p)=>n+interactionReading(p).value!,0);expected+=base*target.length;n+=target.length;others.forEach(p=>peerIds.add(p.id));}peerCount=peerIds.size;
 return {name,posts:stats.posts,measured:stats.measured,average:stats.average,matched:n,peers:peerCount,ratio:expected>0?actual/expected:null};
 }).sort((a,b)=>(b.average??-1)-(a.average??-1));
}
export function frequencyAssociations(posts:Post[],start:string,end:string){
 const accounts=[...new Map(posts.map(p=>[JSON.stringify([p.platform,p.account]),{platform:p.platform,account:p.account}])).values()];
 return accounts.map(account=>{
  const pairs=monthKeys(start,end).flatMap(month=>{const last=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).toISOString().slice(0,10);if(start>month+'-01'||end<last)return [];
   const rows=posts.filter(p=>p.account===account.account&&p.platform===account.platform&&p.date.startsWith(month)),stats=summarisePosts(rows),bases=[...new Set(rows.map(p=>interactionReading(p).basis))];
   return stats.posts&&stats.measured===stats.posts&&bases.length===1?[{month,posts:stats.posts,average:stats.average!,basis:bases[0]}]:[];
  });
  // Do not pool months recorded using different interaction definitions.
  return [...new Set(pairs.map(p=>p.basis))].map(basis=>{const points=pairs.filter(p=>p.basis===basis),mx=mean(points.map(p=>p.posts)),my=mean(points.map(p=>p.average));let xy=0,xx=0,yy=0;
   for(const p of points){const x=p.posts-mx!,y=p.average-my!;xy+=x*y;xx+=x*x;yy+=y*y;}
   return {...account,basis,n:points.length,correlation:points.length>=4&&xx>0&&yy>0?xy/Math.sqrt(xx*yy):null};
  });
 }).flat();
}
export function accountComparisons(data:Dataset,filters:AnalyticalFilters,current:Post[],previous:Post[]){
 const accounts=[...data.config.accounts,...current.map(p=>({name:p.account,platform:p.platform,brand:p.brand})),...previous.map(p=>({name:p.account,platform:p.platform,brand:p.brand}))];
 return [...new Map(accounts.filter(a=>['Facebook','Instagram'].includes(a.platform)&&(!filters.platform||a.platform===filters.platform)&&(!filters.account||a.name===filters.account)&&(!filters.brand||a.brand===filters.brand)).map(a=>[a.platform+'|'+a.name,a])).values()].map(a=>{
 const now=current.filter(p=>p.account===a.name&&p.platform===a.platform),before=previous.filter(p=>p.account===a.name&&p.platform===a.platform),c=summarisePosts(now),p=summarisePosts(before);
 const bases=(rows:Post[])=>[...new Set(rows.filter(p=>interactionReading(p).value!==null).map(p=>interactionReading(p).basis))].sort().join('|');
 const comparable=c.measured>0&&p.measured>0&&c.measured===c.posts&&p.measured===p.posts&&bases(now)===bases(before),difference=comparable?c.total!-p.total!:null;
 return {...a,current:c,previous:p,difference,percent:difference!==null&&p.total!>0?difference/p.total!*100:null,attention:!c.posts&&p.posts?'No current-period posts recorded — review':c.posts&&!c.measured?'Missing measurements':c.measured<c.posts?'Incomplete coverage':difference!==null&&difference<0?'Recorded decline — review':'No measured decline established'};
 });
}
export function audienceGrowth(data:Dataset,filters:AnalyticalFilters){
 const accounts=[...data.config.accounts,...(data.config.followerAccounts||[]),...data.followers.map(f=>({name:f.account,platform:f.platform||data.config.accounts.find(a=>a.name===f.account)?.platform||'',brand:f.accountBrand||data.config.accounts.find(a=>a.name===f.account)?.brand}))];
 return [...new Map(accounts.filter(a=>['Facebook','Instagram'].includes(a.platform)&&(!filters.platform||a.platform===filters.platform)&&(!filters.account||a.name===filters.account)&&(!filters.brand||a.brand===filters.brand)).map(a=>[a.platform+'|'+a.name,a])).values()].map(a=>{
 const raw=data.followers.filter(f=>f.account===a.name&&(!f.platform||f.platform===a.platform)&&validDate(f.date)&&Number.isFinite(f.followers)&&f.followers>=0),verified=raw.filter(f=>!f.dateInferred),eligible=verified.filter(f=>f.date<=filters.end),inPeriod=eligible.filter(f=>f.date>=filters.start),latestDate=inPeriod.map(f=>f.date).sort().at(-1),latest=latestDate?latestFollower(inPeriod.filter(f=>f.date===latestDate)):undefined,prior=latestFollower(verified.filter(f=>f.date<filters.start));
 const rows=monthKeys(filters.start,filters.end).map(month=>{const group=inPeriod.filter(f=>f.date.startsWith(month)),date=group.map(f=>f.date).sort().at(-1),snapshot=date?latestFollower(group.filter(f=>f.date===date)):undefined;return {month,followers:snapshot?.followers??null,date:snapshot?.date||'',growth:null as number|null};});
 for(let i=1;i<rows.length;i++)if(rows[i].followers!==null&&rows[i-1].followers!==null)rows[i].growth=rows[i].followers!-rows[i-1].followers!;
 const changes=rows.filter(r=>r.growth!==null),avg=mean(changes.map(r=>r.growth!)),variance=avg!==null&&changes.length>=3?mean(changes.map(r=>(r.growth!-avg)**2)):null,sd=variance!==null?Math.sqrt(variance):null;
 return {...a,latest,prior,change:latest&&prior?latest.followers-prior.followers:null,rows,excludedInferred:raw.filter(f=>f.dateInferred&&f.date>=filters.start&&f.date<=filters.end).length,conflicts:[...new Set(inPeriod.map(f=>f.date))].filter(date=>!latestFollower(inPeriod.filter(f=>f.date===date))).length,unusual:sd&&changes.length>=3?changes.filter(r=>Math.abs(r.growth!-avg!)>2*sd):[]};
 });
}
export function dataQuality(posts:Post[],asOf:string){
 return posts.map(post=>{const core=post.platform==='Facebook'?components.slice(0,3):components,missing=core.filter(k=>metricReading(post,k)===null),updated=post.metrics_updated_at&&Number.isFinite(Date.parse(post.metrics_updated_at))?post.metrics_updated_at:null,age=updated&&validDate(asOf)?Math.floor((Date.parse(asOf+'T23:59:59Z')-Date.parse(updated))/dayMs):null;
 const details=[...(!post.title.trim()?['Post title']:[]),...(!post.account?['Account']:[]),...(!post.brand||post.brand==='Unclassified'?['Brand']:[]),...(!post.type||post.type==='Unclassified'?['Format']:[]),...(!originalPostUrl(post)?['Original URL (optional)']:[])];
 return {post,missing,details,updated,age,needsUpdate:missing.length>0||age===null||age>30,imported:post.record_origin==='excel_import'||!!post.importSheet&&post.importSheet!=='draft'};
 });
}
export function csvText(rows:Record<string,unknown>[]){const keys=[...new Set(rows.flatMap(row=>Object.keys(row)))];const escape=(value:unknown)=>{let text=value==null?'':String(value);if(/^[\s]*[=+@-]/.test(text)&&typeof value!=='number')text="'"+text;return '"'+text.replaceAll('"','""')+'"';};return '\uFEFF'+[keys,...rows.map(row=>keys.map(key=>row[key]))].map(row=>row.map(escape).join(',')).join('\r\n');}
