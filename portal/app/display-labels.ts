export const isSpecified=(value:string)=>!!value?.trim()&&value.trim().toLowerCase()!=='unclassified';
export const displayLabel=(value:string|null|undefined)=>value&&isSpecified(value)?value:'Not specified';
export const displayText=(value:string)=>value.replace(/\bUnclassified\b/gi,'Not specified');
