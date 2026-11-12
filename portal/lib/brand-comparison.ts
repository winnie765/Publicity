import type {Post} from '../app/model';
import {externalPosts} from '../app/analytics-overview';
import {change} from '../app/dashboard-intelligence';
import {monthKeys,summarisePosts} from './analytical-dashboards';
import {interactionReading} from './post-measurements';

/** One source for brand summaries, detailed cohorts and monthly management trends. */
export function brandComparison(selected:Post[],previous:Post[],start:string,end:string){
 const posts=externalPosts(selected),prior=externalPosts(previous);
 const names=[...new Set([...posts,...prior].map(p=>p.brand))].filter(Boolean).sort();
 const brands=[...new Set(['GLOW','SEEN',...names])].map(name=>{
  const rows=posts.filter(p=>p.brand===name),old=prior.filter(p=>p.brand===name),current=summarisePosts(rows),baseline=summarisePosts(old);
  return {name,current,previous:baseline,changes:{posts:change(current.posts,baseline.posts),total:change(current.total,baseline.total),average:change(current.average,baseline.average)}};
 });
 const cohorts=(keys:(p:Post)=>string[])=>{
  const groups=new Map<string,{dimensions:string[];rows:Post[]}>();
  for(const p of posts){const dimensions=keys(p),key=JSON.stringify(dimensions);const group=groups.get(key)||{dimensions,rows:[]};group.rows.push(p);groups.set(key,group);}
  return [...groups.values()].map(g=>({...g,stats:summarisePosts(g.rows)})).sort((a,b)=>a.dimensions.join().localeCompare(b.dimensions.join()));
 };
 const matched=cohorts(p=>[p.platform,p.type||'Unclassified',interactionReading(p).basis]);
 const platforms=['Facebook','Instagram'].map(platform=>{
  const groups=brands.filter(b=>['GLOW','SEEN'].includes(b.name)).map(b=>({name:b.name,...summarisePosts(posts.filter(p=>p.platform===platform&&p.brand===b.name))}));
  const comparisons=matched.filter(g=>g.dimensions[0]===platform).flatMap(g=>{
   const glow=summarisePosts(g.rows.filter(p=>p.brand==='GLOW')),seen=summarisePosts(g.rows.filter(p=>p.brand==='SEEN'));
   if(glow.measured<3||seen.measured<3||glow.average===null||seen.average===null)return [];
   return [{format:g.dimensions[1],basis:g.dimensions[2],glow,seen}];
  });
  const trend=monthKeys(start,end).map(month=>{const summary=(name:string)=>summarisePosts(posts.filter(p=>p.platform===platform&&p.brand===name&&p.date.startsWith(month))),glow=summary('GLOW'),seen=summary('SEEN');return {month,GLOW:glow.average,SEEN:seen.average,GLOWMeasured:glow.measured,GLOWPosts:glow.posts,SEENMeasured:seen.measured,SEENPosts:seen.posts};});
  return {platform,groups,comparisons,trend};
 });
 const format=(n:number)=>new Intl.NumberFormat('en-SG',{maximumFractionDigits:1}).format(n);
 const facts=platforms.flatMap(p=>p.comparisons.filter(c=>c.glow.average!==c.seen.average).sort((a,b)=>Math.abs(b.glow.average!-b.seen.average!)-Math.abs(a.glow.average!-a.seen.average!)).slice(0,1).map(c=>({title:p.platform+' / '+c.format,text:'GLOW averaged '+format(c.glow.average!)+' recorded interactions across '+c.glow.measured+' measured posts; SEEN averaged '+format(c.seen.average!)+' across '+c.seen.measured+'. Same platform, format and measurement basis ('+c.basis+'). Account audiences, timing and promotion may differ.',action:'Review these '+p.platform+' '+c.format+' posts, then test one content change within each account. Compare the next matched group at the same measurement age.'})));
 const glow=brands.find(b=>b.name==='GLOW')!,seen=brands.find(b=>b.name==='SEEN')!;
 const volume=glow.current.posts&&seen.current.posts?'GLOW published '+glow.current.posts+' posts and SEEN '+seen.current.posts+'. '+(glow.current.total!==null&&seen.current.total!==null?'Recorded interactions: GLOW '+format(glow.current.total)+'; SEEN '+format(seen.current.total)+'. ':'')+'Totals reflect posting volume and platform mix; use within-platform comparisons before ranking performance.':'Both brands need recorded posts in the selected scope for a two-brand comparison. Account and brand filters can intentionally exclude one side.';
 return {brands,platforms,volume,facts,formats:matched,monthly:cohorts(p=>[p.platform,p.brand,p.date.slice(0,7)]),topics:cohorts(p=>[p.platform,p.brand,p.topic||'Unclassified']),locations:cohorts(p=>[p.platform,p.brand,p.location||'No Location']),accounts:cohorts(p=>[p.platform,p.brand,p.account])};
}
