'use client';
import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import type {Config} from './model';
import {linkedBrandNames,publishingBrand} from '../lib/internal-brand-links';
import type {CollaborationMatch} from '../lib/linked-collaboration';
import OriginalPostLink from './original-post-link';

export default function CollaborationReviewDialog({open,matches,onClose,onSeparate,config}:{open:boolean;config?:Config;matches:CollaborationMatch[];onClose:()=>void;onSeparate:()=>void}){
 const confirmed=matches.some(match=>match.confirmed);
 return <Dialog.Root open={open} onOpenChange={value=>{if(!value)onClose();}}><Dialog.Portal><Dialog.Overlay className="records-dialog-overlay"/><Dialog.Content className="records-dialog records-editor"><Dialog.Title>{confirmed?'This platform post already exists':'Possible Existing Collaboration Post'}</Dialog.Title><Dialog.Description>Review the source identity. Separate account publications keep separate measurements; a shared platform identity must use the existing record.</Dialog.Description>{matches.slice(0,20).map(match=><article key={match.post.id} className="sp-review"><h4>{match.post.title}</h4><p>{match.post.account} / {match.post.platform} / {match.post.date}</p><p>Original brand: {config?publishingBrand(match.post,config):match.post.brand}. Linked brands: {config?linkedBrandNames(match.post,config).join(", ")||"None":"See saved record"}.</p><p>{match.reasons.join('; ')}</p><OriginalPostLink post={match.post}/><div className="sp-actions"><Link className="button" href={'/workspace/posts?'+(match.confirmed?'edit=':'view=')+encodeURIComponent(match.post.id)} target="_blank" rel="noopener noreferrer">View Existing Post</Link><Link className="button" href={"/workspace/posts?edit="+encodeURIComponent(match.post.id)} target="_blank" rel="noopener noreferrer">Edit Existing Post</Link></div></article>)}{matches.length>20&&<p>Showing 20 of {matches.length} matches. Refine the title, date or source URL to narrow suggestions.</p>}<div className="sp-actions">{!confirmed&&<button className="button primary" type="button" onClick={onSeparate}>Record Separate Publication</button>}<Dialog.Close className="button">Cancel</Dialog.Close></div><p className="method-note">Nothing has been saved. After resolving this review, use the form’s Save button.</p></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
