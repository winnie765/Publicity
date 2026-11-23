'use client';
import {useRef,useState,useEffect,lazy,Suspense} from 'react';
import {Expand} from 'lucide-react';
import {publicImageSources} from '../lib/public-image-source';
import ContentImage from './content-image';
import './adaptive-public-image.css';

function PreviewUnavailable({src,onClose}:{src:string;onClose:()=>void}){useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[onClose]);return <div className="ps-image-opening" role="alert">Preview could not open. <a href={src} target="_blank" rel="noopener noreferrer">Open original</a> <button autoFocus onClick={onClose}>Close</button></div>;}
const ImagePreview=lazy(()=>import('./public-image-preview').catch(()=>({default:PreviewUnavailable})));

/** Natural images in content cards; banners/carousels may retain their framed composition. */
export default function AdaptivePublicImage({src,originalSrc,alt,variant='card',layout,width,height,loading='lazy',fetchPriority}:{src:string;originalSrc?:string;alt:string;variant?:'card'|'banner'|'gallery';layout?:'natural'|'framed';width?:number;height?:number;loading?:'lazy'|'eager';fetchPriority?:'high'|'low'|'auto'}){
 const trigger=useRef<HTMLButtonElement>(null),[failed,setFailed]=useState(false),[open,setOpen]=useState(false);
 const classify=(w:number,h:number)=>h>w*2.2?'poster':h>w*1.15?'portrait':w>h*1.15?'landscape':'square';
 const [orientation,setOrientation]=useState(()=>width&&height?classify(width,height):'unknown');
 const plan=publicImageSources(src,originalSrc||''),source=plan.primary,original=plan.original||source;
 const [imageInfo,setImageInfo]=useState({source:'',width:0,height:0});
 const usingFallback=!!plan.fallback&&imageInfo.source===plan.fallback;
 const presentation=layout||(variant==='banner'?'framed':'natural');
 useEffect(()=>{const image=trigger.current?.querySelector('img');setFailed(!!trigger.current?.querySelector('.data-image-empty'));if(image?.complete&&image.naturalWidth){setImageInfo({source:image.getAttribute('src')||source,width:image.naturalWidth,height:image.naturalHeight});setOrientation(classify(image.naturalWidth,image.naturalHeight));}else{setImageInfo({source:'',width:0,height:0});setOrientation(width&&height?classify(width,height):'unknown');}},[source,plan.fallback,width,height]);
 const dimensions=width&&height&&Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>0?{width,height}:{};
 if(!source&&!original)return <div className="ps-adaptive-stage ps-adaptive-empty" data-layout={presentation} role="img" aria-label="No image available">No Image Available</div>;
 return <>
  <div className="ps-adaptive-stage" data-background="neutral" data-variant={variant} data-layout={presentation} data-orientation={orientation} data-small-source={imageInfo.width>0&&imageInfo.width<480} data-source-kind={usingFallback?'fallback':plan.kind} style={presentation==='natural'&&imageInfo.width?{maxWidth:imageInfo.width}:undefined}>
   <button ref={trigger} type="button" className="ps-adaptive-trigger" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-expanded={open} disabled={failed} aria-label={'View full image: '+alt}>
    <ContentImage {...dimensions} src={source||original} fallbackSrc={plan.fallback} alt={alt} loading={loading} fetchPriority={fetchPriority} decoding="async" referrerPolicy="no-referrer" onLoad={event=>{const image=event.currentTarget;setFailed(false);setImageInfo({source:image.getAttribute('src')||source,width:image.naturalWidth,height:image.naturalHeight});setOrientation(classify(image.naturalWidth,image.naturalHeight));}} onError={()=>setFailed(true)}/>
    {!failed&&<span className="ps-adaptive-expand" aria-hidden="true"><Expand size={16}/> View image</span>}
   </button>
   {presentation==='natural'&&!failed&&imageInfo.width>0&&(imageInfo.width<480||usingFallback)&&<small className="ps-image-source-note">{usingFallback?'Original unavailable. Saved image shown.':'Small source: '+imageInfo.width+' x '+imageInfo.height+' pixels.'}</small>}
  </div>
  {open&&<Suspense fallback={<div className="ps-image-opening" role="status">Opening image preview...</div>}><ImagePreview src={imageInfo.source||original||source} fallbackSrc={plan.fallback} notice={usingFallback?'The original could not load. This is the available saved image; missing detail cannot be restored.':imageInfo.width>0&&imageInfo.width<480?'Small source image: '+imageInfo.width+' x '+imageInfo.height+' pixels. Zoom cannot restore missing detail.':undefined} availableOnly={!plan.original||usingFallback} alt={alt} onClose={()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.focus());}}/></Suspense>}
 </>;
}
