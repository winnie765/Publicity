'use client';
import {HighlightCard,type PublicStory} from './public-components';
import type {PublicShowcases} from '../lib/public-content-showcases';
export default function PublicContentShowcases({stories,showcases,description=''}:{title?:string;description?:string;stories:PublicStory[];showcases:PublicShowcases}){
 const selection=showcases.automatic;
 const cards=(ids:string[])=>{const rows=ids.map(id=>stories.find(story=>story.id===id)).filter((story):story is PublicStory=>!!story);return rows.length?<div className="ps-card-grid">{rows.map(story=><HighlightCard key={story.id} story={story}/>)}</div>:<p className="ps-showcase-empty">No posts available.</p>};
 return <section id="content-showcases" className="ps-section" aria-label="Public posts"><div className="ps-section-heading"><div><span className="ps-eyebrow">FROM OUR COMMUNITY</span>{description&&<p>{description}</p>}</div></div>
  <h3>Featured Posts</h3>{cards(selection.featured)}
  <h3>Top Performing Posts</h3>{cards(selection.performance)}
  <h3>Most Recent Posts</h3>{cards(showcases.latestPosts)}
 </section>;
}
