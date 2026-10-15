export const isSpecified=(value:string)=>!!value?.trim()&&value.trim().toLowerCase()!=='unclassified';
export const displayLabel=(value:string|null|undefined)=>value&&isSpecified(value)?value:'Not specified';
export const displayText=(value:string)=>value.replace(/\bUnclassified\b/gi,'Not specified');
export function executiveNarrative(value:string,fallback='The available evidence should guide a focused content test; it does not establish the cause of audience response.'){
 return /\d/.test(value)?fallback:displayText(value);
}
export function executiveInsight(item:{title?:string;finding:string;explanation:string;recommendation:string;confidenceLevel?:string;confidenceReason?:string}){
 const subject=(item.finding+' '+item.recommendation).toLowerCase();
 const title=item.title||(/stakeholder|partner/.test(subject)?'Strengthening Strategic Relationships':/follower|snapshot|audience growth/.test(subject)?'Building Sustainable Audience Growth':/annotat|coverage|missing/.test(subject)?'Strengthening the Evidence for Decisions':'Shaping the Next Content Priority');
 return {title:executiveNarrative(title,'Strategic Content Assessment'),observation:executiveNarrative(item.finding,'The recorded evidence identifies an area for strategic review. The supporting measures should be considered alongside reporting coverage and publishing conditions.'),meaning:executiveNarrative(item.explanation),action:executiveNarrative(item.recommendation,'Run a comparable content test and review the supporting evidence before expanding the approach.'),confidence:item.confidenceLevel==='Moderate'?'Moderate':'Limited',confidenceReason:item.confidenceReason||'This assessment is observational. Reporting coverage and unmeasured influences limit certainty; this is not a statistical confidence score.'};
}
export function executiveBriefingText(item:Parameters<typeof executiveInsight>[0]){const value=executiveInsight(item);return value.title+'\n\nObservation\n'+value.observation+'\n\nWhat This Means\n'+value.meaning+'\n\nRecommended Action\n'+value.action+'\n\nConfidence Level\n'+value.confidence+'. '+value.confidenceReason;}
