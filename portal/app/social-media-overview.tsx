'use client';
import type {Filters} from '../lib/intelligence/types';
import type {Post} from './model';
import {overview,externalPosts,recordedMetric,formatGroups,measuredPosts} from './analytics-overview';
import {groups} from './model';
import PlatformComparison from './platform-comparison';
import {topHits} from './top-hits';
import {Section} from './analytics-ui';
export default function SocialMediaOverview({posts,onOpen}:{posts:Post[];onOpen:(p:Post)=>void;filters?:Filters;revision?:string;enabled?:boolean}){
 const rows=externalPosts(posts),hits=topHits(rows),platforms=(['Facebook','Instagram'] as const).map(platform=>{const posts=rows.filter(p=>p.platform===platform);return {platform,stats:overview(posts),reported:recordedMetric(posts,platform==='Facebook'?'views':'reach'),format:formatGroups(posts).find(g=>g.name!=='Unclassified'),brand:groups(measuredPosts(posts),'brand').find(g=>g.name!=='Unclassified'),top:hits.sections.find(s=>s.platform===platform)?.hits[0]};});
 return <div className="social-media-overview"><Section title="Facebook vs Instagram Comparison" sub="Compare recorded posts and engagement across platforms."><PlatformComparison platforms={platforms} onOpen={onOpen}/></Section><p className="method-note">These cards compare the recorded platform mix. It does not rank incompatible engagement rates. Open platform analysis for detailed trends, or Top Hits Intelligence for the complete rankings.</p><a className="button" href="/workspace/top-hits">Open Top Hits Intelligence</a></div>;
}
