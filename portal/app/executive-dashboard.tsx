'use client';
import LinkedBrandPosts from './linked-brand-posts';
import PlatformPerformanceCard from './platform-performance-card';
import ExecutiveBrandComparison from './executive-brand-comparison';
import ExecutivePerformanceIntelligence from './executive-performance-intelligence';
import {useMemo} from 'react';
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,ArrowDownRight,Minus} from 'lucide-react';
import type {Dataset,Post} from './model';
import type {Filters} from '../lib/intelligence/types';
import {dashboardView,change} from './dashboard-intelligence';
import {Section,number} from './analytics-ui';
import {workspaceFeatures as features} from '../lib/workspace-features';
type Props={decisionSupport?:React.ReactNode;data:Dataset;posts:Post[];start:string;end:string;onOpen:(p:Post)=>void;onNavigate:(page:number)=>void;aiSummary?:React.ReactNode;filters?:Filters;revision?:string;enabled?:boolean;onQuickAction?:(kind:'posts'|'followers'|'interactions',platform?:string)=>void};
function Delta({value,label}:{value:ReturnType<typeof change>;label:string}){const Icon=value.delta===null||value.delta===0?Minus:value.delta>0?ArrowUpRight:ArrowDownRight;return <div className={'dashboard-delta '+(value.delta===null||value.delta===0?'neutral':value.delta>0?'up':'down')}><Icon size={14}/><span>{value.delta===null?'Comparison unavailable':(value.delta>0?'+':'')+number(value.delta)+(value.percentage===null?' · no positive baseline': ' ('+(value.percentage>0?'+':'')+number(value.percentage)+'%)')}<small>{label}</small></span></div>}
function Metric({title,value,note,delta,label}:{title:string;value:React.ReactNode;note:string;delta?:ReturnType<typeof change>;label?:string}){return <article className="metric executive-presentation-metric"><span>{title}</span><strong className={typeof value==='string'&&value.length>10?'word-metric':''}>{value}</strong><small>{note}</small>{delta&&<Delta value={delta} label={label||'Previous period'}/>}</article>}

export default function ExecutiveDashboard({data,posts,start,end,filters={}}:Props){
 const selectedFilters=useMemo(()=>({...filters,...(start?{start}:{}),...(end?{end}:{})}),[filters,start,end]),view=useMemo(()=>dashboardView(data,posts,selectedFilters),[data,posts,selectedFilters]);
 return <div className="executive-page executive-presentation analytics-dashboard"><LinkedBrandPosts data={data} filters={selectedFilters}/>

 <div className="section-heading" id="dashboard-overview"><div><span className="eyebrow">WHAT HAPPENED?</span><h2>Overall Performance</h2><p>{view.start} to {view.end}. {view.previous.label}: {view.previous.start} to {view.previous.end}</p></div><Link className="button" href={features.analytics.href}>Explore Social Media Analytics <ArrowRight size={14}/></Link></div>
 <div className="executive-kpis"><Metric title="Total Posts" value={number(view.stats.posts)} note="Published Facebook and Instagram posts" delta={view.changes.posts} label={view.previous.label}/><Metric title="Total Engagements" value={view.stats.measured?number(view.stats.engagement):'Unavailable'} note={'Reported for '+view.stats.measured+' of '+view.stats.posts+' posts'} delta={view.changes.engagement} label={view.previous.label}/><Metric title="Total Followers" value={number(view.followers.total)} note="Latest independent account counts; audiences may overlap" delta={view.changes.followers} label="Latest counts as of comparison end"/><Metric title="Average Engagement Per Post" value={number(view.stats.average)} note="Measured posts only" delta={view.changes.average} label={view.previous.label}/></div>
 <details className="dashboard-metric-notes"><summary>Metric coverage and comparisons</summary><p>Only published external posts enter this summary. Missing measurements remain unavailable. Followers add independent account counts and can include overlapping audiences; location filters apply to posts. Follower changes require both periods for every selected account. Inspect source coverage before interpreting change.</p></details>
 <Section title="Platform Performance Saved Record" sub="Which platform contributes recorded activity? Recognised duplicate post identities count once, attributed to the account on the lowest stable record ID. Separate publications keep separate metrics. Open detailed analytics for source records."><div className="platform-performance-grid">{view.platforms.map(p=><PlatformPerformanceCard key={p.platform} platform={p.platform} stats={p.stats} reported={p.reported} metric={p.metric} href={p.platform==='Facebook'?features.facebook.href:features.instagram.href}/>)}</div></Section>
 <ExecutivePerformanceIntelligence data={data} filters={{...selectedFilters,start:view.start,end:view.end}}/>
 <div id="brand-comparison"><ExecutiveBrandComparison filters={selectedFilters} posts={view.selected} prior={view.prior} start={view.start} end={view.end} previousLabel={view.previous.label}/></div>
 <Section title="Explore the Detail" sub="Each detailed tool has one primary location."><div className="dashboard-quick-actions">{(['analytics','followers','content','analyst'] as const).map(id=><Link className="button" key={id} href={features[id].href}>{features[id].label} <ArrowRight size={14}/></Link>)}</div></Section>
 <Section title="Quick Actions" sub="Shortcuts open the original tools; no separate entry forms."><div className="dashboard-quick-actions"><Link className="button" href={features.posts.href+'?new=1'}>Add Social Media Post</Link><Link className="button" href={features.followers.href}>Manage Followers</Link><Link className="button" href={features.workvivo.href}>Record Workvivo Interactions</Link><Link className="button" href={features.publicSite.href}>Manage Public Content</Link><Link className="button" href={features.planner.href}>Plan Content or an Event</Link></div></Section>
 </div>;
}
