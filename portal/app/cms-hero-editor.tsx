'use client';
import {useState} from 'react';
import {Eye,Globe,Trash2} from 'lucide-react';
import {useConfirmAction} from './confirm-action';
import CmsContentEditor from './cms-content-editor';
import type {PublicHomeSettings} from '../lib/public-site-config';
import type {Dataset} from './model';
export default function CmsHeroEditor({home,data,busy,onPublish}:{home:PublicHomeSettings;data:Dataset;busy:boolean;onPublish:(record:PublicHomeSettings)=>Promise<boolean>}){
 const [draft,setDraft]=useState(home),[imageBusy,setImageBusy]=useState(false);const {confirm,confirmation}=useConfirmAction();
 return <section>{confirmation}<div className="cms-section-heading"><h2>Hero Banner</h2><div className="cms-card-actions"><button type="button" className="button" disabled={busy||imageBusy} onClick={async()=>{const next={...draft,heroVisible:draft.heroVisible===false};if(await onPublish(next))setDraft(next)}}>{draft.heroVisible===false?'Show':'Hide'}</button><button type="button" className="button danger" disabled={busy||imageBusy} onClick={async()=>{if(!await confirm('Delete hero banners?','This removes the banner images from the homepage and hides the hero section. Uploaded files stay in Media Library.','Delete Banners'))return;const next={...draft,heroVisible:false,heroSlides:[],heroImageUrl:''};if(await onPublish(next))setDraft(next)}}><Trash2 size={16}/> Delete Banners</button><a className="button" href="/workspace/site-preview?page=home" target="_blank" rel="noopener noreferrer"><Eye size={16}/> Preview Published Site</a><button className="button primary" type="button" onClick={()=>onPublish(draft)} disabled={busy||imageBusy}><Globe size={16}/>{imageBusy?'Uploading...':busy?'Publishing...':'Publish Changes'}</button></div></div><CmsContentEditor homeSection="home" editor={{kind:'home',record:draft,baseUpdatedAt:''}} onChange={setDraft} data={data} publications={[]} onImageBusy={setImageBusy}/></section>;
}
