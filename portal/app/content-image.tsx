'use client';
import {useEffect,useRef,useState,type ImgHTMLAttributes} from 'react';
import './content-image.css';
import {databaseImageSource} from '../lib/content-media';
export default function ContentImage({src,alt='',className='',onError,onLoad,missingLabel='No Image Available',fallbackSrc,...props}:ImgHTMLAttributes<HTMLImageElement>&{missingLabel?:string;fallbackSrc?:string}){
 const primary=databaseImageSource(typeof src==='string'?src:''),fallback=databaseImageSource(fallbackSrc||'');
 const imageRef=useRef<HTMLImageElement>(null);
 const [failure,setFailure]=useState({primary,fallback,urls:[] as string[]});
 const failed=failure.primary===primary&&failure.fallback===fallback?failure.urls:[];
 const source=primary&&!failed.includes(primary)?primary:fallback&&!failed.includes(fallback)?fallback:'';
 // Cached SSR failures may finish before React attaches onError. Inspect the
 // mounted element as well as events, and retain failures for this source pair.
 useEffect(()=>setFailure(current=>{
  const same=current.primary===primary&&current.fallback===fallback;
  let urls=same?current.urls:[];const image=imageRef.current,loaded=image?.getAttribute('src')||'';
  if(image?.complete&&!image.naturalWidth&&loaded&&(loaded===primary||loaded===fallback)&&!urls.includes(loaded))urls=[...urls,loaded];
  return same&&urls===current.urls?current:{primary,fallback,urls};
 }),[primary,fallback,source]);
 if(!source)return <span className={'data-image-empty '+className} role="img" aria-label={missingLabel}>{missingLabel}</span>;
 return <img {...props} ref={imageRef} src={source} alt={alt} className={'cc-adaptive-image '+className} data-image-source={source} decoding={props.decoding||'async'} loading={props.loading||(props.fetchPriority==='high'?'eager':'lazy')} onLoad={event=>{const image=event.currentTarget;image.dataset.imageOrientation=image.naturalHeight>image.naturalWidth*1.25?'portrait':image.naturalWidth>image.naturalHeight*1.25?'landscape':'square';onLoad?.(event);}} onError={event=>{setFailure(current=>({primary,fallback,urls:[...(current.primary===primary&&current.fallback===fallback?current.urls:[]),source]}));onError?.(event)}}/>;
}
