export const scopes=['executive','social','content','top-hits','stakeholders','brands','workvivo','followers','outreach','insights'] as const;
export type Scope=typeof scopes[number]|'monthly-report';
export type Filters={start?:string;end?:string;brand?:string;platform?:string;account?:string;location?:string;followerView?:'account'|'brand';followerSelection?:string};
export type Fact={id:string;label:string;text:string};
export type EvidenceText={text:string;evidenceIds:string[]};
export type Recommendation={recommendation:string;reasoning:string;evidenceIds:string[]};
export const insightCategories=['content','growth','stakeholder','top-hits','recommendation','opportunity'] as const;
export type InsightCategory=typeof insightCategories[number];
export type StrategyInsight={category?:InsightCategory;title?:string;finding:string;explanation:string;recommendation:string;evidenceIds:string[];expectedImpact?:string;confidenceLevel?:'Limited'|'Moderate'|'High'|'Medium'|'Low';confidenceReason?:string};
export type IntelligenceReport={summary:EvidenceText;insights:StrategyInsight[];sectionSummaries?:Record<string,EvidenceText>;limitations:string[]};
export type EvidencePack={version:string;scope:Scope;filters:Filters;facts:Fact[];limitations:string[];plannerContext?:boolean};
export type AIResponse={mode:'gemini'|'calculated';reason?:'not_configured'|'unavailable'|'busy'|'no_data';model:string|null;generatedAt:string;cached:boolean;report:IntelligenceReport;facts:Fact[]};
export interface IntelligenceProvider {name:string;model:string;interpret(pack:EvidencePack):Promise<IntelligenceReport>}
export interface AICache {read(key:string):Promise<{payload:string;expiresAt:number}|null>;reserve(key:string,now:number,dailyLimit:number):Promise<string|null>;save(key:string,token:string,payload:string,expiresAt:number):Promise<void>;release(key:string,token:string,expiresAt:number):Promise<void>}
