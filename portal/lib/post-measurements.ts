/** Recorded-value semantics shared by entry, analytics, AI evidence and reporting. */
export const postMetricKeys=['views','reach','likes','comments','shares','saves','engagementTotal','followersGenerated','incentiveCost'] as const;
export type PostMetricKey=typeof postMetricKeys[number];
type MeasuredPost=Record<string,unknown>;
const components=['likes','comments','shares','saves'] as const;
export function metricReading(post:MeasuredPost,key:PostMetricKey):number|null{
 if(key==='reach'&&!Array.isArray(post.reportedMetrics)&&post.reach===0)return null;
 if(key!=='engagementTotal'&&Array.isArray(post.reportedMetrics)&&!post.reportedMetrics.includes(key))return null;
 const value=post[key];return typeof value==='number'&&Number.isFinite(value)?value:null;
}
export function interactionReading(post:MeasuredPost){
 const total=metricReading(post,'engagementTotal'),known=components.filter(key=>metricReading(post,key)!==null);
 return {value:total??(known.length?known.reduce((sum,key)=>sum+metricReading(post,key)!,0):null),basis:total!==null?'Reported total':known.join(' + ')||'Not recorded',complete:known.length===4};
}
export function rateReading(post:MeasuredPost){
 const denominator=post.platform==='Facebook'?'views':'reach',exposure=metricReading(post,denominator),complete=components.every(key=>metricReading(post,key)!==null);
 const numerator=complete?components.reduce((sum,key)=>sum+metricReading(post,key)!,0):null;
 return {denominator,numerator,exposure,value:numerator!==null&&exposure!==null&&exposure>0?numerator/exposure*100:null,formula:'(Likes / Reactions + Comments + Shares + Saves) ÷ '+(denominator==='views'?'Facebook Views':'Instagram Reach')+' × 100'};
}

export function summariseValues(values:(number|null)[]){const known=values.filter((value):value is number=>value!==null&&Number.isFinite(value));const total=known.length?known.reduce((sum,value)=>sum+value,0):null;return {total,average:total===null?null:total/known.length,count:known.length,eligible:values.length};}
