import {unstable_cache,revalidateTag} from 'next/cache.js';
import {createHash} from 'node:crypto';
import {getStorage} from './storage';
import {publicPortalData} from './workspace-service';

export const publicSiteCacheTag='published-public-site-v1';
export const publicSiteCacheSeconds=60;
export function publicResponseRevision(revision:string,view?:string|null,slug=''){
 return view?revision+'-'+createHash('sha256').update(view+'|'+slug).digest('hex').slice(0,16):revision;
}
/** Cache only the final allowlisted public projection, never workspace rows or previews. */
export const publishedPublicSnapshot=unstable_cache(async()=>{
 const started=performance.now();
 let timings={readMs:0,transformMs:0};
 const data=await publicPortalData(getStorage(),undefined,false,value=>{timings=value;});
 return {data,revision:createHash('sha256').update(JSON.stringify(data)).digest('hex'),generatedAt:new Date().toISOString(),timings:{...timings,totalMs:performance.now()-started}};
},['published-public-site-v1'],{tags:[publicSiteCacheTag],revalidate:publicSiteCacheSeconds});

/** Called only after an authorised successful write; draft previews never use this cache. */
export function invalidatePublishedPublicData(){
 try{revalidateTag(publicSiteCacheTag);}catch{
  // Non-Next test/alternate runtimes have no incremental cache. TTL remains the fallback.
  console.warn('Public cache invalidation unavailable in this runtime.');
 }
}
