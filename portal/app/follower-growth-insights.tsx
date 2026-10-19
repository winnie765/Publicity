import {TrendingUp, Activity, Rocket, Database} from 'lucide-react';

// Presentation only: values come verbatim from the existing calculated findings.
export function presentFollowerFinding(finding:string){
 const signed=(value:string)=>Number(value.replace(/%$/,''))>0?'+'+value:value;
 const summary=finding.match(/ followers changed by (-?\d+) \((percentage unavailable|-?\d+(?:\.\d+)?%)\) over six calendar months\.$/);
 if(summary)return {title:'Growth Summary',metric:summary[2]==='percentage unavailable'?signed(summary[1]):signed(summary[2]),caption:summary[2]==='percentage unavailable'?'Follower change · six calendar months':signed(summary[1])+' followers · six calendar months',kind:'growth' as const};
 const momentum=finding.match(/^Average monthly .+ follower change is (-?\d+(?:\.\d+)?) across (\d+) consecutive-month comparisons\.$/);
 if(momentum)return {title:'Growth Momentum',metric:signed(momentum[1]),caption:'Followers per month · '+momentum[2]+' comparisons',kind:'content' as const};
 const peak=finding.match(/^The largest measured monthly change was (-?\d+) in (.+)\.$/);
 if(peak)return {title:'Largest Monthly Change',metric:signed(peak[1]),caption:peak[2]+' · followers',kind:'opportunity' as const};
 return {title:'Snapshot Coverage',metric:null,caption:'Recorded snapshot evidence',kind:'content' as const};
}

export default function FollowerGrowthInsights({findings}:{findings:string[]}){
 return <section className="card follower-growth-insights" aria-labelledby="follower-growth-insights-title">
  <div className="card-head"><div><h3 id="follower-growth-insights-title">Follower Growth Insights</h3><p>Calculated from recorded snapshots; gaps and zero baselines remain explicit.</p></div></div>
  <div className="follower-evidence-grid">{findings.map((finding,index)=>{
   const item=presentFollowerFinding(finding),Icon=item.metric===null?Database:item.title==='Growth Summary'?TrendingUp:item.title==='Growth Momentum'?Activity:Rocket;
   return <article className={'strategic-insight-card follower-evidence-card insight-'+item.kind} key={index}>
    <header><span className="follower-evidence-icon"><Icon size={26} aria-hidden="true"/></span><h4>{item.title}</h4></header>
    {item.metric!==null&&<strong className="follower-evidence-metric">{item.metric}</strong>}
    <span className="follower-evidence-caption">{item.caption}</span>
    <p className="follower-evidence-finding">{finding}</p>
    <footer><span className="follower-confidence-badge">Calculated evidence</span><small>Confidence: not assessed</small></footer>
   </article>;
  })}</div>
  <details className="follower-evidence-method"><summary>How growth is measured</summary><p>Monthly growth compares consecutive calendar months. Growth since the previous recorded snapshot is shown separately when months are missing. Year-over-year compares the same month one year earlier.</p><p>These cards present calculated snapshot evidence. Confidence ratings and explanations are provided separately by AI insights when available.</p></details>
 </section>;
}
