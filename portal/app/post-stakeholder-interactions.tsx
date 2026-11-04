'use client';
import Link from 'next/link';
import type {Interaction} from './model';
export default function PostStakeholderInteractions({postId,interactions}:{postId:string;interactions:Interaction[]}){
 const rows=interactions.filter(item=>item.postId===postId||item.post_id===postId).sort((a,b)=>b.date.localeCompare(a.date));
 return <section className="post-stakeholder-interactions"><h3>Stakeholder Interactions</h3>{rows.length?<ul>{rows.map(item=><li key={item.id}><strong>{item.stakeholder}</strong>  /  {({Like:'Liked',Comment:'Commented',Share:'Shared',Mention:'Mentioned',Repost:'Reposted'} as Record<string,string>)[item.type]||item.type}{item.count>1?'  /  '+item.count:''}<time dateTime={item.date}>  /  {item.date}</time>{item.notes&&<p>{item.notes}</p>}</li>)}</ul>:<p>No stakeholder interactions recorded.</p>}<Link className="button" href={'/workspace/publicity?post='+encodeURIComponent(postId)}>Record Stakeholder Interaction</Link></section>;
}
