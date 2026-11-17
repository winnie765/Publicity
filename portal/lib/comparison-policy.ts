import type {Post} from '../app/model';
import {interactionReading} from './post-measurements';
/** Display readings remain intact. Eligibility is a separate, conservative decision. */
export function interactionDefinition(post:Post){
 const reading=interactionReading(post);
 const coverage=reading.value===null?'missing':!Array.isArray(post.reportedMetrics)?'unknown':reading.basis==='Reported total'?'unknown':reading.complete?'complete':'partial';
 return {...reading,coverage,comparable:coverage==='complete'||coverage==='partial',key:coverage==='unknown'||coverage==='missing'?null:reading.basis};
}
export function compatibleInteractions(current:Post[],previous:Post[],minimum=3){
 const a=current.map(interactionDefinition),b=previous.map(interactionDefinition),keys=new Set([...a,...b].map(r=>r.key));
 const eligible=a.length>=minimum&&b.length>=minimum&&keys.size===1&&!keys.has(null)&&a.every(r=>r.comparable)&&b.every(r=>r.comparable)&&new Set([...current,...previous].map(p=>p.platform)).size===1&&new Set([...current,...previous].map(recordedMeasurementAge)).size===1;
 return {eligible,reason:eligible?'Same platform and explicitly recorded interaction components.':'Comparison withheld: both groups need sufficient measured posts on the same platform using one identical, explicitly recorded interaction definition and compatible known measurement ages. Reported totals without a definition and legacy unknown coverage are not equivalent to component totals.',current:a.length,previous:b.length};
}
export function recordedMeasurementAge(post:Post){const definition=interactionDefinition(post);if(!definition.comparable)return null;const keys=(['likes','comments','shares','saves'] as const).filter(k=>post.reportedMetrics?.includes(k));const dates=keys.map(k=>post.metric_observed_at?.[k]);if(!dates.length||dates.some(d=>typeof d!=='string'||!Number.isFinite(Date.parse(d))))return null;const ages=dates.map(d=>Math.floor((Date.parse(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d!)))-Date.parse(post.date))/86400000));return ages.every(n=>n===ages[0])&&ages[0]>=0?ages[0]:null;}
export function matchedPeerKey(post:Post){const definition=interactionDefinition(post);return definition.comparable&&post.account&&post.type&&post.type!=='Unclassified'?JSON.stringify([post.platform,post.account,post.type,post.date.slice(0,7),definition.key,recordedMeasurementAge(post)]):null;}
export function matchedPeers(posts:Post[],post:Post){const key=matchedPeerKey(post);return key===null?[]:posts.filter(p=>p.id!==post.id&&p.status!=='draft'&&matchedPeerKey(p)===key);}
export const measurementAgeLimitation='These are accumulated recorded measurements, not matched Day 7, 14 or 30 observations. Measurement age and distribution may affect results; no historical figures are estimated.';

/** Linear preprocessing keeps shared post assessments fast on large imports. */
export function matchedPeerStatistics(posts:Post[],reading:(p:Post)=>number|null=(p)=>interactionReading(p).value){const buckets=new Map<string,{n:number;total:number;ids:Set<string>}>();for(const post of posts){const key=matchedPeerKey(post),value=reading(post);if(key===null||value===null||post.status==='draft')continue;const bucket=buckets.get(key)||{n:0,total:0,ids:new Set<string>()};bucket.n++;bucket.total+=value;bucket.ids.add(post.id);buckets.set(key,bucket);}return (post:Post)=>{const key=matchedPeerKey(post),bucket=key===null?undefined:buckets.get(key),own=bucket?.ids.has(post.id)?reading(post):null,sample=(bucket?.n||0)-(own===null?0:1);return {sample,average:sample?(bucket!.total-(own??0))/sample:null};};}
