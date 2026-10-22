'use client';
import {useId} from 'react';
import {Link2} from 'lucide-react';
import type {Post} from './model';
import {postUrlValue} from '../lib/original-post-url';
import './publishing-information.css';
export default function OriginalPostLinkField({post,onChange}:{post:Post;onChange:(patch:Partial<Post>)=>void}){const id=useId();return <section className="publishing-information publishing-original-link" aria-labelledby={id}><header className="publishing-card-heading"><span className="publishing-card-icon"><Link2 size={21}/></span><div><h3 id={id}>Original Post Link</h3><p>Paste the direct Facebook, Instagram or Workvivo URL.</p></div><span className="publishing-optional">Optional</span></header><label className="field">Original Post URL<input type="url" inputMode="url" maxLength={2000} aria-describedby={id+'-help'} placeholder={post.platform==='Instagram'?'https://www.instagram.com/p/...':post.platform==='Facebook'?'https://www.facebook.com/...':'https://your-organisation.workvivo.com/...'} value={postUrlValue(post)} onChange={e=>onChange({original_post_url:e.target.value})}/></label><small id={id+'-help'}>Add the link once to use it across analytics, Top Hits and published stories.</small></section>}
