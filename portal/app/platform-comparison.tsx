import OriginalPostLink from './original-post-link';
import {BookOpen,Camera,Trophy,Film,Star} from 'lucide-react';
import type {Post} from './model';
import type {dashboardView} from './dashboard-intelligence';
type Platform=ReturnType<typeof dashboardView>['platforms'][number];
const number=(value:number|null|undefined)=>value==null?'Unavailable':new Intl.NumberFormat('en-SG',{maximumFractionDigits:1}).format(value);
// Presentation badges compare existing metrics; no totals or averages are recomputed.
export function comparisonLeader(platforms:Platform[],metric:'posts'|'engagement'|'average'){
 const values=platforms.map(p=>({name:p.platform,value:metric==='posts'?p.stats.posts:metric==='engagement'?(p.stats.measured?p.stats.engagement:null):p.stats.average}));
 if(values.length<2||values.some(p=>p.value==null))return 'Comparison unavailable';
 const highest=Math.max(...values.map(p=>p.value!));
 if(highest===0)return 'No recorded activity';
 const leaders=values.filter(p=>p.value===highest);
 return leaders.length===values.length?'Tied: '+leaders.map(p=>p.name).join(' & '):leaders.map(p=>p.name).join(' & ');
}
export default function PlatformComparison({platforms,onOpen}:{platforms:Platform[];onOpen:(post:Post)=>void}){
 return <div className="platform-comparison-experience">
  <div className="platform-winner-grid" aria-label="Platform comparison highlights">{([{metric:'posts',title:'Most Posts'},{metric:'engagement',title:'Highest Engagement'},{metric:'average',title:'Best Avg Engagement'}] as const).map(item=><article className="platform-winner-badge" key={item.metric}><Trophy size={21} aria-hidden="true"/><div><span>{item.title}</span><strong>{comparisonLeader(platforms,item.metric)}</strong><small>{item.metric==='posts'?'Published posts':item.metric==='engagement'?'Reported engagement totals':'Per measured post'}</small></div></article>)}</div>
  <div className="platform-comparison-grid">{platforms.map(p=>{const Icon=p.platform==='Facebook'?BookOpen:Camera;return <article className={'platform-comparison-panel platform-'+p.platform.toLowerCase()} key={p.platform}>
   <header><span className="platform-comparison-icon"><Icon size={27} aria-hidden="true"/></span><div><span>PLATFORM PERFORMANCE</span><h3>{p.platform}</h3></div></header>
   <dl className="platform-comparison-metrics">{[{label:'Posts',value:p.stats.posts,note:'Published posts'},{label:p.platform==='Facebook'?'Views':'Reach',value:p.reported.total,note:p.reported.count+' records reporting '+p.metric},{label:'Engagements',value:p.stats.measured?p.stats.engagement:null,note:p.stats.measured+' measured posts'},{label:'Avg Engagement / Post',value:p.stats.average,note:'Measured posts only'}].map(metric=><div key={metric.label}><dt>{metric.label}</dt><dd>{number(metric.value)}</dd><small>{metric.note}</small></div>)}</dl>
   <div className="platform-top-performers"><article><Trophy size={20} aria-hidden="true"/><div><h4>Top Brand</h4><strong>{p.brand?.name||'Unavailable'}</strong></div></article><article><Film size={20} aria-hidden="true"/><div><h4>Top Format</h4><strong>{p.format?.name||'Unavailable'}</strong></div></article><article className="platform-top-post"><Star size={20} aria-hidden="true"/><div><h4>Top Post</h4>{p.top?<button className="text-button" onClick={()=>onOpen(p.top!)}>{p.top.title}</button>:<strong>No measured post</strong>}{p.top&&<OriginalPostLink post={p.top}/>}</div></article></div>
  </article>})}</div>
 </div>;
}
