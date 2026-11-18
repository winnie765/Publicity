import type {Post} from '../app/model';
import {originalPostUrl} from './original-post-url';

/** Only recognised publication permalinks establish identity; profile links never do. */
export function platformPostIdentity(post:Pick<Post,'platform'|'url'|'original_post_url'|'platform_post_id'>):string|null{
 const platform=post.platform.toLowerCase();
 if(!['facebook','instagram'].includes(platform))return null;
 let id:string|undefined;
 const raw=originalPostUrl(post);
 if(raw){const u=new URL(raw),host=u.hostname.toLowerCase().replace(/^(www|m|mbasic)\./,'');
  if(platform==='instagram'&&host==='instagram.com')id=u.pathname.match(/^\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?$/)?.[1];
  if(platform==='facebook'&&host==='facebook.com'){
   id=u.searchParams.get('story_fbid')||u.searchParams.get('fbid')||u.pathname.match(/\/(?:posts|videos|reel)\/([A-Za-z0-9_-]+)\/?$/)?.[1];
   if(!id&&u.pathname==='/watch/')id=u.searchParams.get('v')||undefined;
   if(!id){const share=u.pathname.match(/^\/share\/(?:p|r|v)\/([A-Za-z0-9_-]+)\/?$/);if(share)id='share-link:'+share[1];}
  }
  if(platform==='facebook'&&host==='fb.watch'){const watch=u.pathname.match(/^\/([A-Za-z0-9_-]+)\/?$/);if(watch)id='watch-link:'+watch[1];}
 }
 return id?platform+':'+id:post.platform_post_id?platform+':'+post.platform_post_id:null;
}
export function normalisedPostUrl(post:Post):string|null{
 const raw=originalPostUrl(post);if(!raw)return null;
 const u=new URL(raw);u.hash='';u.hostname=u.hostname.toLowerCase().replace(/^(www|m|mbasic)\./,'');
 for(const key of [...u.searchParams.keys()])if(/^utm_|^(fbclid|igsh|igshid|mibextid|ref|__tn__|__cft__)$/i.test(key))u.searchParams.delete(key);
 u.searchParams.sort();return u.toString().replace(/\/$/,'');
}
export function samePublishedPost(a:Post,b:Post):boolean{
 if(a.platform!==b.platform)return false;
 const identity=platformPostIdentity(a),other=platformPostIdentity(b);
 return !!identity&&identity===other;
}
/** A deterministic representative, never a sum or merge of duplicate measurements. */
export function uniquePostPublications(posts:Post[]):Post[]{
 const grouped=new Map<string,Post>();const unknown:Post[]=[];
 for(const post of posts){const key=platformPostIdentity(post);if(!key){unknown.push(post);continue;}const prior=grouped.get(key);
  // Stable ID ownership prevents attribution changing with filters or metric edits.
  if(!prior||post.id.localeCompare(prior.id)<0)grouped.set(key,post);
 }
 const ids=new Set([...unknown,...grouped.values()].map(p=>p.id));return posts.filter(p=>ids.has(p.id));
}
export const publicationAnalyticsPosts=(posts:Post[])=>uniquePostPublications(posts.filter(p=>p.status!=='draft'));
