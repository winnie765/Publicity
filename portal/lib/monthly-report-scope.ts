import type {MonthlyReport} from './monthly-report';

const stakeholderText=/\bstakeholders?\b|\b(?:AIC|GRA|NCSS|MSF)\b|\b(?:social sector|community) partners?\b|\bpublicity (?:data quality|reporting target|stakeholder)\b/i;

/** Apply the current reporting scope to historical snapshots without changing social metrics. */
export function monthlyPerformanceReport(report:MonthlyReport):MonthlyReport{
 const result=structuredClone(report) as MonthlyReport&{publicity?:unknown;stakeholders?:unknown};
 delete result.publicity;delete result.stakeholders;
 result.limitations=result.limitations.filter(text=>!stakeholderText.test(text));
 const ai=result.ai;if(!ai)return result;
 const excluded=new Set(ai.facts.filter(fact=>stakeholderText.test(fact.label)&&!/^Workvivo stakeholder interaction/i.test(fact.label)).map(fact=>fact.id));
 const internal=new Set(ai.facts.filter(fact=>/^Workvivo\b/i.test(fact.label)).map(fact=>fact.id));
 const allowed=(item:{text?:string;evidenceIds?:string[]})=>!item.evidenceIds?.some(id=>excluded.has(id))&&(!stakeholderText.test(item.text||'')||/\bWorkvivo\b/i.test(item.text||'')&&!!item.evidenceIds?.some(id=>internal.has(id)));
 if(!allowed(ai.report.summary)){delete result.ai;result.aiStatus='unavailable';return result;}
 ai.facts=ai.facts.filter(fact=>!excluded.has(fact.id));
 ai.report.insights=ai.report.insights.filter(insight=>allowed({text:[insight.title,insight.finding,insight.explanation,insight.recommendation,insight.expectedImpact].join(' '),evidenceIds:insight.evidenceIds}));
 if(ai.report.sectionSummaries)ai.report.sectionSummaries=Object.fromEntries(Object.entries(ai.report.sectionSummaries).filter(([key,item])=>key!=='stakeholders'&&allowed(item)));
 ai.report.limitations=ai.report.limitations.filter(text=>!stakeholderText.test(text));
 return result;
}
