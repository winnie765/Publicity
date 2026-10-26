'use client';
import {useState} from 'react';
import {Eye,Globe} from 'lucide-react';
import CmsContentEditor from './cms-content-editor';
import type {PublicHomeSettings} from '../lib/public-site-config';
import type {Dataset} from './model';
export default function CmsHeroEditor({home,data,busy,onPublish}:{home:PublicHomeSettings;data:Dataset;busy:boolean;onPublish:(record:PublicHomeSettings)=>Promise<boolean>}){
 const [draft,setDraft]=useState(home),[imageBusy,setImageBusy]=useState(false);
 return <section><div className="cms-section-heading"><h2>Hero Banner</h2><div className="cms-card-actions"><a className="button" href="/workspace/site-preview?page=home" target="_blank" rel="noopener noreferrer"><Eye size={16}/> Preview Published Site</a><button className="button primary" type="button" onClick={()=>onPublish(draft)} disabled={busy||imageBusy}><Globe size={16}/>{imageBusy?'Uploading...':busy?'Publishing...':'Publish Changes'}</button></div></div><CmsContentEditor homeSection="home" editor={{kind:'home',record:draft,baseUpdatedAt:''}} onChange={setDraft} data={data} publications={[]} onImageBusy={setImageBusy}/></section>;
}
