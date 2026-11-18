import assert from 'node:assert/strict';
import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/analyst-verification-tests');
const {blankPost,defaultConfig}=await load('app/model.ts');
const {analystAnalysis,analystEvidence}=await load('lib/social-analyst.ts');
const {buildAnalystProof}=await load('lib/social-analyst.ts');
const {verifyAnalystOutput}=await load('lib/analyst-verification.ts');
const config={...structuredClone(defaultConfig),brands:['GLOW'],types:['Reel','Picture'],accounts:[{name:'Facebook GLOW',platform:'Facebook',brand:'GLOW'}]};
const p=(id,month,likes,format='Reel')=>({...blankPost(),id,title:'Private source '+id,account:'Facebook GLOW',brand:'GLOW',platform:'Facebook',date:'2026-'+month+'-05',status:'published',type:format,likes,comments:0,shares:0,saves:0,views:month==='10'?200:100,reportedMetrics:['likes','comments','shares','saves','views']});
const data={config,followers:[],interactions:[],posts:[...[0,1,2].map(n=>p('reel'+n,'10',20)),...[0,1,2].map(n=>p('picture'+n,'10',10,'Picture')),...[0,1,2].map(n=>p('old'+n,'09',10))]},filters={platform:'Facebook',account:'Facebook GLOW',brand:'GLOW',start:'2026-10-01',end:'2026-10-31'},analysis=await analystAnalysis(data,filters),candidate=analysis.candidates.find(c=>c.kind==='format');assert(candidate);
const insight={title:'Test a format',category:'content',finding:'The recorded group had a stronger response.',explanation:'A comparable follow-up may help staff choose a format to test.',recommendation:'Test the selected format and compare recorded interactions per post.',evidenceIds:[candidate.factId]},response={mode:'gemini',report:{insights:[insight]}};
const checked=verifyAnalystOutput(response,analysis);assert.equal(checked.accepted.length,1);assert.equal(checked.accepted[0].finding,candidate.observation);assert.equal(checked.accepted[0].verification.interpretation,'Hypothesis — staff review required');
assert(candidate.proof.eligible);assert.equal(candidate.proof.current.length,candidate.n);assert.equal(candidate.proof.comparison.length,candidate.peers);
for(const patch of [{baseline:999},{n:999},{account:'Another account'},{proof:{...candidate.proof,eligible:false}}])assert.equal(verifyAnalystOutput(response,{...analysis,candidates:analysis.candidates.map(c=>c.id===candidate.id?{...c,...patch}:c)}).accepted.length,0);
assert.equal(buildAnalystProof(candidate,data.posts.filter(p=>p.id!==candidate.baselinePostIds[0]),analysis.previous).eligible,false);
assert.equal(buildAnalystProof({...candidate,period:{start:'2026-11-01',end:'2026-11-30'}},data.posts,analysis.previous).eligible,false);
assert.equal(buildAnalystProof({...candidate,targetPostIds:[...candidate.targetPostIds,candidate.targetPostIds[0]]},data.posts,analysis.previous).eligible,false);
for(const invalid of [
 {...insight,finding:'Interactions increased by 12%.'},
 {...insight,explanation:'The result was twice as strong.'},
 {...insight,finding:'October 2025 results improved.'},
 {...insight,finding:'Post ID fake-post performed well.'},
 {...insight,explanation:'Instagram performed better.'},
 {...insight,explanation:'GLOW produced the best content.'},
 {...insight,explanation:'Sunshine account recorded better results.'},
 {...insight,explanation:'Bright Community posted stronger stories.'},
 {...insight,explanation:'This proves that the format caused engagement.'},
 {...insight,finding:'The matched format declined.'},
 {...insight,evidenceIds:['ANALYST999']},
 {...insight,evidenceIds:['SUMMARY']},
 {...insight,recommendation:99},
])assert.equal(verifyAnalystOutput({...response,report:{insights:[invalid]}},analysis).accepted.length,0,JSON.stringify(invalid));
assert.equal(verifyAnalystOutput({...response,cached:true,report:{insights:[{...insight,finding:'Changed by 900%.'}]}},analysis).accepted.length,0);
assert.equal(verifyAnalystOutput(response,{...analysis,sourcePostIds:[]}).accepted.length,0);
assert.equal(verifyAnalystOutput(response,{...analysis,candidates:[{...candidate,peers:1}]}).accepted.length,0);
assert.equal(verifyAnalystOutput({...response,report:{insights:[insight,insight]}},analysis).accepted.length,1);
assert.equal(verifyAnalystOutput({...response,mode:'calculated'},analysis).accepted.length,0);
assert.equal(verifyAnalystOutput({...response,report:{insights:null}},analysis).accepted.length,0);
const visibility=analysis.candidates.find(c=>c.kind==='visibility');assert(visibility);assert(visibility.statistics.includes('100%'));assert(visibility.statistics.includes('Facebook Views'));
const instagram={...data,config:{...config,accounts:[{name:'Instagram GLOW',platform:'Instagram',brand:'GLOW'}]},posts:data.posts.map(p=>({...p,platform:'Instagram',account:'Instagram GLOW',reach:p.date.startsWith('2026-10')?200:100,reportedMetrics:['likes','comments','shares','saves','reach']}))};const ig=await analystAnalysis(instagram,{...filters,platform:'Instagram',account:'Instagram GLOW'});assert(ig.candidates.some(c=>c.kind==='visibility'&&c.metric==='instagram_reach'&&c.statistics.includes('Instagram Reach')));
const zeroReach=await analystAnalysis({...instagram,posts:instagram.posts.map(p=>p.date.startsWith('2026-10')?{...p,reach:0}:p)},{...filters,platform:'Instagram',account:'Instagram GLOW'});assert(zeroReach.candidates.some(c=>c.kind==='visibility'&&c.statistics.includes('-100%')));
const missing=await analystAnalysis({...data,posts:data.posts.map(p=>({...p,reportedMetrics:['likes']}))},filters);assert(!missing.candidates.some(c=>c.kind==='visibility'));
const small=await analystAnalysis({...data,posts:data.posts.slice(0,2)},filters);assert(small.candidates.every(c=>c.kind==='measurement'));
const mixed=await analystAnalysis({...data,posts:data.posts.map(p=>p.id.startsWith('picture')?{...p,reportedMetrics:['likes']}:p)},filters);assert(!mixed.candidates.some(c=>c.kind==='format'));
const extremes=await analystAnalysis({...data,posts:[p('high','10',100),p('low','10',1),p('a','10',10),p('b','10',10),p('c','10',10)]},filters);assert(extremes.candidates.some(c=>c.kind==='strong'));assert(extremes.candidates.some(c=>c.kind==='review'));
const changedBaseline=await analystAnalysis({...data,posts:data.posts.map(p=>p.id==='old0'?{...p,likes:50}:p)},filters);assert.notEqual(changedBaseline.revision,analysis.revision);
const changedAge=await analystAnalysis({...data,posts:data.posts.map(p=>p.id==='reel0'?{...p,metric_observed_at:{likes:'2026-10-12T00:00:00Z'}}:p)},filters);assert.notEqual(changedAge.revision,analysis.revision);
assert(!JSON.stringify(analystEvidence(analysis)).includes('Private source'));
console.log('PASS: canonical statistics/dates, numerical and spelled-quantity rejection, source IDs, account/platform/direction/cohort checks, missing and small groups, high/low posts, separate visibility, cached-response revalidation, baseline/age revision invalidation and privacy.');

const {intelligenceResponse}=await load('lib/intelligence/service.ts');const cacheRows=new Map();let providerCalls=0;const cache={read:async key=>cacheRows.get(key)||null,reserve:async()=>crypto.randomUUID(),save:async(key,token,payload,expiresAt)=>cacheRows.set(key,{payload,expiresAt}),release:async()=>{}};const provider={name:'gemini',model:'verification-mock',interpret:async()=>{providerCalls++;return {summary:{text:'Review a matched test.',evidenceIds:[candidate.factId]},insights:[insight],limitations:['Observational only.']};}};
await intelligenceResponse(analystEvidence(analysis),provider,cache);assert.equal((await intelligenceResponse(analystEvidence(analysis),provider,cache)).cached,true);assert.equal(providerCalls,1);assert.equal((await intelligenceResponse(analystEvidence(changedBaseline),provider,cache)).cached,false);assert.equal(providerCalls,2);
const busy=await intelligenceResponse(analystEvidence(analysis),provider,{...cache,read:async()=>null,reserve:async()=>null});assert.equal(busy.reason,'busy');assert.equal(verifyAnalystOutput(busy,analysis).accepted.length,0);console.log('PASS: real evidence-hash cache reuse, invalidation after baseline edits, and quota/busy fallback without fabricated insights.');

const instagramViews=await analystAnalysis({...instagram,posts:instagram.posts.map(p=>({...p,reportedMetrics:['likes','comments','shares','saves','views']}))},{...filters,platform:'Instagram',account:'Instagram GLOW'});assert(instagramViews.candidates.some(c=>c.metric==='instagram_views'&&c.proof.eligible));assert(!instagramViews.candidates.some(c=>c.metric==='instagram_reach'));
const mismatchedVisibilityAge=await analystAnalysis({...data,posts:data.posts.map(p=>({...p,metric_observed_at:{views:p.date.startsWith('2026-10')?'2026-10-12T00:00:00Z':'2026-09-19T00:00:00Z'}}))},filters);assert(!mismatchedVisibilityAge.candidates.some(c=>c.kind==='visibility'));
const broken=await intelligenceResponse(analystEvidence(analysis),{...provider,model:'failure-test',interpret:async()=>{throw Error('Mock outage');}},cache);assert.equal(broken.mode,'calculated');assert.equal(broken.reason,'unavailable');assert.equal(verifyAnalystOutput(broken,analysis).accepted.length,0);
console.log('PASS: reconciled baseline/sample/account proof, missing/duplicate/date-invalid sources, optional Instagram Views, incompatible visibility ages and provider-outage fallback.');

const second=analysis.candidates.find(c=>c.id!==candidate.id&&c.kind!=='measurement');assert(second);const duplicate=verifyAnalystOutput({...response,report:{insights:[insight,{...insight,evidenceIds:[second.factId]}]}},analysis);assert.equal(duplicate.accepted.length,1);assert(duplicate.rejected.some(r=>r.reason==='Repeated suggested action'));console.log('PASS: duplicate AI actions across distinct evidence references are withheld.');
