'use client';
import PublicCardGrid from './public-card-grid';
import PublicPostCard from './public-post-card';
import PublicContentShowcases from './public-content-showcases';
import OriginalPostLink from './original-post-link';
import PublicStoryMedia from './public-story-media';
import ProgrammeShowcase from './programme-showcase';
import PublicValues from './public-values';
import PublicSocialLinks from './public-social-links';
import PublicGallery from './public-gallery';
import {RichStoryContent} from './rich-story-editor';
import {PublicSection,EmptyPublicContent,PartnerCard,PublicPostMeta,storyCategory,type PublicStory} from './public-components';
import {defaultPublicHome} from '../lib/public-site-config';
import type {PublicData} from './public-portal';
function Story({story}:{story:PublicStory}){return <PublicPostCard title={story.title}><div className="ps-card-image"><PublicStoryMedia story={story}/></div><div className="ps-card-copy"><PublicPostMeta story={story}/><span className="ps-category">{storyCategory(story.section)}</span><h3>{story.title}</h3><p>{story.summary}</p><details className="ps-inline-story"><summary>Read More</summary>{story.author&&<p>By {story.author}</p>}<RichStoryContent value={story.body} format={story.bodyFormat}/><PublicGallery images={story.gallery}/></details><OriginalPostLink post={story} platformLabel className="ps-link original-post-link"/></div></PublicPostCard>}
export default function PublicLanding({data}:{data:PublicData}){
 const home={...defaultPublicHome,...data.home};
 const cards=(rows:PublicStory[])=>rows.length?<PublicCardGrid>{rows.map(s=><Story key={s.id} story={s}/>)}</PublicCardGrid>:<EmptyPublicContent>New community stories will be shared here soon.</EmptyPublicContent>;
 return <><PublicValues settings={home}/>{home.showcasesEnabled!==false&&data.showcases&&<PublicContentShowcases description={home.showcaseDescription} stories={data.stories} showcases={data.showcases}/>}<PublicSection id="programmes" eyebrow="OUR BRANDS" title={home.brandsTitle}><ProgrammeShowcase data={data} renderStories={cards}/></PublicSection><PublicSocialLinks settings={home}/>{data.partners.length>0&&<PublicSection id="partners" eyebrow="STRONGER TOGETHER" title={home.partnersTitle} description={home.partnersDescription} className="ps-partners-section"><div className="ps-partners-grid">{data.partners.map(p=><PartnerCard key={p.id} partner={p}/>)}</div></PublicSection>}</>;
}
