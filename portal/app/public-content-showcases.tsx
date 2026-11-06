'use client';
import {useState} from 'react';
import {HighlightCard,PublicSection,type PublicStory} from './public-components';
import type {PublicShowcases,ShowcasePeriod} from '../lib/public-content-showcases';
export default function PublicContentShowcases({stories,showcases,defaultPeriod='30d',title='Community Content Showcase',description=''}:{title?:string;description?:string;stories:PublicStory[];showcases:PublicShowcases;defaultPeriod?:ShowcasePeriod}){
 const [period,setPeriod]=useState<ShowcasePeriod>(defaultPeriod),[metric,setMetric]=useState<'engagement'|'reach'|'views'>('engagement'),selection=showcases.periods[period];
 const cards=(ids:string[])=>{const rows=ids.map(id=>stories.find(story=>story.id===id)).filter((story):story is PublicStory=>!!story);return rows.length?<div className="ps-card-grid">{rows.map(story=><HighlightCard key={story.id} story={story}/>)}</div>:<p className="ps-showcase-empty">No posts available.</p>};
 return <PublicSection id="content-showcases" eyebrow="FROM OUR COMMUNITY" title={title||'Community Content Showcase'} description={description}>
  <h3>Most Recent Posts</h3>{cards(showcases.latestPosts)}
  <details className="ps-showcase-details"><summary>Latest Stories &amp; Community Highlights</summary><h3>Latest Stories</h3>{cards(showcases.latestStories)}<h3>Latest Community Highlights</h3>{cards(showcases.latestHighlights)}</details>
  <div className="ps-showcase-controls"><label>Show content from<select value={period} onChange={event=>setPeriod(event.target.value as ShowcasePeriod)}><option value="30d">Last 30 Days</option><option value="90d">Last 90 Days</option><option value="ytd">Year-to-Date</option></select></label><label>Top performance measure<select value={metric} onChange={event=>setMetric(event.target.value as typeof metric)}><option value="engagement">Engagement</option><option value="reach">Reported Reach</option><option value="views">Reported Views</option></select></label></div>
  <h3>Top Performing Posts</h3>{cards(selection[metric])}
  <h3>Featured Posts</h3>{cards(selection.featured)}
  <h3>Trending Now</h3><p>Recent approved posts performing above their platform, account and content-type engagement baselines. This is a comparison of recorded results, not a live popularity feed.</p>{cards(selection.trending)}
 </PublicSection>;
}
