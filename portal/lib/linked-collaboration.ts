import type {Post} from '../app/model';
import {normalisedPostUrl,samePublishedPost} from './post-identity';
const text=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const names=(p:Post)=>new Set((p.collaborating_with||'').split(';').map(text).filter(Boolean));
const similar=(a:string,b:string)=>{const x=new Set(text(a).split(' ').filter(s=>s.length>2)),y=new Set(text(b).split(' ').filter(s=>s.length>2));return x.size>=2&&y.size>=2&&[...x].filter(v=>y.has(v)).length/Math.max(x.size,y.size)>=.65;};
export function collaborationMembers(post:Post,posts:Post[]):Post[]{
 const all=[...posts.filter(p=>p.id!==post.id),post],graph=new Map<string,Set<string>>();
 for(const row of all)for(const id of row.linked_post_ids||[]){if(!graph.has(row.id))graph.set(row.id,new Set());if(!graph.has(id))graph.set(id,new Set());graph.get(row.id)!.add(id);graph.get(id)!.add(row.id);}
 const ids=new Set([post.id]),pending=[post.id];while(pending.length){for(const id of graph.get(pending.pop()!)||[])if(!ids.has(id)){ids.add(id);pending.push(id);}}
 return posts.filter(p=>p.id!==post.id&&ids.has(p.id));
}
export type CollaborationMatch={post:Post;confirmed:boolean;reasons:string[]};
export function collaborationMatches(post:Post,posts:Post[]):CollaborationMatch[]{
 const members=new Set(collaborationMembers(post,posts).map(p=>p.id));
 return posts.filter(p=>p.id!==post.id&&['Facebook','Instagram'].includes(p.platform)).flatMap(row=>{
  const confirmed=samePublishedPost(post,row),reasons:string[]=[];
  if(confirmed)reasons.push('Same platform post identity');
  const url=normalisedPostUrl(post);if(!confirmed&&url&&row.platform===post.platform&&url===normalisedPostUrl(row))reasons.push('Matching URL; verify publication identity');
  if(members.has(row.id))reasons.push('Linked collaboration');
  const days=Math.abs(Date.parse(post.date)-Date.parse(row.date))/86400000,near=Number.isFinite(days)&&days<=7;
  const title=similar(post.title,row.title),caption=similar(post.description||'',row.description||''),stakeholder=[...names(post)].some(n=>names(row).has(n));
  const exact=!!text(post.title)&&text(post.title)===text(row.title)&&post.date===row.date&&post.account===row.account&&post.platform===row.platform;
  if(near&&(title||caption)||exact){reasons.push('Similar '+(title||exact?'title':'caption')+' within seven days');if(stakeholder)reasons.push('Shared configured stakeholder names');}
  if(!reasons.length)return [];
  return [{post:row,confirmed,reasons}];
 }).sort((a,b)=>Number(b.confirmed)-Number(a.confirmed)||a.post.id.localeCompare(b.post.id));
}
export function validateCollaborationLinks(post:Post,posts:Post[],previous?:Post){
 if(post.linked_post_ids===undefined)return;
 if(!Array.isArray(post.linked_post_ids)||post.linked_post_ids.length>100||new Set(post.linked_post_ids).size!==post.linked_post_ids.length||post.linked_post_ids.some(id=>typeof id!=='string'||id.length>100||id===post.id))throw Error('Choose up to 100 distinct related post records.');
 for(const id of post.linked_post_ids){const row=posts.find(p=>p.id===id);if(!row){if(previous?.linked_post_ids?.includes(id))continue;throw Error('A related post no longer exists. Refresh and review the collaboration.');}if(!['Facebook','Instagram'].includes(row.platform)||!['Facebook','Instagram'].includes(post.platform))throw Error('Link only Facebook and Instagram publications.');if(!previous?.linked_post_ids?.includes(id)&&samePublishedPost(post,row))throw Error('This is the same platform publication. Edit the existing post instead of linking a duplicate.');if(!previous?.linked_post_ids?.includes(id)&&!post.is_collaboration_post)throw Error('Enable Collaboration Post before adding a relationship.');}
}
