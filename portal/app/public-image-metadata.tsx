'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {validImageDimensions,type ImageDimensions} from '../lib/image-dimensions';
export const PublicImageDimensionsContext=createContext<Record<string,ImageDimensions>>({});
const PublicImageMemoryAllowedContext=createContext(false);
const memory=new Map<string,ImageDimensions>(),event='public-image-dimensions',key='public-image-dimensions-v1';
export function PublicImageMetadataProvider({dimensions,cache=false,children}:{dimensions?:Record<string,ImageDimensions>;cache?:boolean;children:ReactNode}){return <PublicImageMemoryAllowedContext.Provider value={cache}><PublicImageDimensionsContext.Provider value={dimensions||{}}>{children}</PublicImageDimensionsContext.Provider></PublicImageMemoryAllowedContext.Provider>;}
export function usePublicImageMemoryAllowed(){return useContext(PublicImageMemoryAllowedContext);}
export function rememberPublicImageDimensions(src:string,dimensions:ImageDimensions){
 if(!validImageDimensions(dimensions)||!src)return;
 const previous=memory.get(src);if(previous?.width===dimensions.width&&previous.height===dimensions.height)return;
 memory.set(src,dimensions);if(memory.size>200)memory.delete(memory.keys().next().value!);
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');saved[src]={...dimensions,at:Date.now()};const recent=Object.entries(saved).filter(([,v])=>Date.now()-(v as {at:number}).at<86400000).slice(-200);localStorage.setItem(key,JSON.stringify(Object.fromEntries(recent)));}catch{/* Disabled/full storage does not affect images. */}
 window.dispatchEvent(new CustomEvent(event,{detail:src}));
}
export function usePublicImageDimensions(src:string){
 const supplied=useContext(PublicImageDimensionsContext)[src],hasSupplied=validImageDimensions(supplied),allowed=usePublicImageMemoryAllowed(), [cached,setCached]=useState<{src:string;dimensions:ImageDimensions}>();
 useEffect(()=>{if(!allowed||hasSupplied)return;const update=()=>{let dimensions=memory.get(src);if(!dimensions)try{const item=JSON.parse(localStorage.getItem(key)||'{}')[src];if(item&&Date.now()-item.at<86400000&&validImageDimensions(item))dimensions={width:item.width,height:item.height};}catch{}if(dimensions)setCached({src,dimensions});};const changed=(e:Event)=>{if((e as CustomEvent).detail===src)update();};update();window.addEventListener(event,changed);return()=>window.removeEventListener(event,changed);},[src,allowed,hasSupplied]);
 return validImageDimensions(supplied)?supplied:allowed&&cached?.src===src?cached.dimensions:undefined;
}
