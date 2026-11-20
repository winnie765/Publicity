'use client';
import {useRef,useState,useEffect,lazy,Suspense} from 'react';
import {Expand} from 'lucide-react';
import {databaseImageSource} from '../lib/content-media';
import ContentImage from './content-image';
import './adaptive-public-image.css';

function PreviewUnavailable({src,onClose}:{src:string;onClose:()=>void}){useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[onClose]);return <div className="ps-image-opening" role="alert">Preview could not open. <a href={src} target="_blank" rel="noopener noreferrer">Open original</a> <button autoFocus onClick={onClose}>Close</button></div>;}
const ImagePreview=lazy(()=>import('./public-image-preview').catch(()=>({default:PreviewUnavailable})));

/** A reserved stage and an uncropped foreground; the blur reuses decoded pixels, not a second URL. */
export default function AdaptivePublicImage({src,originalSrc,alt,background='blur'}:{src:string;originalSrc?:string;alt:string;background?:'blur'|'neutral'}){
 const canvas=useRef<HTMLCanvasElement>(null),trigger=useRef<HTMLButtonElement>(null),[failed,setFailed]=useState(false),[open,setOpen]=useState(false);
 const source=databaseImageSource(src),original=databaseImageSource(originalSrc||src);
 if(!source&&!original)return <div className="ps-adaptive-stage ps-adaptive-empty" role="img" aria-label="No image available">No Image Available</div>;
 return <>
  <div className="ps-adaptive-stage" data-background={background}>
   {background==='blur'&&<canvas ref={canvas} width={96} height={64} className="ps-adaptive-backdrop" aria-hidden="true"/>}
   <button ref={trigger} type="button" className="ps-adaptive-trigger" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-expanded={open} disabled={failed} aria-label={'View full image: '+alt}>
    <ContentImage src={source||original} fallbackSrc={original} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onLoad={event=>{
     setFailed(false);const image=event.currentTarget,context=canvas.current?.getContext('2d');
     if(context&&image.naturalWidth&&image.naturalHeight){const scale=Math.max(96/image.naturalWidth,64/image.naturalHeight),width=image.naturalWidth*scale,height=image.naturalHeight*scale;context.clearRect(0,0,96,64);context.drawImage(image,(96-width)/2,(64-height)/2,width,height);}
    }} onError={()=>{setFailed(true);canvas.current?.getContext('2d')?.clearRect(0,0,96,64);}}/>
    {!failed&&<span className="ps-adaptive-expand" aria-hidden="true"><Expand size={16}/> View image</span>}
   </button>
  </div>
  {open&&<Suspense fallback={<div className="ps-image-opening" role="status">Opening image preview...</div>}><ImagePreview src={original||source} alt={alt} onClose={()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.focus());}}/></Suspense>}
 </>;
}
