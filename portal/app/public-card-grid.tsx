'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {publicCardPositions} from '../lib/public-card-layout';
import './public-masonry.css';

/** Progressive enhancement: normal Grid remains readable without JS/ResizeObserver. */
export default function PublicCardGrid({children,className='ps-card-grid'}:{children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const grid=ref.current;if(!grid||typeof ResizeObserver==='undefined')return;
  let frame=0,disposed=false;
  const resetCard=(card:HTMLElement)=>{for(const key of ['position','width','left','top'])card.style.removeProperty(key);};
  const layout=()=>{
   frame=0;if(disposed)return;
   const cards=Array.from(grid.children).filter((node):node is HTMLElement=>node instanceof HTMLElement);
   const width=grid.clientWidth,gap=24;
   // Match the CSS fallback's 440px minimum; nested previews stay one column.
   const columns=grid.closest('.ps-programme-card,.ps-programme-learn,.cms-brand-card-preview')?1:Math.max(1,Math.floor((width+gap)/(440+gap)));
   if(columns<2||!width){delete grid.dataset.balanced;grid.style.removeProperty('height');grid.style.removeProperty('--ps-balanced-columns');cards.forEach(resetCard);return;}
   const cardWidth=(width-gap*(columns-1))/columns;
   for(const card of cards){const value=cardWidth+'px';if(card.style.width!==value)card.style.width=value;}
   const result=publicCardPositions(cards.map(card=>card.getBoundingClientRect().height),columns,gap);
   grid.dataset.balanced='true';grid.style.setProperty('--ps-balanced-columns',String(columns));
   cards.forEach((card,index)=>{
    const {top,column}=result.positions[index];
    card.style.position='absolute';card.style.left=column*(cardWidth+gap)+'px';card.style.top=top+'px';
   });
   const height=result.height+'px';if(grid.style.height!==height)grid.style.height=height;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(layout);};
  const observer=new ResizeObserver(schedule);
  const observe=()=>{observer.disconnect();observer.observe(grid);Array.from(grid.children).forEach(card=>observer.observe(card));schedule();};
  const mutation=new MutationObserver(observe);mutation.observe(grid,{childList:true});observe();
  return()=>{disposed=true;cancelAnimationFrame(frame);mutation.disconnect();observer.disconnect();delete grid.dataset.balanced;grid.style.removeProperty('height');grid.style.removeProperty('--ps-balanced-columns');Array.from(grid.children).forEach(card=>{if(card instanceof HTMLElement)resetCard(card);});};
 },[]);
 return <div ref={ref} className={className+' ps-masonry'}>{children}</div>;
}
