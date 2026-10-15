export const scopes=['executive','social','content','top-hits','stakeholders','brands','workvivo','followers','outreach','insights'] as const;
export type Scope=typeof scopes[number]|'monthly-report';
export type Filters={start?:string;end?:string;brand?:string;platform?:string;account?:string;location?:string;followerView?:'account'|'brand';followerSelection?:string};
export type Fact={id:string;label:string;text:string};
export type EvidenceText={text:string;evidenceIds:string[]};
export type Recommendation={recommendation:string;reasoning:string;evidenceIds:string[]};
export type StrategyInsight={finding:string;explanation:string;recommendation:string;evidenceIds:string[];expectedImpact?:string};
export type IntelligenceReport={summary:EvidenceText;insights:StrategyInsight[];sectionSummaries?:Record<string,EvidenceText>;limitations:string[]};
export type EvidencePack={version:string;scope:Scope;filters:Filters;facts:Fact[];limitations:string[]};
export type AIResponse={mode:'gemini'|'calculated';reason?:'not_configured'|'unavailable'|'busy'|'no_data';model:string|null;generatedAt:string;cached:boolean;report:IntelligenceReport;facts:Fact[]};
export interface IntelligenceProvider {name:string;model:string;interpret(pack:EvidencePack):Promise<IntelligenceReport>}
export interface AICache {read(key:string):Promise<{payload:string;expiresAt:number}|null>;reserve(key:string,now:number,dailyLimit:number):Promise<string|null>;save(key:string,token:string,payload:string,expiresAt:number):Promise<void>;release(key:string,token:string,expiresAt:number):Promise<void>}
