import type {AIResponse} from '../lib/intelligence/types';
type Entry={at:number;promise:Promise<AIResponse>;users:Set<symbol>;controller:AbortController;done:boolean};
const cache=new Map<string,Entry>();let tail:Promise<unknown>=Promise.resolve();
function subscribe(entry:Entry,signal:AbortSignal,key:string):Promise<AIResponse>{
 if(signal.aborted)return Promise.reject(new DOMException('Request cancelled','AbortError'));
 const token=Symbol();entry.users.add(token);
 return new Promise((resolve,reject)=>{let finished=false;const cleanup=()=>{signal.removeEventListener('abort',abort);entry.users.delete(token);if(!entry.done&&!entry.users.size){entry.controller.abort();if(cache.get(key)===entry)cache.delete(key)}};const abort=()=>{if(finished)return;finished=true;cleanup();reject(new DOMException('Request cancelled','AbortError'))};signal.addEventListener('abort',abort,{once:true});entry.promise.then(value=>{if(finished)return;finished=true;cleanup();resolve(value)},error=>{if(finished)return;finished=true;cleanup();reject(error)});});
}
/** Deduplicate identical cards, retain subscribers and serialize AI work separately from saves. */
export function insightRequest(key:string,body:unknown,signal:AbortSignal):Promise<AIResponse>{
 const prior=cache.get(key);if(prior&&Date.now()-prior.at<120000)return subscribe(prior,signal,key);
 const entry:Entry={at:Date.now(),users:new Set(),controller:new AbortController(),done:false,promise:Promise.resolve(null as unknown as AIResponse)};
 entry.promise=tail.catch(()=>{}).then(async()=>{if(!entry.users.size||entry.controller.signal.aborted)throw new DOMException('Request cancelled','AbortError');const timeout=setTimeout(()=>entry.controller.abort(),90000);try{const response=await fetch('/api/intelligence',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:entry.controller.signal});if(!response.ok)throw Error('Unavailable');return await response.json() as AIResponse;}finally{clearTimeout(timeout)}}).then(value=>{entry.done=true;return value},error=>{entry.done=true;if(cache.get(key)===entry)cache.delete(key);throw error});
 tail=entry.promise.catch(()=>{});cache.set(key,entry);if(cache.size>64)for(const [oldKey,old]of cache)if(old.done){cache.delete(oldKey);if(cache.size<=64)break;}
 return subscribe(entry,signal,key);
}
