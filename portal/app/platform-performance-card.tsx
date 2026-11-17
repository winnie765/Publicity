import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {number} from './analytics-ui';
import type {dashboardView} from './dashboard-intelligence';

type Props=Pick<ReturnType<typeof dashboardView>['platforms'][number],'platform'|'stats'|'reported'|'metric'> & {href:string};

/** Presentation only: values come from the existing dashboard calculation. */
export default function PlatformPerformanceCard({platform,stats,reported,metric,href}:Props){
 const metrics=[{label:'Total posts',value:stats.posts},{label:'Recorded engagements',value:stats.measured?stats.engagement:null},...(reported.count?[{label:platform+' '+(metric==='views'?'Views':'Reach'),value:reported.total}]:[])];
 return <article className="executive-platform-card analytics-summary-card" aria-label={platform+' performance'}>
  <h3>{platform}</h3>
  <dl className="platform-performance-metrics">{metrics.map(metric=><div key={metric.label}><dt>{metric.label}</dt><dd className={metric.value===null?'is-missing':undefined}>{number(metric.value)}</dd></div>)}</dl>
  <div className="platform-performance-coverage"><h4>Measurement coverage</h4><p>{stats.measured} / {stats.posts} posts measured. {reported.count} visibility readings.</p><p>Views and Reach are distinct; neither establishes unique people across posts.</p></div>
  <Link className="button platform-performance-link" href={href}>View Full {platform} Analysis <ArrowRight size={16} aria-hidden="true"/></Link>
 </article>;
}
