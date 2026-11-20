'use client';
import {useRef,useState,useEffect,lazy,Suspense} from 'react';
import {Expand} from 'lucide-react';
import {databaseImageSource} from '../lib/content-media';
import ContentImage from './content-image';
import './adaptive-public-image.css';

function PreviewUnavailable({src,onClose}:{src:string;onClose:()=>void}){useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[onClose]);return <div className="ps-image-opening" role="alert">Preview could not open. <a href={src} target="_blank" rel="noopener noreferrer">Open original</a> <button autoFocus onClick={onClose}>Close</button></div>;}
const ImagePreview=lazy(()=>import('./public-image-preview').catch(()=>({default:PreviewUnavailable})));

/** Natural images in content cards; banners/carousels may retain their framed composition. */
export default function AdaptivePublicImage({src,originalSrc,alt,variant='card',layout,width,height,loading='lazy',fetchPriority}:{src:string;originalSrc?:string;alt:string;variant?:'card'|'banner'|'gallery';layout?:'natural'|'framed';width?:number;height?:number;loading?:'lazy'|'eager';fetchPriority?:'high'|'low'|'auto'}){
 const trigger=useRef<HTMLButtonElement>(null),[failed,setFailed]=useState(false),[open,setOpen]=useState(false);
 const classify=(w:number,h:number)=>h>w*2.2?'poster':h>w*1.15?'portrait':w>h*1.15?'landscape':'square';
 const [orientation,setOrientation]=useState(()=>width&&height?classify(width,height):'unknown');
 const source=databaseImageSource(src),original=databaseImageSource(originalSrc||src);
 const presentation=layout||(variant==='banner'?'framed':'natural');
 useEffect(()=>{const image=trigger.current?.querySelector('img');setOrientation(image?.complete&&image.naturalWidth?classify(image.naturalWidth,image.naturalHeight):width&&height?classify(width,height):'unknown');},[source,width,height]);
 const dimensions=width&&height&&Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>0?{width,height}:{};
 if(!source&&!original)return <div className="ps-adaptive-stage ps-adaptive-empty" data-layout={presentation} role="img" aria-label="No image available">No Image Available</div>;
 return <>
  <div className="ps-adaptive-stage" data-background="neutral" data-variant={variant} data-layout={presentation} data-orientation={orientation}>
   <button ref={trigger} type="button" className="ps-adaptive-trigger" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-expanded={open} disabled={failed} aria-label={'View full image: '+alt}>
    <ContentImage {...dimensions} src={source||original} fallbackSrc={original} alt={alt} loading={loading} fetchPriority={fetchPriority} decoding="async" referrerPolicy="no-referrer" onLoad={event=>{setFailed(false);setOrientation(classify(event.currentTarget.naturalWidth,event.currentTarget.naturalHeight));}} onError={()=>setFailed(true)}/>
    {!failed&&<span className="ps-adaptive-expand" aria-hidden="true"><Expand size={16}/> View image</span>}
   </button>
  </div>
  {open&&<Suspense fallback={<div className="ps-image-opening" role="status">Opening image preview...</div>}><ImagePreview src={original||source} alt={alt} onClose={()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.focus());}}/></Suspense>}
 </>;
}
