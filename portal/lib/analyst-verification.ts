import type {StrategyInsight,AIResponse} from './intelligence/types';
import type {AnalystAnalysis} from './social-analyst';

export const analystVerificationPolicy='analyst-source-proof-v2';
export type ReviewedInsight=StrategyInsight&{verification:{policy:string;finding:'Calculated from current records';interpretation:'Hypothesis — staff review required';action:'Suggested experiment';evidenceId:string;findingReplaced:boolean}};
const textFields=['title','finding','explanation','recommendation','confidenceReason','expectedImpact'] as const;
/** Qualitative screening is conservative; passing it never certifies prose as factual. */
export function qualitativeRejection(item:StrategyInsight,platform:string,direction:'up'|'down'|'none'='none',metric?:'facebook_views'|'instagram_views'|'instagram_reach'){
 if(!item||typeof item!=='object'||textFields.some(k=>item[k]!==undefined&&typeof item[k]!=='string')||item.possibleFactors!==undefined&&(!Array.isArray(item.possibleFactors)||item.possibleFactors.some(v=>typeof v!=='string')))return 'Malformed narrative';
 const text=textFields.map(k=>item[k]||'').concat(item.possibleFactors||[]).join(' ');
 if(!item.finding?.trim()||!item.explanation?.trim()||!item.recommendation?.trim())return 'Incomplete explanation';
 if(/[\d<>]|https?:|\bpost\s*(?:id|#|:)\s*\S+/i.test(text))return 'Numbers, dates or post references must come from calculated evidence';
 if(/\b(?:twice|double[ds]?|tripled?|percent(?:age)?|half|times higher|times lower)\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|hundred|thousand)\s+(?:posts?|accounts?|interactions?|followers?|days?|months?)\b/i.test(item.finding+' '+item.explanation))return 'Unsupported quantitative wording';
 if(['Facebook','Instagram','Workvivo'].some(p=>p!==platform&&new RegExp('\\b'+p+'\\b','i').test(text)))return 'Platform does not match the cited comparison';
 if(/\b(?:GLOW|SEEN)\b|\baccount\s+(?:named|called|id)\b/i.test(text))return 'Named account or brand claims are not supplied in the anonymised prompt';
 const assertions=item.finding+' '+item.explanation;
 const namedClaims=assertions.replace(/Facebook Views|Instagram Reach|Photo Album|Tzu Chi|Community Care/gi,'supported context');
 if(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/.test(namedClaims)||/\b(?!The\b|This\b|Same\b|Selected\b|Current\b|Previous\b|Our\b|Your\b)[A-Z][a-z]+\s+(?:account|brand|centre)\b/.test(assertions))return 'Unsupported named account or organisation reference';
 if(/\b(?:demographics?|seniors?|older|female|male|women|men|impressions|best posting|optimal time)\b/i.test(assertions))return 'Claim exceeds this interaction evidence';
 if((!metric&&/\b(?:reach|views)\b/i.test(assertions))||((metric==='facebook_views'||metric==='instagram_views')&&/\breach\b/i.test(assertions))||(metric==='instagram_reach'&&/\bviews\b/i.test(assertions)))return 'Visibility metric is not supported by this cited comparison';
 if(/(?:caused|causes|proves?|guaranteed|statistically significant|audience (?:prefers?|is|are)|(?:will|must) (?:increase|improve|boost)|higher content quality|better content quality)/i.test(text))return 'Unsupported causal, audience or effectiveness conclusion';
 if(direction==='up'&&/\b(?:declined?|decreased?|fell|weaker|below average)\b/i.test(assertions)||direction==='down'&&/\b(?:increased?|improved?|stronger|above average)\b/i.test(assertions))return 'Direction contradicts the calculated finding';
 if(/best (?:posting )?(?:time|day)|optimal (?:posting|time|schedule)|(?:post|publish).{0,20}(?:morning|evening|afternoon|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text))return 'No supported optimal publishing schedule';
 return null;
}
export function verifyAnalystOutput(response:AIResponse,analysis:AnalystAnalysis){
 const accepted:ReviewedInsight[]=[],rejected:{evidenceId:string;reason:string}[]=[],seen=new Set<string>(),actions=new Set<string>();
 if(response.mode!=='gemini')return {policy:analystVerificationPolicy,accepted,rejected};
 if(!Array.isArray(response.report?.insights))return {policy:analystVerificationPolicy,accepted,rejected:[{evidenceId:'',reason:'Malformed AI response'}]};
 for(const item of response.report.insights){
  if(!item||!Array.isArray(item.evidenceIds)){rejected.push({evidenceId:'',reason:'Malformed evidence references'});continue;}
  const id=item.evidenceIds?.[0]||'',candidate=analysis.candidates.find(c=>c.factId===id);
  let reason=item.evidenceIds?.length!==1||!candidate?'Invalid evidence reference':seen.has(id)?'Repeated recommendation':null;
  if(candidate&&!reason){const ids=[...candidate.examples.map(p=>p.id),...candidate.baselinePostIds];if(ids.some(id=>!(analysis.sourcePostIds||[]).includes(id)))reason='A cited source post no longer exists in the calculated scope';}
  if(candidate&&!reason){const proof=candidate.proof;if(!proof||!proof.eligible||proof.issues.length)reason='Source-level comparison checks did not pass';else if(candidate.kind!=='measurement'){
   const all=[...proof.current,...proof.comparison],baseline=proof.comparison.length?proof.comparison.reduce((n,p)=>n+(p.value??0),0)/proof.comparison.length:null;
   if(proof.current.length!==candidate.n||proof.comparison.length!==candidate.peers||all.some(p=>p.value===null||p.account!==candidate.account||p.platform!==candidate.platform||!analysis.sourcePostIds.includes(p.id))||baseline===null||candidate.baseline===null||Math.abs(baseline-candidate.baseline)>1e-9)reason='Statistics, samples or source identities do not reconcile';
  }}
  if(candidate&&!reason&&candidate.kind!=='measurement'&&(candidate.peers<3||candidate.baseline===null||candidate.n<(candidate.kind==='review'||candidate.kind==='strong'?1:3)))reason='Insufficient comparable records';
  if(candidate?.kind==='measurement'&&!reason&&/higher|lower|stronger|weaker|increased|declined|outperform|underperform|best format/i.test(item.finding+' '+item.explanation))reason='Missing-data evidence cannot establish a performance winner';
  if(candidate&&!reason){const direction=candidate.kind==='review'?'down':candidate.kind==='strong'||candidate.kind==='format'||candidate.kind==='topic'?'up':candidate.kind==='trend'||candidate.kind==='visibility'?(candidate.observation.includes('declined')?'down':'up'):'none';reason=qualitativeRejection(item,candidate.platform,direction,candidate.metric);}
  const action=typeof item.recommendation==='string'?item.recommendation.trim().toLowerCase().replace(/[^a-z0-9]+/g,' '):'';if(!reason&&actions.has(action))reason='Repeated suggested action';
  if(reason||!candidate){rejected.push({evidenceId:id,reason:reason||'Unsupported evidence'});continue;}
  seen.add(id);actions.add(action);
  accepted.push({title:candidate.title,category:item.category,finding:candidate.observation,explanation:item.explanation,recommendation:item.recommendation,evidenceIds:[id],possibleFactors:item.possibleFactors,confidenceLevel:'Low',confidenceReason:'Screened qualitative interpretation, not independent proof or statistical confidence.',verification:{policy:analystVerificationPolicy,finding:'Calculated from current records',interpretation:'Hypothesis — staff review required',action:'Suggested experiment',evidenceId:id,findingReplaced:item.finding!==candidate.observation}});
 }
 return {policy:analystVerificationPolicy,accepted,rejected};
}
