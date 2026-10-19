import {Trophy,Film,TrendingUp,Info} from 'lucide-react';

// Extract display values from existing findings; no analytics are recalculated.
export function presentGrowthAssociation(finding:string,selection=''){
 const relationship=finding.match(/Pearson r = (-?\d+(?:\.\d+)?)/);
 if(relationship)return {title:'Growth Relationship',metric:'r = '+relationship[1],caption:'Observed relationship',kind:'growth',Icon:TrendingUp,meaning:'Read content activity alongside audience growth to identify patterns worth investigating. Association alone does not establish what caused growth.'};
 const multiple=finding.match(/^Months with multiple .+ Top Hits average (-?\d+(?:\.\d+)?) new followers/);
 if(multiple)return {title:'Top Hit Impact',metric:multiple[1],caption:'Average monthly follower change',kind:'top-hits',Icon:Trophy,meaning:'Compare these periods with other measured months when reviewing content plans. The average is a cohort result, not followers attributed to Top Hits.'};
 const format=finding.match(/^Months containing (.+) Top Hits average (-?\d+(?:\.\d+)?) new followers/);
 if(format){const name=selection&&format[1].endsWith(' '+selection)?format[1].slice(0,-selection.length-1):'';return {title:name?name+' Performance':'Content Impact',metric:format[2],caption:'Average monthly follower change',kind:'opportunity',Icon:Film,meaning:'Use this comparison to guide a closer review of content themes and formats. Formats can coexist, so this does not isolate the effect of one format.'};}
 return {title:'Growth Evidence Coverage',metric:null,caption:'Available evidence',kind:'content',Icon:Info,meaning:'Coverage determines whether a relationship can be assessed. Missing evidence is not evidence of no impact.'};
}
export default function FollowerImpactCards({findings,selection}:{findings:string[];selection:string}){
 return <div className="follower-impact-grid">{findings.map((finding,index)=>{const item=presentGrowthAssociation(finding,selection),Icon=item.Icon;return <article className={'strategic-insight-card follower-impact-card insight-'+item.kind} key={index}>
  <header><span className="follower-evidence-icon"><Icon size={28} aria-hidden="true"/></span><h4>{item.title}</h4></header>
  {item.metric!==null&&<div className="follower-impact-kpi"><strong>{item.metric}</strong><span>{item.caption}</span></div>}
  <div className="follower-impact-finding"><h5>Key Finding</h5><p>{finding}</p></div>
  <div className="follower-impact-meaning"><h5>Why It Matters</h5><p>{item.meaning}</p></div>
 </article>})}</div>;
}
