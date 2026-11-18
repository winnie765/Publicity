import {qualitativeRejection} from './analyst-verification';
import {publicMeasurements,publicPeerResult,type PublicPost} from './public-post-intelligence';
import type {AIResponse} from './intelligence/types';

/** Apply the existing Analyst's conservative screen to fresh and cached lessons. */
export function screenPublicLessons(response:AIResponse,posts:PublicPost[],post:PublicPost,brands:string[],formats:string[]){
 const sourceIds=new Set(response.facts.map(f=>f.id)),actions=new Set<string>();
 const accepted=response.mode==='gemini'?(Array.isArray(response.report.insights)?response.report.insights:[]).filter(item=>{
  if(!item||typeof item!=='object')return false;
  if(!Array.isArray(item.evidenceIds)||!item.evidenceIds.includes('I001')||item.evidenceIds.some(id=>!sourceIds.has(id)))return false;
  if(qualitativeRejection(item,post.platform)||/\b(?:trending|viral|best performing|most popular)\b/i.test(item.finding+' '+item.explanation))return false;
  const opportunity=item.trendOpportunity;
  if(opportunity){if(!brands.includes(opportunity.brand)||!formats.includes(opportunity.format)||!['Facebook','Instagram'].includes(opportunity.platform))return false;
   if(qualitativeRejection({finding:'The source is a manually reviewed example.',explanation:'This is an experiment for staff review.',recommendation:[opportunity.idea,opportunity.caption,opportunity.brandRelevance].join(' '),evidenceIds:['I001']},opportunity.platform))return false;
  }
  const action=item.recommendation.toLowerCase().replace(/[^a-z]+/g,' ').trim();if(actions.has(action))return false;actions.add(action);return true;
 }).map(item=>({...item,confidenceLevel:'Low' as const,confidenceReason:'Screened suggestion, not independent proof of effectiveness.'})):[];
 const measurement=publicMeasurements(post),peer=publicPeerResult(posts,post);
 return {...response,report:{...response.report,summary:{text:'Manually recorded public components: '+measurement.basis+'. Total '+(measurement.total??'not recorded')+'. '+peer.sample+' matched other posts; '+(peer.ratio===null?'no supported relative comparison.':'recorded relative ratio '+peer.ratio.toFixed(2)+'.')+' AI lessons are hypotheses requiring staff review.',evidenceIds:['I001','I002']},insights:accepted},verification:{retained:accepted.length,withheld:(response.report.insights?.length||0)-accepted.length}};
}
