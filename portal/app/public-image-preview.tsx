'use client';
import {useState} from 'react';
import {Dialog} from 'radix-ui';
import {ZoomIn,ZoomOut,X} from 'lucide-react';
import ContentImage from './content-image';
export default function PublicImagePreview({src,alt,onClose}:{src:string;alt:string;onClose:()=>void}){const [zoomed,setZoomed]=useState(false);return (  <Dialog.Root open onOpenChange={value=>{if(!value)onClose();}}><Dialog.Portal><Dialog.Overlay className="ps-image-dialog-overlay"/><Dialog.Content className="ps-image-dialog" onCloseAutoFocus={event=>event.preventDefault()}>
   <div className="ps-image-dialog-toolbar"><Dialog.Title>Image preview</Dialog.Title><div>
    <button type="button" onClick={()=>setZoomed(value=>!value)} aria-pressed={zoomed} aria-label={zoomed?'Fit complete image':'Zoom image'}>{zoomed?<ZoomOut size={20}/>:<ZoomIn size={20}/>}<span>{zoomed?'Fit image':'Zoom'}</span></button>
    <a href={src} target="_blank" rel="noopener noreferrer">Open original</a>
    <Dialog.Close className="ps-image-dialog-close" aria-label="Close image preview"><X size={22}/></Dialog.Close>
   </div></div>
   <Dialog.Description className="ps-image-sr-only">{alt}. The complete image is shown. Zoom to inspect details; scroll to move around. Press Escape to close.</Dialog.Description>
   <div className="ps-image-viewport" tabIndex={0} aria-label="Image viewing area" data-zoomed={zoomed}><div className="ps-image-zoom-surface"><ContentImage src={src} alt={alt} decoding="async" referrerPolicy="no-referrer"/></div></div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>);}
