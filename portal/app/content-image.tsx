'use client';
import {useEffect,useState,type ImgHTMLAttributes} from 'react';
import './content-image.css';
import {databaseImageSource} from '../lib/content-media';
export default function ContentImage({src,alt='',className='',onError,onLoad,missingLabel='No Image Available',fallbackSrc,...props}:ImgHTMLAttributes<HTMLImageElement>&{missingLabel?:string;fallbackSrc?:string}){
 const primary=databaseImageSource(typeof src==='string'?src:''),fallback=databaseImageSource(fallbackSrc||''),[failed,setFailed]=useState<string[]>([]);useEffect(()=>setFailed([]),[primary,fallback]);
 const source=primary&&!failed.includes(primary)?primary:fallback&&!failed.includes(fallback)?fallback:'';
 if(!source)return <span className={'data-image-empty '+className} role="img" aria-label={missingLabel}>{missingLabel}</span>;
 return <img {...props} src={source} alt={alt} className={'cc-adaptive-image '+className} data-image-source={source} decoding={props.decoding||'async'} loading={props.loading||(props.fetchPriority==='high'?'eager':'lazy')} onLoad={event=>{const image=event.currentTarget;image.dataset.imageOrientation=image.naturalHeight>image.naturalWidth*1.25?'portrait':image.naturalWidth>image.naturalHeight*1.25?'landscape':'square';onLoad?.(event);}} onError={event=>{setFailed(current=>[...current,source]);onError?.(event)}}/>;
}
