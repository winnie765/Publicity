'use client';
import {useEffect,useMemo,useState} from 'react';
import type {Dataset} from './model';
import {decisionAnalysis,type DecisionAnalysis,type GrowthMode} from '../lib/analytics-decision';
import type {AIResponse,Filters,Scope,StrategyInsight} from '../lib/intelligence/types';
import {insightRequest} from './insight-client';
import {ExecutiveInsightCard} from './ai-intelligence';
import './analytics-decision-support.css';

const number=(value:number|null)=>value===null?'Unavailable':new Intl.NumberFormat('en-SG',{maximumFractionDigits:1}).format(value);
export function DecisionAnalysisView({analysis,result,loading=false}:{analysis:DecisionAnalysis;result?:AIResponse;loading?:boolean}){
 const generated=result?.mode==='gemini',takeaways=analysis.takeaways;
 return <section className="intelligence-parent decision-workspace" aria-label="Performance decision support">
  <header className="decision-heading"><div><span className="eyebrow">PERFORMANCE INTELLIGENCE</span><h2>Key Takeaways</h2></div><span className="badge neutral">{generated?'AI-enhanced analysis':'Calculated insights'}</span></header>
  {generated&&<p className="decision-ai-summary">{result.report.summary.text}</p>}
  <div className="decision-takeaways">{[['What improved?',takeaways.improved],['What declined?',takeaways.declined],['What drove performance?',takeaways.drivers],['What should we do next?',takeaways.next]].map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
  <details className="decision-benchmarks" open><summary>Current Performance vs Benchmark</summary><p className="decision-period">{analysis.period.label}: {analysis.period.start} to {analysis.period.end} · Benchmark: {analysis.period.previousStart} to {analysis.period.previousEnd}</p>
   <div className="decision-metrics">{analysis.metrics.map(row=><article key={row.id}><h3>{row.platform} · {row.label}</h3><dl><div><dt>Current</dt><dd>{number(row.current)}</dd></div><div><dt>Benchmark</dt><dd>{number(row.benchmark)}</dd></div><div><dt>Difference</dt><dd>{row.difference!==null&&row.difference>0?'+':''}{number(row.difference)}{row.percentage!==null?' ('+(row.percentage>0?'+':'')+number(row.percentage)+'%)':''}</dd></div></dl><p>{row.insight}</p><small>{row.coverage}</small></article>)}</div>
  </details>
  {!!analysis.historical.length&&<details className="decision-details"><summary>Historical Average Benchmarks</summary><div className="decision-metrics">{analysis.historical.map(row=><article key={row.id}><h3>{row.platform}</h3><p>{row.label}</p><dl><div><dt>Current</dt><dd>{number(row.current)}</dd></div><div><dt>Historical average</dt><dd>{number(row.benchmark)}</dd></div><div><dt>Ratio to average</dt><dd>{row.ratio===null?'Unavailable':number(row.ratio)+'x'}</dd></div></dl><small>{row.coverage}</small><p>{row.insight}</p></article>)}</div></details>}
  <details className="decision-details"><summary>Analysis by Chart &amp; Trend ({analysis.charts.length})</summary><p className="decision-method" role="status">{loading?'AI analysis is running in the background. Calculated observations and actions are available now.':generated?'AI interpretations cite calculated chart evidence.':'Calculated observations and recommendations are shown. AI analysis is unavailable for this selection.'}</p><div className="decision-chart-list">{analysis.charts.map((chart,index)=>{
   const ai=generated?result.report.chartInsights?.find(item=>item.chartId===chart.id):undefined;
   const item:StrategyInsight=ai||{title:chart.title,finding:chart.observation,explanation:chart.meaning,recommendation:chart.action,possibleFactors:chart.possibleFactors,confidenceLevel:chart.confidence,confidenceReason:'Qualitative assessment of recorded sample size and coverage. Explanations remain hypotheses.',evidenceIds:[]};
   return <details key={chart.id} className="decision-chart"><summary>{chart.title}<span>{ai?'AI analysis':'Calculated insight'}</span></summary><ExecutiveInsightCard item={item} index={index} facts={ai?result?.facts:[]}/></details>;
  })}</div></details>
  <details className="decision-details"><summary>Coverage &amp; Comparison Method</summary><ul>{analysis.limitations.map(text=><li key={text}>{text}</li>)}</ul><p>{analysis.organisationBenchmarks.reason}</p></details>
 </section>;
}
export default function AnalyticsDecisionSupport({data,scope,filters,revision='',enabled=true}:{data:Dataset;scope:Scope;filters:Filters;revision?:string;enabled?:boolean}){
 const [mode,setMode]=useState<GrowthMode>('mom'),[state,setState]=useState<{key:string;result?:AIResponse;failed?:boolean}|null>(null);
 const analysis=useMemo(()=>decisionAnalysis(data,scope,filters,mode),[data,scope,JSON.stringify(filters),mode]);
 const requestFilters=mode==='mom'?filters:{...filters,comparison:mode},key=JSON.stringify({scope,filters:requestFilters,revision});
 useEffect(()=>{if(!enabled)return;const controller=new AbortController(),timer=setTimeout(()=>{insightRequest(key,{scope,filters:requestFilters},controller.signal).then(result=>{if(!controller.signal.aborted)setState({key,result})}).catch(()=>{if(!controller.signal.aborted)setState({key,failed:true})});},600);return()=>{clearTimeout(timer);controller.abort()}},[key,enabled]);
 const current=state?.key===key?state:null;
 return <><div className="decision-controls" role="group" aria-label="Growth analysis comparison"><span>Growth Analysis</span>{([['mom','Month-on-Month'],['qoq','Quarter-on-Quarter'],['yoy','Year-on-Year']] as const).map(([value,label])=><button type="button" key={value} className={'button '+(mode===value?'primary':'')} aria-pressed={mode===value} onClick={()=>setMode(value)}>{label}</button>)}<button type="button" className="button" disabled title="Comparable organisation data has not been supplied">Organisation Benchmarking · Not Available</button></div><DecisionAnalysisView analysis={analysis} result={current?.result} loading={!current&&enabled}/></>;
}
