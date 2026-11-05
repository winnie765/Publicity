import type {Post} from '../app/model';
import type {PublicStory} from '../app/public-components';
import {contentMetricValue} from './post-content-intelligence';
export type ShowcasePeriod='30d'|'90d'|'ytd';
export type PublicShowcaseSelection={engagement:string[];reach:string[];views:string[];featured:string[];trending:string[]};
export type PublicShowcases={asOf:string;latestPosts:string[];latestStories:string[];latestHighlights:string[];periods:Record<ShowcasePeriod,PublicShowcaseSelection>};
/** Return only IDs already present in the approved public feed. Private measurements never leave the server. */
export function publicContentShowcases(stories:PublicStory[],posts:Post[],sourceByStory:Record<string,string>,today:string):PublicShowcases{
 const approved=stories.filter(story=>story.platform!=='Workvivo'&&story.date<=today),byPost=new Map(posts.filter(post=>post.status!=='draft'&&['Facebook','Instagram'].includes(post.platform)&&post.date<=today).map(post=>[post.id,post]));
 const source=(story:PublicStory)=>byPost.get(sourceByStory[story.id]||(story.id.startsWith('post-')?story.id.slice(5):''));
 const latest=(rows:PublicStory[])=>[...rows].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id)).slice(0,6).map(story=>story.id);
 const baselineKeys=(post:Post)=>['platform:'+post.platform,'account:'+post.platform+'|'+post.account,'format:'+post.platform+'|'+post.type],baselines=new Map<string,{sum:number;count:number}>();
 for(const post of byPost.values()){const value=contentMetricValue(post,'engagement');if(value===null)continue;for(const key of baselineKeys(post)){const group=baselines.get(key)||{sum:0,count:0};group.sum+=value;group.count++;baselines.set(key,group);}}
 const periods={} as PublicShowcases['periods'];
 for(const period of ['30d','90d','ytd'] as const){const date=new Date(today+'T00:00:00Z');if(period==='ytd'){date.setUTCMonth(0,1)}else date.setUTCDate(date.getUTCDate()-(period==='30d'?29:89));const start=date.toISOString().slice(0,10),rows=approved.filter(story=>story.date>=start);
  const ranked=(key:'engagement'|'reach'|'views'|'shares')=>rows.flatMap(story=>{const post=source(story),value=post?contentMetricValue(post,key):null;return value!==null&&value>0?[{id:story.id,value,date:story.date}]:[]}).sort((a,b)=>b.value-a.value||b.date.localeCompare(a.date)||a.id.localeCompare(b.id)).slice(0,6).map(row=>row.id);
  const trending=rows.flatMap(story=>{const post=source(story),value=post?contentMetricValue(post,'engagement'):null;if(!post||value===null||!post.account||!post.type||post.type==='Unclassified')return [];const ratios=baselineKeys(post).map(key=>{const group=baselines.get(key),count=(group?.count||0)-1,average=group&&count>=3?(group.sum-value)/count:null;return average!==null&&average>0?value/average:null;});return ratios.every(ratio=>ratio!==null&&ratio>=1.5)?[{id:story.id,score:Math.min(...ratios as number[])}]:[];}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,6).map(row=>row.id);
  const administrator=rows.filter(story=>story.pinned||story.featuredStory||story.featuredContent).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||b.date.localeCompare(a.date)).map(story=>story.id);
  periods[period]={engagement:ranked('engagement'),reach:ranked('reach'),views:ranked('views'),featured:[...new Set([...administrator,...ranked('shares'),...ranked('engagement')])].slice(0,6),trending};
 }
 return {asOf:today,latestPosts:latest(approved.filter(story=>['Facebook','Instagram'].includes(story.platform))),latestStories:latest(approved.filter(story=>story.showInStories!==false)),latestHighlights:latest(approved.filter(story=>story.featured)),periods};
}
