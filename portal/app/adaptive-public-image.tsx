'use client';
import {useRef,useState,useEffect,lazy,Suspense} from 'react';
import {Expand} from 'lucide-react';
import {publicImageSources} from '../lib/public-image-source';
import ContentImage from './content-image';
import {usePublicImageDimensions,rememberPublicImageDimensions,usePublicImageMemoryAllowed} from './public-image-metadata';
import './adaptive-public-image.css';

function PreviewUnavailable({src,onClose}:{src:string;onClose:()=>void}){useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[onClose]);return <div className="ps-image-opening" role="alert">Preview could not open. <a href={src} target="_blank" rel="noopener noreferrer">Open original</a> <button autoFocus onClick={onClose}>Close</button></div>;}
const ImagePreview=lazy(()=>import('./public-image-preview').catch(()=>({default:PreviewUnavailable})));

/** Natural images in content cards; banners/carousels may retain their framed composition. */
export default function AdaptivePublicImage({src,originalSrc,alt,variant='card',layout,width,height,loading='lazy',fetchPriority,previewable=true}:{previewable?:boolean;src:string;originalSrc?:string;alt:string;variant?:'card'|'banner'|'gallery';layout?:'natural'|'framed';width?:number;height?:number;loading?:'lazy'|'eager';fetchPriority?:'high'|'low'|'auto'}){
 const host=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),[failed,setFailed]=useState(false),[open,setOpen]=useState(false);
 const classify=(w:number,h:number)=>h>w*2.2?'poster':h>w*1.15?'portrait':w>h*1.15?'landscape':'square';
 const plan=publicImageSources(src,originalSrc||''),source=plan.primary,original=plan.original||source;
 const cacheAllowed=usePublicImageMemoryAllowed(),recorded=usePublicImageDimensions(source),known=width&&height?{width,height}:recorded;
 const knownWidth=known?.width,knownHeight=known?.height;
 const [orientation,setOrientation]=useState(()=>known?classify(known.width,known.height):'unknown');
 const [imageInfo,setImageInfo]=useState({source:'',width:0,height:0});
 const usingFallback=!!plan.fallback&&imageInfo.source===plan.fallback;
 const presentation=layout||(variant==='banner'?'framed':'natural');
 useEffect(()=>{const image=host.current?.querySelector('img');setFailed(!!host.current?.querySelector('.data-image-empty'));if(image?.complete&&image.naturalWidth){setImageInfo({source:image.getAttribute('src')||source,width:image.naturalWidth,height:image.naturalHeight});if(cacheAllowed)rememberPublicImageDimensions(image.getAttribute('src')||source,{width:image.naturalWidth,height:image.naturalHeight});setOrientation(classify(image.naturalWidth,image.naturalHeight));}else{setImageInfo({source:'',width:0,height:0});setOrientation(knownWidth&&knownHeight?classify(knownWidth,knownHeight):'unknown');}},[source,plan.fallback,knownWidth,knownHeight,cacheAllowed]);
 const reservation=imageInfo.source===source&&imageInfo.width?imageInfo:known||(imageInfo.width?imageInfo:undefined);
 const dimensions=reservation?{width:reservation.width,height:reservation.height}:{};
 const loadingImage=!imageInfo.width&&!failed;
 if(!source&&!original)return <div className="ps-adaptive-stage ps-adaptive-empty" data-layout={presentation} role="img" aria-label="No image available">No Image Available</div>;
 const imageContent=<>
    <ContentImage {...dimensions} src={source||original} fallbackSrc={plan.fallback} style={imageInfo.width?{maxWidth:imageInfo.width,maxHeight:imageInfo.height}:undefined} missingLabel="Image unavailable" alt={alt} loading={loading} fetchPriority={fetchPriority} decoding="async" referrerPolicy="no-referrer" onLoad={event=>{const image=event.currentTarget;setFailed(false);setImageInfo({source:image.getAttribute('src')||source,width:image.naturalWidth,height:image.naturalHeight});if(cacheAllowed)rememberPublicImageDimensions(image.getAttribute('src')||source,{width:image.naturalWidth,height:image.naturalHeight});setOrientation(classify(image.naturalWidth,image.naturalHeight));}} onUnavailable={()=>setFailed(true)} onError={()=>setFailed(true)}/>
    {presentation==='natural'&&loadingImage&&!reservation&&<span className="ps-image-load-placeholder">Loading image...</span>}
    {previewable&&!failed&&<span className="ps-adaptive-expand" aria-hidden="true"><Expand size={16}/> View image</span>}
 </>;
 return <>
  <div ref={host} className="ps-adaptive-stage" data-previewable={previewable} data-background="neutral" data-variant={variant} data-layout={presentation} data-orientation={orientation} data-reserve-space="true" data-image-state={failed?'failed':loadingImage?'loading':'loaded'} data-small-source={imageInfo.width>0&&imageInfo.width<480} data-source-kind={usingFallback?'fallback':plan.kind} style={presentation==='natural'?{width:reservation?'min(100%, '+reservation.width+'px)':'100%',maxWidth:reservation?.width}:undefined}>
   {previewable?<button ref={trigger} type="button" className="ps-adaptive-trigger" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-expanded={open} disabled={failed} aria-label={'View full image: '+alt} style={presentation==='natural'&&reservation?{aspectRatio:reservation.width+' / '+reservation.height}:undefined} data-known-size={!!reservation}>
    {imageContent}
   </button>:<div className="ps-adaptive-trigger" style={presentation==='natural'&&reservation?{aspectRatio:reservation.width+' / '+reservation.height}:undefined} data-known-size={!!reservation}>{imageContent}</div>}
   {presentation==='natural'&&!failed&&imageInfo.width>0&&(imageInfo.width<480||usingFallback)&&<small className="ps-image-source-note">{usingFallback?'Original unavailable. Saved image shown.':'Small source: '+imageInfo.width+' x '+imageInfo.height+' pixels.'}</small>}
  </div>
  {open&&<Suspense fallback={<div className="ps-image-opening" role="status">Opening image preview...</div>}><ImagePreview src={imageInfo.source||original||source} fallbackSrc={plan.fallback} notice={usingFallback?'The original could not load. This is the available saved image; missing detail cannot be restored.':imageInfo.width>0&&imageInfo.width<480?'Small source image: '+imageInfo.width+' x '+imageInfo.height+' pixels. Zoom cannot restore missing detail.':undefined} availableOnly={!plan.original||usingFallback} alt={alt} onClose={()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.focus());}}/></Suspense>}
 </>;
}
