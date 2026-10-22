'use client';
import OriginalPostLinkField from './original-post-link-field';
import PostRelationshipsFields from './post-relationships-fields';
import WorkvivoAssociation from './workvivo-association';
import {useEffect,useRef} from 'react';
import VideoUpload from './video-upload';
import ImageUpload from './image-upload';
import ThemedSelect from './themed-select';
import type {Post} from './model';
import PublicPublishingFields from './public-publishing-fields';
export default function PostContentFields({post,onChange,onBusyChange}:{post:Post;onChange:(patch:Partial<Post>)=>void;onBusyChange?:(busy:boolean)=>void}){const previousType=useRef(post.type);useEffect(()=>{if(previousType.current!==post.type){previousType.current=post.type;onChange({media_type:/video|reel/i.test(post.type)?'video':'image'});}},[post.type]);const mediaType=post.media_type||(/video|reel/i.test(post.type)?'video':'image');return <div className="post-public-content"><label className="field">Featured Media<ThemedSelect value={mediaType} onValueChange={value=>onChange({media_type:value as 'image'|'video'})}><option value="image">Image / Gallery</option><option value="video">Video / Reel</option></ThemedSelect></label>{mediaType==='video'?<><VideoUpload value={post} folder={post.platform.toLowerCase()} onChange={onChange} onBusyChange={onBusyChange}/><details><summary>Poster Image &amp; Optional Gallery</summary><ImageUpload value={post} folder={post.platform.toLowerCase()} onChange={onChange} onBusyChange={onBusyChange}/></details></>:<ImageUpload value={post} folder={post.platform.toLowerCase()} onChange={onChange} onBusyChange={onBusyChange}/>}<OriginalPostLinkField post={post} onChange={onChange}/><PostRelationshipsFields post={post} onChange={onChange}/>{post.platform==='Workvivo'?<p className="method-note">Workvivo images and videos stay inside the Workspace.</p>:<><WorkvivoAssociation post={post} onChange={onChange}/><PublicPublishingFields post={post} onChange={onChange}/></>}</div>}
