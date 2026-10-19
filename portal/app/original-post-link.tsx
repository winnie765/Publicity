import {ExternalLink} from 'lucide-react';
import {originalPostUrl,type PostSourceLink} from '../lib/original-post-url';
export default function OriginalPostLink({post,className='text-button original-post-link',platformLabel=false}:{post:PostSourceLink&{platform?:string;title?:string;is_workvivo_associated?:boolean};className?:string;platformLabel?:boolean}){
 const url=originalPostUrl(post);const badge=!platformLabel&&post.is_workvivo_associated?<span className="badge purple">Workvivo Associated</span>:null;if(!url)return badge;
 const label=platformLabel&&['Facebook','Instagram','Workvivo'].includes(post.platform||'')?'View Original '+post.platform+' Post':'View Original Post';
 return <>{badge}<a href={url} target="_blank" rel="noopener noreferrer" onClick={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()} className={className} aria-label={label+(post.title?': '+post.title:'')+' (opens in a new tab)'}>{label} <ExternalLink size={15} aria-hidden="true"/></a></>;
}
