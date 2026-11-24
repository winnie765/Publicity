import fs from 'node:fs';import assert from 'node:assert/strict';import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/studio-facts-tests'),{assertProgrammeClaims}=await load('lib/studio-facts.ts'),{assertWritingGrounded,assertAIPrivacy}=await load('lib/ai-safety.ts');
export const brief='Programme: Click & Capture: Handphone Photography\nDate: 3 December 2026\nTime: 1 PM to 3 PM\nVenue: Wisdom Hall\nAudience: Seniors\nOrganisation: Tzu Chi SEEN @ Bukit Batok\nAdmission fee: Not provided\nRegistration requirements: Not provided\nAttendance figures: Not provided';
export const review=draft=>{assertAIPrivacy(draft);assertWritingGrounded(draft,brief);assertProgrammeClaims({title:'Programme announcement',draft},brief);};
const valid=[
'Join Tzu Chi SEEN @ Bukit Batok for Click & Capture: Handphone Photography at Wisdom Hall on 3 December 2026, 1 PM to 3 PM. Explore photography with fellow seniors.',
'欢迎长者参加 Click & Capture: Handphone Photography。日期：2026年12月3日。时间：下午1点至下午3点。地点：Wisdom Hall。主办单位：Tzu Chi SEEN @ Bukit Batok。一起发现日常生活中的美。',
'Click & Capture: Handphone Photography\n3 December 2026, 1 PM to 3 PM, Wisdom Hall.\n欢迎长者一起探索手机摄影。Tzu Chi SEEN @ Bukit Batok',
'Capture everyday moments with fellow seniors at Wisdom Hall. Join Click & Capture: Handphone Photography, 3 December 2026, 1 PM to 3 PM. Tzu Chi SEEN @ Bukit Batok.',
'Find beauty in everyday moments. Click & Capture: Handphone Photography at Wisdom Hall, 3 December 2026, 1 PM to 3 PM. Tzu Chi SEEN @ Bukit Batok.'
];
const invalid=['Admission is free.','Free entry!','No registration required. Walk-ins welcome.','无需报名，欢迎现场参加。','免费入场。','地点：智慧礼堂','活动将在和谐中心举行。','4 December 2026','4 PM','Venue: Harmony Hall','Admission fee: $3','Registration required.','Register by 3 December 2026.','3 participants attended.','This programme cures dementia.','这个活动可预防痴呆。','A participant said: "This changed my life forever."','Participant phone: 91234567','这个课程提升记忆力。','A senior said it changed her life.','Registration deadline: 3 December 2026.'];
for(const draft of valid)assert.doesNotThrow(()=>review(draft),draft);
for(const draft of invalid)assert.throws(()=>review(draft),draft);
assert.doesNotThrow(()=>assertProgrammeClaims({title:'Invitation',draft:'Join us and discover something new.'},'Programme: Photography'));
assert.doesNotThrow(()=>assertProgrammeClaims({title:'Invitation',draft:'Free entry.'},'Admission fee: Free entry.'));
assert.doesNotThrow(()=>assertProgrammeClaims({title:'Invitation',draft:'No registration required.'},'Registration requirements: No registration required.'));
fs.writeFileSync('.sites-runtime/studio-facts-tests/samples.json',JSON.stringify(valid,null,2));
console.log('PASS '+(valid.length+invalid.length+3)+' Content Studio cases. Samples are authored fixtures, not live model output.');
const {generateStudio}=await load('lib/content-studio.ts');
const input={task:'Event Promotion',language:'English',brief,audience:'Seniors',brand:'Tzu Chi SEEN @ Bukit Batok',previousDraft:''};
let saves=0,releases=0,calls=0;
const runtime={config:{provider:'gemini',apiKey:'mock',model:'gemini-2.5-flash'},dailyLimit:40,cache:{read:async()=>null,reserve:async()=> 'lease',save:async()=>{saves++;},release:async()=>{releases++;}}};
const fake=draft=>async()=>{calls++;return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({title:'Programme announcement',draft})}]}}]});};
await assert.rejects(()=>generateStudio(input,runtime,fake('Free entry.')));
assert.equal(saves,0);assert.equal(releases,1);
await generateStudio(input,runtime,fake(valid[0]));assert.equal(saves,1);
const cached={...runtime,cache:{...runtime.cache,read:async()=>({payload:JSON.stringify({title:'Announcement',draft:'地点：智慧礼堂'}),expiresAt:Date.now()+60000})}};
await assert.rejects(()=>generateStudio(input,cached,fake(valid[0])));assert.equal(calls,2,'Unsafe cache is rejected without a model call');
await assert.rejects(()=>generateStudio(input,runtime,async()=>Response.json({},{status:503})));
console.log('PASS live-path mock checks: reject before caching, accept valid source, revalidate cache, preserve service failure. No real provider calls.');
