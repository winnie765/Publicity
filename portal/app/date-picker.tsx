'use client';
import {useState,useRef,useEffect} from 'react';
import {DayPicker,type DateRange} from 'react-day-picker';
import 'react-day-picker/style.css';
const parse=(s:string)=>s?new Date(s+'T12:00:00'):undefined;
const iso=(d?:Date)=>d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';
const label=(s:string)=>parse(s)?.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'})||'Choose date';
export function DatePicker({value,onChange,label:aria}:{value:string;onChange:(v:string)=>void;label:string}){
 const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 return <div className="calendar-control" ref={ref}><button type="button" className="button" aria-label={aria} aria-expanded={open} onClick={()=>setOpen(!open)}>{label(value)}</button>{open&&<div className="calendar-popup" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}}}><DayPicker mode="single" captionLayout="dropdown" startMonth={new Date(1900,0)} endMonth={new Date(2100,11)} defaultMonth={parse(value)} selected={parse(value)} onSelect={d=>{if(d){onChange(iso(d));setOpen(false)}}} required/><button type="button" className="text-button" onClick={()=>setOpen(false)}>Close calendar</button></div>}</div>;
}
export function DateRangePicker({start,end,onChange}:{start:string;end:string;onChange:(start:string,end:string)=>void}){
 const [open,setOpen]=useState(false);return <div className="calendar-control"><button type="button" className="button" aria-label="Select date range" aria-expanded={open} onClick={()=>setOpen(!open)}>{label(start)} — {label(end)}</button>{open&&<div className="calendar-popup"><DayPicker mode="range" captionLayout="dropdown" startMonth={new Date(1900,0)} endMonth={new Date(2100,11)} defaultMonth={parse(start)} selected={{from:parse(start),to:parse(end)}} onSelect={(r:DateRange|undefined)=>{onChange(iso(r?.from),iso(r?.to))}}/><button type="button" className="button" onClick={()=>setOpen(false)}>Apply range</button></div>}</div>;
}
