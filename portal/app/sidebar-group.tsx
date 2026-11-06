'use client';
import Link from 'next/link';
import {useEffect,useState,type ReactNode} from 'react';
import {ChevronDown,type LucideIcon} from 'lucide-react';
import './sidebar-group.css';
export default function SidebarGroup({id,label,icon:Icon,href,active,children,defaultOpen=true,current=false}:{id:string;label:string;icon:LucideIcon;href?:string;active:boolean;children:ReactNode;defaultOpen?:boolean;current?:boolean}){
 const [open,setOpen]=useState(defaultOpen||active),controls=id+'-navigation';
 useEffect(()=>{if(active)setOpen(true);},[active]);
 const content=<><Icon size={18}/><span>{label}</span></>;
 return <div className="sidebar-group"><div className={'sidebar-group-head '+(active?'active':'')}>{href?<Link href={href} className="sidebar-group-label" aria-current={current?'page':undefined}>{content}</Link>:<button type="button" className="sidebar-group-label" aria-expanded={open} aria-controls={controls} onClick={()=>setOpen(v=>!v)}>{content}</button>}<button type="button" className="sidebar-group-toggle" aria-label={(open?'Collapse ':'Expand ')+label} aria-expanded={open} aria-controls={controls} onClick={()=>setOpen(v=>!v)}><ChevronDown size={14} className={open?'is-open':''}/></button></div><div id={controls} className={'sidebar-group-panel '+(open?'is-open':'')} aria-hidden={!open} inert={!open}><div className="sidebar-group-clip"><div className="analytics-subnav">{children}</div></div></div></div>;
}
