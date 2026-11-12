import type {Post} from '../app/model';
import {originalPostUrl} from './original-post-url';
import {postMetricKeys,metricReading,type PostMetricKey} from './post-measurements';
const norm=(s:unknown)=>String(s??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const knownDate=(s:unknown):string|null=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s.slice(0,10)+'T12:00:00Z').toISOString().slice(0,10)!==s.slice(0,10))return null;return new Date(s).toISOString();};
const url=(p:Post)=>{const raw=originalPostUrl(p);if(!raw)return '';try{const u=new URL(raw);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_'))u.searchParams.delete(k);return u.toString().replace(/\/$/,'');}catch{return '';}};
const identity=(p:Post)=>[norm(p.platform),norm(p.account),p.date,norm(p.title)].join('|');
const natural=(p:Post)=>!!norm(p.account)&&!/(unspecified|unclassified)/i.test(p.account)&&!!norm(p.title);
function hash(s:string){let a=2166136261,b=5381;for(const c of s){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return (a>>>0).toString(36)+(b>>>0).toString(36);}
export type ImportRowReview={id:string;title:string;outcome:'added'|'updated'|'unchanged'|'review';changed:string[];preserved:string[];reason:string;uncertain:boolean};
export function reconcileImportedPosts(input:Post[],existing:Post[]){
 const rows:ImportRowReview[]=[],posts:Post[]=[],ids=new Map<string,string>(),working=[...existing],writes=new Map<string,Post>();let duplicates=0;
 for(const incoming of input){
  const row:ImportRowReview={id:incoming.id,title:incoming.title,outcome:'added',changed:[],preserved:[],reason:'',uncertain:false};
  const direct=working.find(p=>p.id===incoming.id),u=url(incoming),urls=u?working.filter(p=>p.platform===incoming.platform&&url(p)===u):[],keys=natural(incoming)?working.filter(p=>natural(p)&&identity(p)===identity(incoming)):[];
  const matches=direct?[direct]:urls.length?urls:keys;
  if(matches.length>1||matches[0]&&norm(matches[0].account)!==norm(incoming.account)||direct&&(direct.platform!==incoming.platform||norm(direct.account)!==norm(incoming.account))||direct&&urls.some(p=>p.id!==direct.id)||urls.length===1&&keys.some(p=>p.id!==urls[0].id)){
   row.outcome='review';row.reason='Ambiguous identity or conflicting ID/account/URL. No changes applied; correct the source identifiers.';rows.push(row);continue;
  }
  const prior=matches[0];if(prior&&prior.id!==incoming.id)duplicates++;
  const measured=knownDate(incoming.metrics_measured_at);if(incoming.metrics_measured_at&&!measured){row.outcome='review';row.reason='Invalid metric measurement date. Correct Metrics Measured At in the file.';rows.push(row);continue;}
  const next:Post=prior?{...prior,reportedMetrics:prior.reportedMetrics?[...prior.reportedMetrics]:postMetricKeys.filter(k=>k!=='engagementTotal'&&metricReading(prior,k)!==null),metric_observed_at:{...prior.metric_observed_at}}:{...incoming,metric_observed_at:{}};
  let provenance=false;
  for(const key of postMetricKeys){const value=metricReading(incoming,key);if(value===null)continue;
   if(!Number.isFinite(value)||value<0||value>1e12||key!=='incentiveCost'&&!Number.isInteger(value))throw Error(incoming.title+': '+key+' must be a valid non-negative measurement.');
   const old=prior?metricReading(prior,key):null,stamp=prior?.metric_observed_at&&Object.prototype.hasOwnProperty.call(prior.metric_observed_at,key)?knownDate(prior.metric_observed_at[key]):knownDate(prior?.metrics_measured_at)||knownDate(prior?.metrics_updated_at);
   if(prior&&old!==null&&measured&&stamp&&measured<stamp){row.preserved.push(key);continue;}
   if(prior&&old!==null&&old!==value&&(!measured||!stamp||measured===stamp))row.uncertain=true;
   if(old!==value){(next as unknown as Record<string,unknown>)[key]=value;if(key!=='engagementTotal'&&!next.reportedMetrics?.includes(key))(next.reportedMetrics??=[]).push(key);row.changed.push(key);}
   if(!prior||old!==value||measured&&(!stamp||measured>stamp)){next.metric_observed_at![key]=measured;provenance=true;}
  }
  // Existing editorial/publication fields are never replaced by parser defaults.
  if(prior){next.id=prior.id;row.id=prior.id;row.outcome=row.changed.length||provenance?'updated':'unchanged';if(row.preserved.length)row.reason='Older source measurements kept out: '+row.preserved.join(', ')+'.';if(prior.engagementTotal!==undefined&&row.changed.some(k=>['likes','comments','shares','saves'].includes(k))&&!row.changed.includes('engagementTotal'))row.reason+=' Saved reported engagement total is retained and still takes precedence; include a verified Engagement Total to update it.';if(row.uncertain)row.reason+=(row.reason?' ':'')+'Measurement dates are unknown or conflicting. Review before replacing recorded values.';}
  if(!prior&&measured)next.metrics_measured_at=measured;
  ids.set(incoming.id,next.id);rows.push(row);const index=working.findIndex(p=>p.id===next.id);if(index<0)working.push(next);else working[index]=next;
  if(row.outcome!=='unchanged')writes.set(next.id,next);
 }
 posts.push(...writes.values());const reviewed=rows.filter(r=>r.outcome==='review'||r.uncertain||r.preserved.length).length;
 const summary={added:new Set(rows.filter(r=>r.outcome==='added').map(r=>r.id)).size,updated:new Set(rows.filter(r=>r.outcome==='updated'&&existing.some(p=>p.id===r.id)).map(r=>r.id)).size,unchanged:rows.filter(r=>r.outcome==='unchanged').length,duplicatesPrevented:duplicates,missingFields:input.filter(p=>['likes','comments','shares',...(p.platform==='Instagram'?['saves'] as PostMetricKey[]:[])].some(k=>metricReading(p,k as PostMetricKey)===null)).length,requiringReview:reviewed,failedRows:rows.filter(r=>r.outcome==='review').length};
 const revision=hash(JSON.stringify({input:input.map(p=>({id:p.id,identity:identity(p),metrics:postMetricKeys.map(k=>metricReading(p,k)),measured:p.metrics_measured_at})),existing:existing.map(p=>({id:p.id,identity:identity(p),url:url(p),metrics:postMetricKeys.map(k=>metricReading(p,k)),observed:p.metric_observed_at,measured:p.metrics_measured_at,updated:p.metrics_updated_at})).sort((a,b)=>a.id.localeCompare(b.id))}));
 return {posts,rows,ids,summary,revision,requiresApproval:rows.some(r=>r.outcome==='updated'&&r.changed.length&&existing.some(p=>p.id===r.id))};
}
