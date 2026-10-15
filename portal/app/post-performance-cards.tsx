'use client';
import {displayLabel,isSpecified} from './display-labels';
import type {Post} from './model';
import {engagement} from './model';
const number=(n:number|null|undefined)=>n==null?'Unavailable':new Intl.NumberFormat('en-SG',{maximumFractionDigits:1}).format(n);
export default function PostPerformanceCards({posts,platform,onOpen,score,compact=false}:{posts:Post[];platform?:string;onOpen?:(post:Post)=>void;score?:(post:Post)=>number|null;compact?:boolean}){
 const metric=(p:Post,key:'views'|'reach'|'likes'|'comments'|'shares')=>number(!p.reportedMetrics||p.reportedMetrics.includes(key)?p[key]:undefined);
 return <div className={'performance-list'+(compact?' compact':'')}>
 {posts.map((post,index)=><article className="post-performance" key={post.id}><div className="performance-meta"><span className="performance-rank">{String(index+1).padStart(2,'0')}</span><span>{displayLabel(post.brand)}</span><span>{displayLabel(post.type)}</span><time dateTime={post.date}>{new Date(post.date+'T12:00:00Z').toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'})}</time></div>{score&&(post.thumbnail_url||post.featured_image_url)&&<img className="performance-thumbnail" src={post.thumbnail_url||post.featured_image_url} alt={post.featured_image_alt_text||post.title} loading="lazy"/>}<h4 className="snapshot-title" title={post.title}>{onOpen?<button onClick={()=>onOpen(post)}>{post.title}</button>:post.title}</h4><div className="performance-result"><strong>{number(engagement(post))}</strong><span>engagements</span></div>{!compact&&<dl className="performance-details">{((platform||post.platform)==='Facebook'?['reach','views','likes','comments','shares']:(platform||post.platform)==='Workvivo'?['likes','comments']:['reach','likes','comments','shares']).map(key=><div key={key}><dt>{key}</dt><dd>{metric(post,key as 'views'|'reach'|'likes'|'comments'|'shares')}</dd></div>)}{score&&<div><dt>Top Hit Score</dt><dd>{number(score(post))}</dd></div>}</dl>}</article>)}
 {!posts.length&&<p className="empty">No measured posts match this selection.</p>}
 </div>;
}
