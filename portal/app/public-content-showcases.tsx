'use client';
import {HighlightCard,PublicSection,type PublicStory} from './public-components';
import type {PublicShowcases,ShowcasePeriod,ShowcaseRanking} from '../lib/public-content-showcases';
export default function PublicContentShowcases({stories,showcases,defaultPeriod='30d',rankingMethod='automatic',title='Community Content Showcase',description=''}:{title?:string;description?:string;stories:PublicStory[];showcases:PublicShowcases;defaultPeriod?:ShowcasePeriod;rankingMethod?:ShowcaseRanking}){
 const selection=showcases.periods[defaultPeriod]||showcases.periods['30d'],metric=rankingMethod==='automatic'?'performance':rankingMethod==='interactions'?'engagement':rankingMethod;
 const cards=(ids:string[])=>{const rows=ids.map(id=>stories.find(story=>story.id===id)).filter((story):story is PublicStory=>!!story);return rows.length?<div className="ps-card-grid">{rows.map(story=><HighlightCard key={story.id} story={story}/>)}</div>:<p className="ps-showcase-empty">No posts available.</p>};
 return <PublicSection id="content-showcases" eyebrow="FROM OUR COMMUNITY" title={title||'Community Content Showcase'} description={description}>
  <h3>Featured Posts</h3>{cards(selection.featured)}
  <h3>Trending Now</h3>{cards(selection.trending)}
  <h3>Top Performing Posts</h3>{cards(selection[metric])}
  <h3>Most Recent Posts</h3>{cards(showcases.latestPosts)}
  <details className="ps-showcase-details"><summary>Latest Stories &amp; Community Highlights</summary><h3>Latest Stories</h3>{cards(showcases.latestStories)}<h3>Latest Community Highlights</h3>{cards(showcases.latestHighlights)}</details>
 </PublicSection>;
}
