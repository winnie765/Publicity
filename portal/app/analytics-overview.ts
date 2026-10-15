import {average,engagement,groups,insights,sum,type Post} from './model';
import {observed,typeName} from './top-hits';
export const externalPosts=(posts:Post[])=>posts.filter(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform));
export const measuredPosts=(posts:Post[])=>externalPosts(posts).filter(observed);
export function overview(posts:Post[]){const published=externalPosts(posts),measured=published.filter(observed);return {posts:published.length,measured:measured.length,engagement:sum(measured,engagement),average:measured.length?average(measured):null};}
export function accountPerformance(posts:Post[],accounts:{name:string;platform:string;brand?:string}[]){
 return accounts.filter(a=>['Facebook','Instagram'].includes(a.platform)).map(account=>{
  const rows=externalPosts(posts).filter(p=>p.account===account.name&&p.platform===account.platform);
  return {...account,...overview(rows)};
 });
}
export function recordedMetric(posts:Post[],key:'views'|'reach'|'likes'|'comments'|'shares'){const rows=posts.filter(p=>(!p.reportedMetrics||p.reportedMetrics.includes(key))&&typeof p[key]==='number');return {count:rows.length,total:rows.length?rows.reduce((n,p)=>n+(p[key]||0),0):null};}
export function formatGroups(posts:Post[]){return groups(measuredPosts(posts).map(p=>({...p,type:typeName(p.type)})),'type');}
export function monthlyEngagement(posts:Post[],platform='Combined'){
 const published=externalPosts(posts),dates=published.map(p=>p.date.slice(0,7)).sort(),months:string[]=[];
 if(dates.length){let key=dates[0];for(let i=0;key<=dates.at(-1)!&&i<2400;i++){months.push(key);const date=new Date(key+'-01T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+1);key=date.toISOString().slice(0,7);}}
 return months.map(key=>{const rows=published.filter(p=>p.date.startsWith(key)&&(platform==='Combined'||p.platform===platform)),measured=rows.filter(observed);return {key,month:new Date(key+'-02T12:00:00Z').toLocaleDateString('en-SG',{month:'short',year:'numeric'}),engagement:measured.length?sum(measured,engagement):undefined,posts:rows.length};});
}
export function performanceFindings(posts:Post[]){
 const measured=measuredPosts(posts),result:{title:string;detail:string;action:string}[]=[];
 for(const insight of insights(measured).filter(i=>i.lift>0).slice(0,2))result.push({title:insight.title,detail:insight.detail,action:insight.action});
 const formats=formatGroups(measured).filter(g=>g.name!=='Unclassified'&&g.posts>=3);if(formats[0])result.push({title:formats[0].name+' leads average engagement',detail:formats[0].posts+' recorded posts average '+formats[0].average.toFixed(1)+' engagements. This is a descriptive ranking; timing, audience and promotion can affect results.',action:'Test another '+formats[0].name+' series with similar timing and promotion, then compare engagement per post.'});
 const latestMonth=measured.map(p=>p.date.slice(0,7)).sort().at(-1),recent=measured.filter(p=>p.date.startsWith(latestMonth||'')),brands=groups(recent,'brand').filter(g=>g.name!=='Unclassified');
 if(brands.length>=2)result.push({title:brands[0].name+' leads in '+new Date(latestMonth+'-02T12:00:00Z').toLocaleDateString('en-SG',{month:'long',year:'numeric'}),detail:brands[0].average.toFixed(1)+' average engagements across '+brands[0].posts+' posts, versus '+brands[1].average.toFixed(1)+' across '+brands[1].posts+' '+brands[1].name+' posts. Platform and content mix may differ.',action:'Review the leading posts in platform analytics and test their recurring characteristics.'});
 if(!result.length)result.push({title:'Build evidence for your next content decision',detail:measured.length+' posts have reported engagement. Repeated formats and feature annotations are needed for supported comparisons.',action:'Annotate content features and publish comparable content before drawing a strategy conclusion.'});
 return result;
}
