'use client';
import {useEffect,useState} from 'react';
import {ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import type {GalleryImage} from '../lib/content-media';
export default function HeroSlideshow({slides}:{slides:GalleryImage[]}){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[interacting,setInteracting]=useState(false);
 const signature=slides.map(slide=>slide.url).join('|');useEffect(()=>setIndex(0),[signature]);
 useEffect(()=>{if(slides.length<2||paused||interacting||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')setIndex(current=>(current+1)%slides.length)},6000);return()=>clearInterval(timer)},[slides.length,paused,interacting]);
 const active=Math.min(index,slides.length-1);if(active<0)return null;
 return <div className="ps-hero-slideshow" role="region" aria-roledescription="carousel" aria-label="Hero banner images" onMouseEnter={()=>setInteracting(true)} onMouseLeave={()=>setInteracting(false)} onFocusCapture={()=>setInteracting(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setInteracting(false)}}><div className="ps-hero-slides">{slides.map((slide,i)=><img key={slide.url+'-'+i} src={slide.url} alt={slide.alt||'Community banner '+(i+1)} className={i===active?'active':''} aria-hidden={i!==active} loading={i===0?'eager':'lazy'}/>)}</div>{slides.length>1&&<div className="ps-hero-carousel-controls"><button type="button" aria-label="Previous banner" onClick={()=>setIndex((active-1+slides.length)%slides.length)}><ChevronLeft size={20}/></button><span aria-live={paused?'polite':'off'}>{active+1} / {slides.length}</span><button type="button" aria-label="Next banner" onClick={()=>setIndex((active+1)%slides.length)}><ChevronRight size={20}/></button><button type="button" aria-label={paused?'Play slideshow':'Pause slideshow'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={18}/>:<Pause size={18}/>}</button></div>}</div>;
}
