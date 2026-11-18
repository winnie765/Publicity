import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/analytics-overview-isolated',{transform:source=>source.replace(/import \{useRouter\} from 'next\/navigation';/g,'const useRouter=()=>({push:()=>{}});')});
const {defaultConfig,blankPost}=await load('app/model.ts');
const {overview,recordedMetric,monthlyEngagement,performanceFindings,accountPerformance}=await load('app/analytics-overview.ts');
const {prepareStandardWorkbook,extractSheetData}=await load('app/standard-workbook.ts');
const {default:Dashboard}=await load('app/executive-dashboard.tsx');
const {default:Analytics}=await load('app/social-media-analytics.tsx');
const empty={posts:[],followers:[],interactions:[],kpis:[],config:structuredClone(defaultConfig)};
const base={...blankPost(),platform:'Facebook',date:'2026-01-31',likes:20,comments:2,shares:3,reportedMetrics:['likes','comments','shares'],featuresKnown:false};
const missing={...base,id:'missing',likes:0,comments:0,shares:0,reportedMetrics:['views']};
assert.equal(overview([base,missing,{...base,status:'draft'},{...base,platform:'Workvivo'}]).posts,2);
assert.equal(overview([base,missing]).average,25);assert.equal(overview([missing]).average,null);
assert.equal(recordedMetric([base],'views').total,null);assert.equal(recordedMetric([{...base,views:0,reportedMetrics:['views']}],'views').total,0);
const months=monthlyEngagement([base,{...base,id:'march',date:'2026-03-31',platform:'Instagram'}],'Facebook');
assert.equal(months.length,3);assert.equal(months[0].engagement,25);assert.equal(months[1].engagement,undefined);assert.equal(months[2].engagement,undefined);
assert(!performanceFindings([base,missing]).some(f=>/senior|HHP/i.test(f.title)));
if(process.argv[2]){
const wb=new ExcelJS.Workbook();await wb.xlsx.readFile(process.argv[2]);const prepared=await prepareStandardWorkbook(extractSheetData(wb),empty);const data={...empty,config:prepared.config};for(const b of prepared.batches)data[b.kind]=b.items;
const external=data.posts.filter(p=>['Facebook','Instagram'].includes(p.platform));
const props={data,posts:external,start:'2025-09-01',end:'2026-12-31',onOpen:()=>{},onNavigate:()=>{}};
const html=renderToStaticMarkup(React.createElement(Dashboard,props));
for(const label of ['Total Posts','Total Engagements','Total Followers','Average Engagement Per Post','Total Top Hits','Best Performing Brand','Best Performing Platform','AI EXECUTIVE BRIEFING','GLOW Overview','SEEN Overview','Top 3 Facebook Hits','Top 3 Instagram Hits','View Full Top Hits Analysis'])assert(html.includes(label),label);
assert.equal((html.match(/class="labelled-trend"/g)||[]).length,2,'Executive dashboard has exactly two charts');
assert.equal((html.match(/type="checkbox"/g)||[]).length,6,'Six account toggles including LC');
assert.equal((html.match(/class="dashboard-hit"/g)||[]).length,6,'Three independently ranked posts per platform');
assert(html.indexOf('AI EXECUTIVE BRIEFING')<html.indexOf('Monthly Engagement Trend'));
for(const label of ['Facebook Performance Snapshot','Instagram Performance Snapshot','Facebook vs Instagram Comparison','Stakeholder Snapshot','Recommended Next Actions','Quick Actions'])assert(html.includes(label),label);
assert(html.includes('Show existing Top 5 comparison tables'));
assert(!html.includes('Engagement by Content Type'));
const staff=renderToStaticMarkup(React.createElement(Analytics,{data,posts:external,onOpen:()=>{}}));
for(const label of ['Facebook Top 10 Hits','Total Views','Engagement by Content Type','Engagement by Brand','Monthly Performance Trend','Facebook Insights'])assert(staff.includes(label),label);
assert.equal((staff.match(/role="tab"/g)||[]).length,2);
assert.equal((staff.match(/class="snapshot-title"/g)||[]).length,10);
assert(staff.includes('>Views</th>'));assert(!staff.includes('>Reach</th>'));
// Render the same component with the Instagram tab initially selected.
const ig=renderToStaticMarkup(React.createElement(Analytics,{data,posts:external,onOpen:()=>{},initialPlatform:'Instagram'}));assert(ig.includes('Instagram Top 10 Hits'));assert(ig.includes('Total Reach'));assert(ig.includes('>Reach</th>'));assert(!ig.includes('>Views</th>'));
console.log('PASS: measured engagement, missing observations, separate platform metrics, executive KPIs, two charts, six follower toggles, split Top 3/Top 10 rankings with retained Top 5 comparison and both platform tabs using the official workbook.');

const accounts=accountPerformance(external,data.config.accounts);
for(const a of accounts){const own=external.filter(p=>p.account===a.name);assert.equal(a.posts,own.length);assert.equal(a.engagement,own.reduce((n,p)=>n+(p.engagementTotal??p.likes+p.comments+p.shares+p.saves),0));}
assert(staff.includes('Facebook Account Comparison'));assert(staff.includes('Facebook GLOW'));assert(staff.includes('Facebook SEEN'));
assert(ig.includes('Instagram Account Comparison'));assert(ig.includes('Instagram GLOW'));assert(ig.includes('Instagram SEEN'));
}else console.log('SKIP: official-workbook dashboard assertions require a workbook path as the first argument. Synthetic metric and ranking checks still run.');
const {topHits}=await load('app/top-hits.ts');
const synthetic=['Facebook','Instagram'].flatMap(platform=>Array.from({length:12},(_,i)=>({...base,id:platform+i,account:platform+' '+(i%2?'GLOW':'SEEN'),brand:i%2?'GLOW':'SEEN',platform,likes:100-i})));
for(const section of topHits(synthetic).sections){assert.equal(section.hits.length,10);assert.deepEqual([...new Set(section.hits.map(p=>p.brand))].sort(),['GLOW','SEEN']);assert(section.hits.every(p=>p.platform===section.platform));}
console.log('PASS: account comparisons isolate metrics and each platform Top 10 includes both brands.');
