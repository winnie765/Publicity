'use client';
import {useState} from 'react';
import {ExternalLink} from 'lucide-react';
import type {IndustryArticle,SourceStatus} from '../lib/industry-trends';

// Presentation only: mixed-case source titles are left untouched.
export function readableHeadline(title:string){
 if(title!==title.toLocaleUpperCase('en')||!/[A-Z]/.test(title))return title;
 const acronyms=new Set(['MOH','AIC','IMDA','HPB','CSA','WHO','NCSS','MSF','HDB','NUHS','NAC','PA','SG','AI','IT','ICT','COVID','COVID-19','SARS','HIV','AIDS','UN','UK','US','USA','NHS','SCIE','GLOW','SEEN','NTUC','SMS','MCI','MCCY','MOM','PM','DPM','MP','MPS','SDP','PAP','CHAS','CPF','GST','CNA']);
 return title.replace(/[A-Z]+(?:[-?'][A-Z]+)*/g,word=>acronyms.has(word)?word:word[0]+word.slice(1).toLowerCase());
}
const timestamp=(value?:string)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString('en-SG',{timeZone:'Asia/Singapore',dateStyle:'medium',timeStyle:'short'}):'Not recorded';
export default function IndustryArticleCard({article:a,source,selected,disabled,onToggle}:{article:IndustryArticle;source?:SourceStatus;selected:boolean;disabled:boolean;onToggle:()=>void}){
 const [expanded,setExpanded]=useState(false);
 const dateOnly=a.datePrecision==='day'||a.date.length===10;
 return <article className={'it-card it-news-card'+(selected?' is-selected':'')}>
  <header className="it-news-meta"><strong>{a.source}</strong><span>{a.region==='Singapore'?'Singapore':'International'}</span><time dateTime={a.date}>{new Date(a.date).toLocaleDateString('en-SG',{timeZone:dateOnly?'UTC':'Asia/Singapore',dateStyle:'medium'})}</time></header>
  <div className="it-news-content"><h3 className={expanded||a.title.length<=80?'':'is-clamped'}>{readableHeadline(a.title)}</h3>{a.title.length>80&&<button className="it-text-action" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Show less':'Show full headline'}</button>}
  {a.description&&<p className="it-news-summary">{a.description}</p>}
  {!!a.topics.length&&<div className="it-tags">{a.topics.map(t=><span key={t}>{t}</span>)}</div>}</div>
  <footer className="it-news-footer"><div className="it-news-actions"><label className="it-select"><input type="checkbox" checked={selected} disabled={disabled} onChange={onToggle}/>Use for Content Ideas</label><a className="button" href={a.url} target="_blank" rel="noopener noreferrer">Read Original Article<ExternalLink size={15} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a></div>
  <details><summary>Source Details</summary><dl><dt>Original headline</dt><dd>{a.title}</dd><dt>Published</dt><dd>{dateOnly?new Date(a.date).toLocaleDateString('en-SG',{timeZone:'UTC',dateStyle:'medium'})+' (publisher supplied date only)':timestamp(a.date)+' (Singapore time)'}</dd><dt>Retrieved</dt><dd>{timestamp(a.retrievedAt)} (Singapore time)</dd><dt>Source last successful check</dt><dd>{timestamp(source?.lastSuccessAt)} (Singapore time)</dd><dt>Source status</dt><dd>{source?source.status==='available'?'Source available':'Cached article retained; '+source.status.replaceAll('_',' '):'Not recorded'}</dd></dl></details></footer>
 </article>;
}
