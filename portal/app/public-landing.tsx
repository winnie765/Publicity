'use client';
import {useState} from 'react';
import {ArrowUpRight,Search} from 'lucide-react';
import PublicStoryMedia from './public-story-media';
import ProgrammeShowcase from './programme-showcase';
import PublicValues from './public-values';
import CommunityHighlightsCarousel from './community-highlights-carousel';
import PublicGallery from './public-gallery';
import {RichStoryContent} from './rich-story-editor';
import {PublicSection,EmptyPublicContent,PartnerCard,storyCategory,displayDate,type PublicStory} from './public-components';
import {defaultPublicHome} from '../lib/public-site-config';
import type {PublicData} from './public-portal';
function Story({story}:{story:PublicStory}){return <article className="ps-content-card"><div className="ps-card-image"><PublicStoryMedia story={story}/><span className="ps-image-label">{story.platform}</span></div><div className="ps-card-copy"><div className="ps-card-meta"><span>{story.brand}</span><time dateTime={story.date}>{displayDate(story.date)}</time></div><span className="ps-category">{storyCategory(story.section)}</span><h3>{story.title}</h3><p>{story.summary}</p><details className="ps-inline-story"><summary>Read More</summary>{story.author&&<p>By {story.author}</p>}<RichStoryContent value={story.body} format={story.bodyFormat}/><PublicGallery images={story.gallery}/>{story.url&&<a className="ps-link" href={story.url} target="_blank" rel="noopener noreferrer">View original post <ArrowUpRight size={16}/></a>}</details></div></article>}
export default function PublicLanding({data}:{data:PublicData}){
 const home={...defaultPublicHome,...data.home},[query,setQuery]=useState(''),[category,setCategory]=useState('All Stories');
 const cards=(rows:PublicStory[])=>rows.length?<div className="ps-card-grid">{rows.map(s=><Story key={s.id} story={s}/>)}</div>:<EmptyPublicContent>New community stories will be shared here soon.</EmptyPublicContent>;
 return <><PublicValues/><CommunityHighlightsCarousel stories={data.stories} description={home.highlightsDescription}/><PublicSection id="programmes" eyebrow="OUR PROGRAMMES" title="What We're Doing"><ProgrammeShowcase data={data} renderStories={cards}/></PublicSection><PublicSection id="stories" eyebrow="PEOPLE AT THE HEART OF IT ALL" title="Stories & Success Stories" description={home.storiesDescription}><div className="ps-story-search"><Search size={19}/><input type="search" aria-label="Search public stories" placeholder="Search stories, programmes and people" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="ps-story-filters" aria-label="Story categories">{['All Stories','Senior Stories','Volunteer Stories','Community Stories','Health Promotion','Success Stories','Caregiver Stories','Programme Stories'].map(v=><button key={v} className={category===v?'selected':''} aria-pressed={category===v} onClick={()=>setCategory(v)}>{v}</button>)}</div>{cards(data.stories.filter(s=>s.showInStories!==false&&(category==='All Stories'||storyCategory(s.section)===category)&&[s.title,s.summary,s.brand,s.section].join(' ').toLowerCase().includes(query.toLowerCase())))}</PublicSection><PublicSection id="partners" eyebrow="STRONGER TOGETHER" title={home.partnersTitle} description={home.partnersDescription} className="ps-partners-section">{data.partners.length?<div className="ps-partners-grid">{data.partners.map(p=><PartnerCard key={p.id} partner={p}/>)}</div>:<EmptyPublicContent>Meet our community partners here soon.</EmptyPublicContent>}</PublicSection></>;
}
