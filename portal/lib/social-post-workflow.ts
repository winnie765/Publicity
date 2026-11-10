import type {Post} from '../app/model';
import {originalPostUrl} from './original-post-url';
import {postMetricKeys,metricReading,type PostMetricKey} from './post-measurements';
export {postMetricKeys,metricReading,type PostMetricKey} from './post-measurements';
export const socialMetricFields=(platform:string):{key:PostMetricKey;label:string}[]=>[
 ...(platform==='Facebook'?[{key:'views' as const,label:'Views'}]:[{key:'reach' as const,label:'Reach'},{key:'views' as const,label:'Views (if recorded)'}]),
 {key:'likes',label:platform==='Facebook'?'Likes / Reactions':'Likes'},{key:'comments',label:'Comments'},{key:'shares',label:'Shares'},{key:'saves',label:'Saves (if recorded)'},
 {key:'engagementTotal',label:'Reported Engagement Total (if provided)'},{key:'followersGenerated',label:'Verified Followers Generated'},{key:'incentiveCost',label:'Incentive Cost'}
];
export function metricProjection(post:Record<string,any>){return Object.fromEntries(postMetricKeys.map(key=>[key,metricReading(post,key)]));}
export function metricPatch(post:Post,patch:Record<string,unknown>):Post{
 const next={...post,reportedMetrics:post.reportedMetrics?[...post.reportedMetrics]:postMetricKeys.filter(key=>key!=='engagementTotal'&&metricReading(post,key)!==null)};
 for(const [key,value] of Object.entries(patch)){
  if(!postMetricKeys.includes(key as PostMetricKey))throw Error('Choose a supported measurement.');
  if(value!==null&&(typeof value!=='number'||!Number.isFinite(value)||value<0||value>Number.MAX_SAFE_INTEGER||key!=='incentiveCost'&&!Number.isInteger(value)))throw Error('Enter a non-negative number, or leave the measurement blank.');
  const metric=key as PostMetricKey;
  if(value===null){if(['views','engagementTotal'].includes(key))delete (next as any)[metric];else (next as any)[metric]=0;next.reportedMetrics=next.reportedMetrics.filter(item=>item!==key);}
  else{(next as any)[metric]=value;if(key!=='engagementTotal'&&!next.reportedMetrics.includes(key))next.reportedMetrics.push(key);}
 }
 return next;
}
const text=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
export function possibleDuplicatePosts(post:Post,existing:Post[]):Post[]{
 const url=originalPostUrl(post);
 return existing.filter(row=>row.id!==post.id&&row.platform===post.platform&&((url&&originalPostUrl(row)===url)||(post.title.trim()&&row.date===post.date&&text(row.account)===text(post.account)&&text(row.title)===text(post.title))));
}
export function importPostReview(posts:Post[],existing:Post[]){
 const updates=posts.filter(post=>existing.some(row=>row.id===post.id));
 const changed=updates.filter(post=>JSON.stringify(metricProjection(post))!==JSON.stringify(metricProjection(existing.find(row=>row.id===post.id)!)));
 const possible=posts.filter((post,index)=>possibleDuplicatePosts(post,[...existing,...posts.slice(0,index)]).length>0);
 return {updates:updates.length,metricChanges:changed.length,possibleDuplicates:possible.length};
}
