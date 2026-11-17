import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/growth-visibility-tests');
const {blankPost,defaultConfig}=await load('app/model.ts');
const {decisionAnalysis}=await load('lib/analytics-decision.ts');
const {benchmarkPeriod}=await load('lib/benchmark-period.ts');
const {analystAnalysis}=await load('lib/social-analyst.ts');
const post=(id,date,likes,extra={})=>({...blankPost(),id,title:id,status:'published',platform:'Instagram',account:'Instagram GLOW',brand:'GLOW',type:'Reel',date,likes,reportedMetrics:['likes'],...extra});
const dataset=posts=>({posts,config:{...structuredClone(defaultConfig),accounts:[{name:"Instagram GLOW",platform:"Instagram",brand:"GLOW"},{name:"Facebook GLOW",platform:"Facebook",brand:"GLOW"}]},followers:[],interactions:[],kpis:[]});
const cohort=(prefix,date,likes,extra={})=>[1,2,3].map(i=>post(prefix+i,date,likes,extra));
const filters={platform:'Instagram',account:'Instagram GLOW',start:'2026-10-01',end:'2026-10-31'};
const rows=[...cohort('now','2026-10-05',20),...cohort('month','2026-09-05',10),...cohort('quarter','2026-07-05',5),...cohort('year','2025-10-05',4)];
for(const [mode,baseline,percent] of [['mom',10,100],['qoq',5,300],['yoy',4,400]]){
 const a=decisionAnalysis(dataset(rows),'social',filters,mode),m=a.metrics.find(m=>m.id==='instagram-average');assert.equal(m.benchmark,baseline);assert.equal(m.percentage,percent);assert(!a.metrics.some(m=>/-(views|reach)$/.test(m.id)));assert(!a.charts.some(c=>/-(views|reach)$/.test(c.id)));
}
const visibility=(key,platform='Instagram')=>rows.map(p=>({...p,platform,account:platform+' GLOW',[key]:p.id.startsWith('now')?200:100,reportedMetrics:['likes',key]}));
for(const [key,platform] of [['views','Facebook'],['views','Instagram'],['reach','Instagram']]){
 const a=decisionAnalysis(dataset(visibility(key,platform)),'social',{...filters,platform,account:platform+' GLOW'}),m=a.metrics.find(m=>m.id===platform.toLowerCase()+'-'+key);assert.equal(m.current,600);assert.equal(m.percentage,100);
 const partial=visibility(key,platform);partial[0].reportedMetrics=['likes'];const b=decisionAnalysis(dataset(partial),'social',{...filters,platform,account:platform+' GLOW'}).metrics.find(m=>m.id===platform.toLowerCase()+'-'+key);assert.equal(b.current,400);assert.equal(b.percentage,null);assert.match(b.coverage,/2\/3 current/);
}
const zeros=rows.map(p=>({...p,likes:p.id.startsWith('now')?10:0})),z=decisionAnalysis(dataset(zeros),'social',filters).metrics.find(m=>m.id==='instagram-average');assert.equal(z.benchmark,0);assert.equal(z.difference,10);assert.equal(z.percentage,null);
const missing=decisionAnalysis(dataset(rows.filter(p=>p.id.startsWith('now'))),'social',filters).metrics.find(m=>m.id==='instagram-average');assert.equal(missing.current,20);assert.equal(missing.benchmark,null);assert.equal(missing.percentage,null);
const more=[...rows,...cohort('website','2026-10-10',20),post('draft','2026-10-11',999,{status:'draft'})];const a=decisionAnalysis(dataset(more),'social',filters);assert.equal(a.metrics.find(m=>m.id==='instagram-posts').current,6);assert.equal(a.metrics.find(m=>m.id==='instagram-engagement').current,120);assert.equal(a.metrics.find(m=>m.id==='instagram-average').current,20);
const imported=rows.map(p=>({...p,importSheet:'Historical Excel'}));assert.deepEqual(decisionAnalysis(dataset(imported),'social',filters).metrics,decisionAnalysis(dataset(rows),'social',filters).metrics);
const fullQuarter=decisionAnalysis(dataset(rows),'social',{...filters,end:'2026-12-31'},'qoq');assert.equal(fullQuarter.period.previousStart,'2026-07-01');assert.equal(fullQuarter.period.previousEnd,'2026-09-30');assert.equal(fullQuarter.metrics.find(m=>m.id==='instagram-posts').benchmark,6);
assert.equal(benchmarkPeriod('2024-01-01','2024-12-31','yoy').eligible,true,'complete leap calendar years remain valid calendar comparisons');
assert.equal(benchmarkPeriod('2024-02-10','2024-02-29','yoy').eligible,false,'clipped unequal partial windows still withhold changes');
const zeroReach=decisionAnalysis(dataset(visibility('reach').map(p=>({...p,reach:0}))),'social',filters).metrics.find(m=>m.id==='instagram-reach');assert.equal(zeroReach.current,0);assert.equal(zeroReach.difference,0);assert.equal(zeroReach.percentage,null);
assert.equal(decisionAnalysis(dataset(rows),'social',{...filters,account:'Instagram SEEN'}).metrics.find(m=>m.id==='instagram-average').current,null);
const analystFn=analystAnalysis||(await load('lib/social-analyst.ts')).buildAnalystAnalysis;
if(analystFn){const before=await analystFn(dataset(rows),filters),after=await analystFn(dataset(more),filters);assert.notEqual(before.revision,after.revision);}
const {default:PlatformCard}=await load('app/platform-performance-card.tsx');
const props={platform:'Instagram',stats:{posts:3,measured:3,engagement:60,average:20},metric:'reach',reported:{count:0,total:null},href:'/workspace/analytics/instagram'};
assert(!renderToStaticMarkup(React.createElement(PlatformCard,props)).includes('Instagram Reach'));
assert(renderToStaticMarkup(React.createElement(PlatformCard,{...props,reported:{count:3,total:0}})).includes('Instagram Reach'));
assert(renderToStaticMarkup(React.createElement(PlatformCard,{...props,metric:'views',reported:{count:3,total:500}})).includes('Instagram Views'));
const {default:PlatformAnalytics}=await load('app/social-media-analytics.tsx');
const platformHtml=renderToStaticMarkup(React.createElement(PlatformAnalytics,{posts:rows,initialPlatform:'Instagram',filters:{...filters,brand:undefined},onOpen:()=>{}}));assert(!platformHtml.includes('brand=undefined'));assert(platformHtml.includes('#growth-analysis'));assert(!platformHtml.includes('Instagram Reach</'));
assert.match(fs.readFileSync('app/platform-performance-card.tsx','utf8'),/reported.count\?/);
assert.match(fs.readFileSync('app/analytical-dashboards.tsx','utf8'),/stats.reach.n>0/);
console.log('PASS: MoM/QoQ/YoY without visibility, optional Facebook/Instagram Views and Reach, coverage, zeros, missing history, publishing volumes, drafts, account filters and shared website/import dataset.');
