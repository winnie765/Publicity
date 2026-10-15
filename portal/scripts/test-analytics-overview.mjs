import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
fs.mkdirSync('.sites-runtime',{recursive:true});
for(const name of ['themed-select','display-labels','model','account-structure','follower-snapshots','follower-accounts','import','standard-workbook','top-hits','facebook-follower-analytics','analytics-overview','charts','ai-intelligence','post-performance-cards','analytics-ui','executive-dashboard','social-media-analytics']){
 const file='app/'+name+(fs.existsSync('app/'+name+'.tsx')?'.tsx':'.ts');
 const source=fs.readFileSync(file,'utf8').replace(/from '\.\/([\w-]+)'/g,"from './$1.mjs'");
 fs.writeFileSync('.sites-runtime/'+name+'.mjs',ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
}
const {defaultConfig,blankPost}=await import('../.sites-runtime/model.mjs');
const {overview,recordedMetric,monthlyEngagement,performanceFindings,accountPerformance}=await import('../.sites-runtime/analytics-overview.mjs');
const {prepareStandardWorkbook,extractSheetData}=await import('../.sites-runtime/standard-workbook.mjs');
const {default:Dashboard}=await import('../.sites-runtime/executive-dashboard.mjs');
const {default:Analytics}=await import('../.sites-runtime/social-media-analytics.mjs');
const empty={posts:[],followers:[],interactions:[],kpis:[],config:structuredClone(defaultConfig)};
const base={...blankPost(),platform:'Facebook',date:'2026-01-31',likes:20,comments:2,shares:3,reportedMetrics:['likes','comments','shares'],featuresKnown:false};
const missing={...base,id:'missing',likes:0,comments:0,shares:0,reportedMetrics:['views']};
assert.equal(overview([base,missing,{...base,status:'draft'},{...base,platform:'Workvivo'}]).posts,2);
assert.equal(overview([base,missing]).average,25);assert.equal(overview([missing]).average,null);
assert.equal(recordedMetric([base],'views').total,null);assert.equal(recordedMetric([{...base,views:0,reportedMetrics:['views']}],'views').total,0);
const months=monthlyEngagement([base,{...base,id:'march',date:'2026-03-31',platform:'Instagram'}],'Facebook');
assert.equal(months.length,3);assert.equal(months[0].engagement,25);assert.equal(months[1].engagement,undefined);assert.equal(months[2].engagement,undefined);
assert(!performanceFindings([base,missing]).some(f=>/senior|HHP/i.test(f.title)));
const wb=new ExcelJS.Workbook();await wb.xlsx.readFile(process.argv[2]);const prepared=await prepareStandardWorkbook(extractSheetData(wb),empty);const data={...empty,config:prepared.config};for(const b of prepared.batches)data[b.kind]=b.items;
const external=data.posts.filter(p=>['Facebook','Instagram'].includes(p.platform));
const props={data,posts:external,start:'2025-09-01',end:'2026-12-31',onOpen:()=>{},onNavigate:()=>{}};
const html=renderToStaticMarkup(React.createElement(Dashboard,props));
for(const label of ['Total Posts','Total Engagements','Total Followers','Average Engagement Per Post','Total Top Hits','Best Performing Brand','Best Performing Platform','Executive Insights','GLOW Overview','SEEN Overview','Top 5 Facebook Hits','Top 5 Instagram Hits','View Full Top Hits Analysis'])assert(html.includes(label),label);
assert.equal((html.match(/class="labelled-trend"/g)||[]).length,2,'Executive dashboard has exactly two charts');
assert.equal((html.match(/type="checkbox"/g)||[]).length,4,'Four account toggles');
assert.equal((html.match(/class="snapshot-title"/g)||[]).length,10,'Five independently ranked posts per platform');
assert(html.indexOf('Executive Insights')<html.indexOf('Monthly Engagement Trend'));
assert(!html.includes('Engagement by Content Type'));
const staff=renderToStaticMarkup(React.createElement(Analytics,{data,posts:external,onOpen:()=>{}}));
for(const label of ['Facebook Top 10 Hits','Total Views','Engagement by Content Type','Engagement by Brand','Monthly Performance Trend','Facebook Insights'])assert(staff.includes(label),label);
assert.equal((staff.match(/role="tab"/g)||[]).length,2);
assert.equal((staff.match(/class="snapshot-title"/g)||[]).length,10);
assert(staff.includes('>Views</th>'));assert(!staff.includes('>Reach</th>'));
// Render the same component with the Instagram tab initially selected.
const ig=renderToStaticMarkup(React.createElement(Analytics,{data,posts:external,onOpen:()=>{},initialPlatform:'Instagram'}));assert(ig.includes('Instagram Top 10 Hits'));assert(ig.includes('Total Reach'));assert(ig.includes('>Reach</th>'));assert(!ig.includes('>Views</th>'));
console.log('PASS: measured engagement, missing observations, separate platform metrics, seven executive KPIs, two executive charts, four follower toggles, split Top 5/Top 10 rankings and both platform tabs using the official workbook.');

const accounts=accountPerformance(external,data.config.accounts);
for(const a of accounts){const own=external.filter(p=>p.account===a.name);assert.equal(a.posts,own.length);assert.equal(a.engagement,own.reduce((n,p)=>n+(p.engagementTotal??p.likes+p.comments+p.shares+p.saves),0));}
assert(staff.includes('Facebook Account Comparison'));assert(staff.includes('Facebook GLOW'));assert(staff.includes('Facebook SEEN'));
assert(ig.includes('Instagram Account Comparison'));assert(ig.includes('Instagram GLOW'));assert(ig.includes('Instagram SEEN'));
const {topHits}=await import('../.sites-runtime/top-hits.mjs');
const synthetic=['Facebook','Instagram'].flatMap(platform=>Array.from({length:12},(_,i)=>({...base,id:platform+i,account:platform+' '+(i%2?'GLOW':'SEEN'),brand:i%2?'GLOW':'SEEN',platform,likes:100-i})));
for(const section of topHits(synthetic).sections){assert.equal(section.hits.length,10);assert.deepEqual([...new Set(section.hits.map(p=>p.brand))].sort(),['GLOW','SEEN']);assert(section.hits.every(p=>p.platform===section.platform));}
console.log('PASS: account comparisons isolate metrics and each platform Top 10 includes both brands.');
