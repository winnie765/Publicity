'use client';
import {useState} from 'react';
import {Dialog} from 'radix-ui';
import {ZoomIn,ZoomOut,X} from 'lucide-react';
import ContentImage from './content-image';
export default function PublicImagePreview({src,fallbackSrc,notice,availableOnly=false,alt,onClose}:{src:string;fallbackSrc?:string;notice?:string;availableOnly?:boolean;alt:string;onClose:()=>void}){const [zoomed,setZoomed]=useState(false),[available,setAvailable]=useState(src),[failed,setFailed]=useState(false);return (  <Dialog.Root open onOpenChange={value=>{if(!value)onClose();}}><Dialog.Portal><Dialog.Overlay className="ps-image-dialog-overlay"/><Dialog.Content className="ps-image-dialog" onCloseAutoFocus={event=>event.preventDefault()}>
   <div className="ps-image-dialog-toolbar"><Dialog.Title>Image preview</Dialog.Title><div>
    <button type="button" onClick={()=>setZoomed(value=>!value)} aria-pressed={zoomed} aria-label={zoomed?'Fit complete image':'Zoom image'}>{zoomed?<ZoomOut size={20}/>:<ZoomIn size={20}/>}<span>{zoomed?'Fit image':'Zoom'}</span></button>
    <a href={available} target="_blank" rel="noopener noreferrer">{availableOnly||available!==src?'Open available image':'Open original'}</a>
    <Dialog.Close className="ps-image-dialog-close" aria-label="Close image preview"><X size={22}/></Dialog.Close>
   </div></div>
   <Dialog.Description className="ps-image-sr-only">{alt}. The available image is shown without additional cropping. Zoom to inspect details; scroll to move around. Press Escape to close.</Dialog.Description>
   {(notice||failed||available!==src)&&<p className="ps-image-source-note" role="status">{failed?'Image could not load. The saved source may be unavailable.':notice||'The original could not load. Showing the available saved image.'}</p>}
   <div className="ps-image-viewport" tabIndex={0} aria-label="Image viewing area" data-zoomed={zoomed}><div className="ps-image-zoom-surface"><ContentImage src={src} fallbackSrc={fallbackSrc} missingLabel="Image could not be loaded." alt={alt} decoding="async" referrerPolicy="no-referrer" onLoad={event=>{setFailed(false);setAvailable(event.currentTarget.getAttribute('src')||src);}} onUnavailable={()=>setFailed(true)} onError={()=>setFailed(true)}/></div></div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>);}
