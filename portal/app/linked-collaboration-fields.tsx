'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Post} from './model';
import FieldLabel from './field-label';
import {collaborationMatches,collaborationMembers} from '../lib/linked-collaboration';
import OriginalPostLink from './original-post-link';

export default function LinkedCollaborationFields({post,posts,onChange}:{post:Post;posts:Post[];onChange:(patch:Partial<Post>)=>void}){
 const [query,setQuery]=useState('');
 const matches=collaborationMatches(post,posts),confirmed=new Set(matches.filter(m=>m.confirmed).map(m=>m.post.id));
 const suggested=new Set(matches.map(m=>m.post.id)),members=collaborationMembers(post,posts);
 const rows=posts.filter(p=>p.id!==post.id&&['Facebook','Instagram'].includes(p.platform)&&((post.linked_post_ids||[]).includes(p.id)||suggested.has(p.id)||query.trim()&&[p.title,p.account,p.platform,p.date].join(' ').toLowerCase().includes(query.trim().toLowerCase()))).slice(0,20);
 return <section className="linked-collaboration"><h4>Linked Collaboration</h4><p className="method-note">Link separate publications about the same programme. Each keeps its own account, status and measurements. Linking never creates posts or copies metrics. Stakeholder names do not assign account ownership.</p><label className="field"><FieldLabel>Find a related post</FieldLabel><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, account, platform or date"/></label>
 {rows.length===0&&<p className="method-note">No related posts found. A collaboration can have just this post.</p>}
 <div role="group" aria-label="Related collaboration posts">{rows.map(row=><article key={row.id} className="sp-review"><label><input type="checkbox" disabled={confirmed.has(row.id)} checked={(post.linked_post_ids||[]).includes(row.id)} onChange={e=>onChange({linked_post_ids:e.target.checked?[...(post.linked_post_ids||[]),row.id]:(post.linked_post_ids||[]).filter(id=>id!==row.id)})}/> {row.title} · {row.account} · {row.platform} · {row.date}</label><p>{confirmed.has(row.id)?'Same platform post identity: edit the existing record.':matches.find(m=>m.post.id===row.id)?.reasons.join('; ')||'Staff-selected relationship; not a duplicate determination.'}</p><Link className="button" target="_blank" rel="noopener noreferrer" href={'/workspace/posts?'+(confirmed.has(row.id)?'edit=':'view=')+encodeURIComponent(row.id)}>{confirmed.has(row.id)?'Edit Existing Post':'View Existing Post'}</Link><OriginalPostLink post={row}/></article>)}</div>
 {members.length>0&&<p className="method-note">Related collaboration: {members.map(p=>p.title+' ('+p.account+')').join('; ')}. Shared publications use one stable record for organisation totals; brand attribution stays with that record’s configured account, not the stakeholder list.</p>}
 {(post.linked_post_ids||[]).filter(id=>!posts.some(p=>p.id===id)).map(id=><p key={id}>Related record unavailable: {id} <button className="button" type="button" onClick={()=>onChange({linked_post_ids:(post.linked_post_ids||[]).filter(value=>value!==id)})}>Remove Link</button></p>)}
 </section>;
}
