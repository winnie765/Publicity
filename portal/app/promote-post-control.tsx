'use client';
import {useState} from 'react';
import {Globe} from 'lucide-react';
import ThemedSelect from './themed-select';
import type {Post} from './model';
export const promotionLink=(id:string)=>'/workspace/site-manager?promote='+encodeURIComponent(id)+'#public-story-publishing';
export default function PromotePostControl({posts}:{posts:Post[]}){
 const eligible=posts.filter(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform)),[selected,setSelected]=useState('');
 return <section className="card workspace-editor"><h3>Share a community highlight</h3><p>Prepare a public story from an existing post. Review the public text and image before publishing; internal metrics stay private.</p><div className="data-toolbar"><ThemedSelect aria-label="Post to promote" value={selected} onValueChange={setSelected}><option value="">Choose a post</option>{eligible.map(p=><option key={p.id} value={p.id}>{p.platform} · {p.brand} · {p.title}</option>)}</ThemedSelect><button className="button primary" disabled={!selected} onClick={()=>{window.location.href=promotionLink(selected)}}><Globe size={16}/> Promote to Community Highlights</button></div></section>;
}
