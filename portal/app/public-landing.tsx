'use client';
import OriginalPostLink from './original-post-link';
import {useState} from 'react';
import {ArrowUpRight,Search} from 'lucide-react';
import PublicStoryMedia from './public-story-media';
import ProgrammeShowcase from './programme-showcase';
import PublicValues from './public-values';
import PublicSocialLinks from './public-social-links';
import CommunityHighlightsCarousel from './community-highlights-carousel';
import PublicGallery from './public-gallery';
import {RichStoryContent} from './rich-story-editor';
import {PublicSection,EmptyPublicContent,PartnerCard,storyCategory,displayDate,type PublicStory} from './public-components';
import {defaultPublicHome} from '../lib/public-site-config';
import type {PublicData} from './public-portal';
function Story({story}:{story:PublicStory}){return <article className="ps-content-card"><div className="ps-card-image"><PublicStoryMedia story={story}/><span className="ps-image-label">{story.platform}</span></div><div className="ps-card-copy"><div className="ps-card-meta"><span>{story.brand}</span><time dateTime={story.date}>{displayDate(story.date)}</time></div><span className="ps-category">{storyCategory(story.section)}</span><h3>{story.title}</h3><p>{story.summary}</p><details className="ps-inline-story"><summary>Read More</summary>{story.author&&<p>By {story.author}</p>}<RichStoryContent value={story.body} format={story.bodyFormat}/><PublicGallery images={story.gallery}/></details><OriginalPostLink post={story} platformLabel className="ps-link original-post-link"/></div></article>}
export default function PublicLanding({data}:{data:PublicData}){
 const home={...defaultPublicHome,...data.home},[query,setQuery]=useState('');
 const cards=(rows:PublicStory[])=>rows.length?<div className="ps-card-grid">{rows.map(s=><Story key={s.id} story={s}/>)}</div>:<EmptyPublicContent>New community stories will be shared here soon.</EmptyPublicContent>;
 return <><PublicValues settings={home}/><CommunityHighlightsCarousel stories={data.stories} title={home.highlightsTitle} description={home.highlightsDescription}/><PublicSection id="programmes" eyebrow="OUR BRANDS" title={home.brandsTitle}><ProgrammeShowcase data={data} renderStories={cards}/></PublicSection><PublicSection id="stories" eyebrow="PEOPLE AT THE HEART OF IT ALL" title={home.storiesTitle} description={home.storiesDescription}><div className="ps-story-search"><Search size={19}/><input type="search" aria-label="Search public stories" placeholder="Search stories, programmes and people" value={query} onChange={e=>setQuery(e.target.value)}/></div>{cards(data.stories.filter(s=>s.showInStories!==false&&[s.title,s.summary,s.brand,s.section].join(' ').toLowerCase().includes(query.toLowerCase())))}</PublicSection><PublicSocialLinks settings={home}/>{data.partners.length>0&&<PublicSection id="partners" eyebrow="STRONGER TOGETHER" title={home.partnersTitle} description={home.partnersDescription} className="ps-partners-section"><div className="ps-partners-grid">{data.partners.map(p=><PartnerCard key={p.id} partner={p}/>)}</div></PublicSection>}</>;
}
