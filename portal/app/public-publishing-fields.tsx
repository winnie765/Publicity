'use client';
import {useId} from 'react';
import {BookOpen,Check,Globe,Home,Layers,Lock,Star} from 'lucide-react';
import type {Post} from './model';
import {selectedDestinations,toggleDestination,type PublicDestination} from '../lib/public-destinations';
import ThemedSelect from './themed-select';
import './publishing-information.css';

const destinations=[
  {key:'private',title:'Not Public',description:'Keep this post inside the workspace.',icon:Lock},
  {key:'highlights',title:'Community Highlights',description:'Share a community update.',icon:Star},
  {key:'stories',title:'Stories',description:'Publish a public story or article.',icon:BookOpen},
  {key:'programme',title:'Programme Page',description:'Include this on its brand page.',icon:Layers},
  {key:'homepage',title:'Homepage Feature',description:'Feature on the homepage and in Community Highlights.',icon:Home},
] satisfies {key:PublicDestination;title:string;description:string;icon:typeof Home}[];

export default function PublicPublishingFields({post,onChange}:{post:Post;onChange:(patch:Partial<Post>)=>void}){
  const id=useId(),selected=selectedDestinations(post),stories=selected.includes('stories');
  return <section className="publishing-information public-publishing" aria-labelledby={id}>
    <header className="publishing-card-heading"><span className="publishing-card-icon"><Globe size={21}/></span><div><h3 id={id}>Public Publishing</h3><p>Where should this appear publicly?</p></div></header>
    <div className="public-destination-label" id={id+'-destinations'}>Publish To <small>Select all that apply.</small></div>
    <div className="public-destination-grid" role="group" aria-labelledby={id+'-destinations'}>{destinations.map(({key,title,description,icon:Icon})=><button key={key} type="button" className="public-destination" aria-pressed={selected.includes(key)} onClick={()=>onChange(toggleDestination(post,key))}><Icon size={20}/><span><strong>{title}</strong><small>{description}</small></span><span className="public-destination-check" aria-hidden="true">{selected.includes(key)&&<Check size={13}/>}</span></button>)}</div>
    <label className="field">Public Summary<textarea maxLength={1800} required={post.show_on_public_site} value={post.public_summary||''} onChange={e=>onChange({public_summary:e.target.value})}/><small>This public summary is shown on the website. Internal notes and analytics remain private.</small></label>
    {stories&&<div className="public-story-fields"><label className="field">Story Category<ThemedSelect value={post.public_category||'Community'} onValueChange={value=>onChange({public_category:value})}>{['Community','Senior','Volunteer','Health Promotion','HHP','AAC','Success Story','Event','Programme'].map(value=><option key={value}>{value}</option>)}</ThemedSelect></label><label className="field">Public Article<textarea rows={8} maxLength={20000} value={post.public_article||''} onChange={e=>onChange({public_article:e.target.value})}/><small>Separate paragraphs with a blank line.</small></label></div>}
  </section>;
}
