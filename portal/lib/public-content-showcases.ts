import type {Post} from '../app/model';
import type {PublicStory} from '../app/public-components';
import {contentMetricValue} from './post-content-intelligence';
export type ShowcaseRanking='automatic'|'engagement'|'reach'|'views'|'interactions';
export type ShowcasePeriod='30d'|'90d'|'ytd';
export type PublicShowcaseSelection={performance:string[];engagement:string[];reach:string[];views:string[];featured:string[];trending:string[]};
export type PublicShowcases={asOf:string;latestPosts:string[];latestStories:string[];latestHighlights:string[];periods:Record<ShowcasePeriod,PublicShowcaseSelection>};
/** Return only IDs already present in the approved public feed. Private measurements never leave the server. */
export function publicContentShowcases(stories:PublicStory[],posts:Post[],sourceByStory:Record<string,string>,today:string,limit:number=6):PublicShowcases{
 limit=[3,6,9,12].includes(limit)?limit:6;
 const approved=stories.filter(story=>story.platform!=='Workvivo'&&story.date<=today),byPost=new Map(posts.filter(post=>post.status!=='draft'&&['Facebook','Instagram'].includes(post.platform)&&post.date<=today).map(post=>[post.id,post]));
 const source=(story:PublicStory)=>byPost.get(sourceByStory[story.id]||(story.id.startsWith('post-')?story.id.slice(5):''));
 const postDate=(story:PublicStory)=>source(story)?.date||story.date;
 const uniquePosts=(rows:PublicStory[])=>{const seen=new Set<string>();return rows.filter(story=>{const key=source(story)?.id||story.id;if(seen.has(key))return false;seen.add(key);return true;});};
 const latest=(rows:PublicStory[])=>uniquePosts([...rows].sort((a,b)=>postDate(b).localeCompare(postDate(a))||a.id.localeCompare(b.id))).slice(0,limit).map(story=>story.id);
 const baselineKeys=(post:Post)=>['platform:'+post.platform,'brand:'+post.platform+'|'+post.brand,'format:'+post.platform+'|'+post.type],baselines=new Map<string,{sum:number;count:number}>();
 for(const post of byPost.values())for(const metric of ['engagement','reach','views'] as const){const value=contentMetricValue(post,metric);if(value===null)continue;for(const dimension of baselineKeys(post)){const key=metric+'|'+dimension,group=baselines.get(key)||{sum:0,count:0};group.sum+=value;group.count++;baselines.set(key,group);}}
 const periods={} as PublicShowcases['periods'];
 for(const period of ['30d','90d','ytd'] as const){const date=new Date(today+'T00:00:00Z');if(period==='ytd'){date.setUTCMonth(0,1)}else date.setUTCDate(date.getUTCDate()-(period==='30d'?29:89));const start=date.toISOString().slice(0,10),rows=uniquePosts(approved.filter(story=>postDate(story)>=start&&postDate(story)<=today));
  const ranked=(key:'engagement'|'reach'|'views'|'shares')=>rows.flatMap(story=>{const post=source(story),value=post?contentMetricValue(post,key):null;return value!==null&&value>0?[{id:story.id,value,date:story.date}]:[]}).sort((a,b)=>b.value-a.value||b.date.localeCompare(a.date)||a.id.localeCompare(b.id)).slice(0,limit).map(row=>row.id);
  const trending=rows.flatMap(story=>{const post=source(story);if(!post||!post.brand||post.brand==='Unclassified'||!post.type||post.type==='Unclassified')return [];const scores=(['engagement','reach','views'] as const).flatMap(metric=>{const value=contentMetricValue(post,metric);if(value===null)return [];const ratios=baselineKeys(post).map(dimension=>{const group=baselines.get(metric+'|'+dimension),count=(group?.count||0)-1,average=group&&count>=3?(group.sum-value)/count:null;return average!==null&&average>0?value/average:null;});return ratios.every(ratio=>ratio!==null&&ratio>=1.5)?[Math.min(...ratios as number[])]:[];});return scores.length?[{id:story.id,score:Math.max(...scores)}]:[];}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit).map(row=>row.id);
  const administrator=uniquePosts(approved).filter(story=>{const post=source(story);return story.pinned||story.featuredStory||story.featuredContent||story.featured||post?.show_on_home_page||post?.show_in_community_highlights;}).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||postDate(b).localeCompare(postDate(a))).map(story=>story.id);
  const performance=[...new Set([...ranked('engagement'),...ranked('views'),...ranked('reach')])].slice(0,limit);
  periods[period]={performance,engagement:ranked('engagement'),reach:ranked('reach'),views:ranked('views'),featured:[...new Set([...administrator,...ranked('engagement'),...ranked('views'),...ranked('reach'),...ranked('shares')])].slice(0,limit),trending};
 }
 return {asOf:today,latestPosts:latest(approved.filter(story=>['Facebook','Instagram'].includes(story.platform))),latestStories:latest(approved.filter(story=>story.showInStories!==false)),latestHighlights:latest(approved.filter(story=>story.featured)),periods};
}
