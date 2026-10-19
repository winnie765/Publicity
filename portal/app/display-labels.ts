import {withoutEmoji} from '../lib/ui-text';
export const isSpecified=(value:string)=>!!value?.trim()&&value.trim().toLowerCase()!=='unclassified';
export const displayLabel=(value:string|null|undefined)=>value&&isSpecified(value)?withoutEmoji(value)||'Not specified':'Not specified';
export const displayText=(value:string)=>withoutEmoji(value).replace(/\bUnclassified\b/gi,'Not specified');
// New AI prose is validated by the provider. Preserve historical wording rather
// than silently replacing its meaning with invented strategic advice.
export function executiveNarrative(value:string,_fallback?:string){return displayText(value);}
export function executiveInsight(item:{title?:string;finding:string;explanation:string;recommendation:string;confidenceLevel?:string;confidenceReason?:string}){
 const confidence=item.confidenceLevel==='Moderate'?'Medium':item.confidenceLevel==='Limited'?'Low':item.confidenceLevel||'Not assessed';
 return {title:displayText(item.title||'Executive Insight'),observation:displayText(item.finding),meaning:displayText(item.explanation),action:displayText(item.recommendation),confidence,confidenceReason:displayText(item.confidenceReason||'No confidence rationale was recorded for this archived insight.')};
}
export function executiveBriefingText(item:Parameters<typeof executiveInsight>[0]){const value=executiveInsight(item);return value.title+'\n\nObservation\n'+value.observation+'\n\nWhy It Matters\n'+value.meaning+'\n\nRecommended Action\n'+value.action+'\n\nConfidence Level\n'+value.confidence+'. '+value.confidenceReason;}
