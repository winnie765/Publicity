'use client';
import {useState} from 'react';
import {Eye,Globe,Layers,ShieldCheck} from 'lucide-react';
import ThemedSelect from './themed-select';
import FieldLabel from './field-label';
import type {PublicHomeSettings} from '../lib/public-site-config';
import './cms-showcase-settings.css';
export default function CmsShowcaseSettings({home,busy,onPublish}:{home:PublicHomeSettings;busy:boolean;onPublish:(record:PublicHomeSettings)=>Promise<boolean>}){
 const [ranking,setRanking]=useState(home.showcaseRankingMethod||'automatic'),[count,setCount]=useState<3|6|9|12>(home.showcasePostCount||6);
 const [enabled,setEnabled]=useState(home.showcasesEnabled!==false),[period,setPeriod]=useState(home.showcaseDefaultPeriod||'30d'),[title,setTitle]=useState(home.showcaseTitle||'Community Content Showcase'),[description,setDescription]=useState(home.showcaseDescription||'');
 return <section className="cms-surface cms-showcase-settings" aria-labelledby="showcase-settings-heading">
 <header className="cms-showcase-header"><span className="cms-showcase-icon"><Layers size={24} aria-hidden="true"/></span><div><span className="eyebrow">AUTOMATIC PUBLIC CONTENT</span><h2 id="showcase-settings-heading">Content Showcases</h2><p>Keep your public website fresh with approved content, selected automatically.</p></div></header>
 <div className="cms-showcase-visibility"><div><h3>Automatic Content Showcases</h3><p>Show recent, top-performing, featured and trending content on the public site.</p></div><button type="button" className="cms-showcase-switch" role="switch" aria-label="Automatic Content Showcases" aria-checked={enabled} disabled={busy} onClick={()=>setEnabled(value=>!value)}><span className="cms-showcase-track" aria-hidden="true"><span/></span><span>{enabled?'On':'Off'}</span></button></div>
 <div className="cms-showcase-layout"><div className="cms-showcase-fields">
 <label className="field"><FieldLabel>Section Heading</FieldLabel><input maxLength={300} value={title} onChange={event=>setTitle(event.target.value)}/></label>
 <label className="field"><FieldLabel>Description <span className="cms-showcase-optional">Optional</span></FieldLabel><textarea rows={3} maxLength={1800} value={description} placeholder="Add a short introduction to your content showcase" onChange={event=>setDescription(event.target.value)}/></label>
 <label className="field"><FieldLabel>Display Period</FieldLabel><ThemedSelect value={period} onValueChange={value=>setPeriod(value as typeof period)}><option value="30d">Last 30 Days</option><option value="90d">Last 90 Days</option><option value="ytd">Year-to-Date</option></ThemedSelect></label>
 <label className="field"><FieldLabel>Ranking Method</FieldLabel><ThemedSelect value={ranking} onValueChange={value=>setRanking(value as typeof ranking)}><option value="automatic">Automatic</option><option value="engagement">Engagement</option><option value="reach">Reach</option><option value="interactions">Interactions</option><option value="views">Views</option></ThemedSelect><small>Interactions uses recorded likes, comments, shares and saves, or the recorded engagement total.</small></label>
 <label className="field"><FieldLabel>Number of Posts</FieldLabel><ThemedSelect value={String(count)} onValueChange={value=>setCount(Number(value) as typeof count)}>{[3,6,9,12].map(value=><option key={value} value={String(value)}>{value}</option>)}</ThemedSelect><small>Maximum number shown in each collection.</small></label>
 </div><aside className="cms-showcase-guidance"><ShieldCheck size={22} aria-hidden="true"/><h3>Approved content only</h3><p>Collections update automatically from content you have published and approved.</p><ul><li>Hidden, draft and scheduled content is excluded.</li><li>Workvivo content stays private.</li><li>Public post details show recorded metrics. Internal notes stay private.</li></ul></aside></div>
 <footer className="cms-showcase-footer"><p>Changes appear on the public site after publishing.</p><div className="cms-card-actions"><a className="button" href="/workspace/site-preview?page=home#content-showcases" target="_blank" rel="noopener noreferrer"><Eye size={16} aria-hidden="true"/> Preview</a><button type="button" className="button primary" disabled={busy} onClick={()=>onPublish({...home,showcaseRankingMethod:ranking,showcasePostCount:count,showcasesEnabled:enabled,showcaseDefaultPeriod:period,showcaseTitle:title,showcaseDescription:description})}><Globe size={16} aria-hidden="true"/>{busy?'Saving...':'Publish Settings'}</button></div></footer>
 </section>;
}
