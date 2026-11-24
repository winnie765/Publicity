import fs from 'node:fs';import {testCompiler} from './test-support/compiler.mjs';import {brief} from './test-content-studio-facts.mjs';
const load=testCompiler('.sites-runtime/studio-live-compiled'),{generateStudio}=await load('lib/content-studio.ts');
if(!process.env.GEMINI_API_KEY)throw Error('Gemini is not configured');
const tasks=[['Event Promotion','English'],['Event Promotion','Chinese'],['Event Promotion','English + Chinese'],['Facebook Caption','English'],['Instagram Caption','Chinese']],results=[];
outer: for(const [task,language] of tasks)for(let sample=1;sample<=2;sample++){
 const start=performance.now();let usage=null,output=null;const runtime={config:{provider:'gemini',model:process.env.GEMINI_MODEL||'gemini-2.5-flash',apiKey:process.env.GEMINI_API_KEY},dailyLimit:10,cache:{read:async()=>null,reserve:async()=>crypto.randomUUID(),save:async()=>{},release:async()=>{}}};
 try{await generateStudio({task,language,brief,audience:'Seniors',brand:'Tzu Chi SEEN @ Bukit Batok',previousDraft:''},runtime,async(url,init)=>{const response=await fetch(url,init);if(response.ok){const body=await response.clone().json();usage=body.usageMetadata;const parts=body.candidates?.[0]?.content?.parts||[];try{output=JSON.parse(parts.filter(p=>!p.thought).map(p=>p.text||'').join(''));}catch{}}return response;});results.push({task,language,sample,output,usage,ms:Math.round(performance.now()-start),validation:'passed'});}catch(e){results.push({task,language,sample,output,usage,ms:Math.round(performance.now()-start),validation:'withheld',error:e.message});}
 fs.writeFileSync('docs/content-studio-live-results.json',JSON.stringify({date:'2026-11-24',model:runtime.config.model,source:brief,results},null,2));console.log(task,language,sample,results.at(-1).validation,results.at(-1).ms);
 if(!output){console.log('Provider unavailable: stopping further requests.');process.exitCode=1;break outer;}
}
