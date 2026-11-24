import {geminiRequest,aiCachePolicy} from './gemini-request';
import {withoutEmoji} from './ui-text';
import {assertAIPrivacy,assertWritingGrounded} from './ai-safety';
import type {generateWriting} from './content-writing';
export const studioTasks=['Content Ideas','Facebook Caption','Instagram Caption','Workvivo Caption','Improve Write-up','Campaign Plan','Event Promotion','Community Story','Website Content','Monthly Report Draft','Stakeholder Update','Email Draft','Hashtags'] as const;
export type StudioInput={task:string;language:string;brief:string;audience:string;brand:string;previousDraft:string};
export function studioInput(value:any):StudioInput{
 if(!value||!studioTasks.includes(value.task)||!['English','Chinese','English + Chinese'].includes(value.language))throw Error('Choose a task and language.');
 const out:any={task:value.task,language:value.language};
 for(const [key,max] of Object.entries({brief:6000,audience:400,brand:120,previousDraft:16000})){if(typeof value[key]!=='string'||value[key].length>max)throw Error('Please shorten the writing fields.');out[key]=value[key].trim();}
 if(!out.brief)throw Error('Describe what you would like to create.');assertAIPrivacy(out);return out;
}
export function validateStudio(value:any):{title:string;draft:string}{if(typeof value?.title!=='string'||!value.title.trim()||value.title.length>200||typeof value?.draft!=='string'||!value.draft.trim()||value.draft.length>16000)throw Error('The draft was incomplete. Please try again.');const title=withoutEmoji(value.title),draft=withoutEmoji(value.draft);if(!title||!draft)throw Error('The draft was incomplete. Please try again.');return {title,draft};}
export async function generateStudio(input:StudioInput,runtime:Parameters<typeof generateWriting>[1],fetcher:typeof fetch=fetch){
 assertAIPrivacy(input);
 const key='studio:'+Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([aiCachePolicy(runtime.config.model,'writing'),runtime.config.model,input])))),b=>b.toString(16).padStart(2,'0')).join('');
 const review=(value:unknown)=>{const output=validateStudio(value);assertAIPrivacy(output);assertWritingGrounded(output,{...input,previousDraft:''});return output;};
 const cached=await runtime.cache.read(key);if(cached&&cached.expiresAt>Date.now()){try{return {output:review(JSON.parse(cached.payload)),cached:true};}catch{throw Error('Cached AI draft did not pass current checks. Your source remains available; try a revised brief.');}}
 if(runtime.config.provider!=='gemini'||!runtime.config.apiKey)throw Error('Gemini is unavailable. Your brief and draft remain available.');
 const token=await runtime.cache.reserve(key,Date.now(),runtime.dailyLimit);if(!token)throw Error('AI is busy or the shared daily generation limit has been reached. Please try later.');
 try{
  if(!/^[a-z0-9][a-z0-9.-]{0,100}$/.test(runtime.config.model))throw Error('Invalid AI model.');
  const guardedFetch=(url:string,init:RequestInit)=>geminiRequest(fetcher,url,init,'writing');
  const response=await guardedFetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(runtime.config.model)+':generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':runtime.config.apiKey},signal:AbortSignal.timeout(45000),body:JSON.stringify({systemInstruction:{parts:[{text:'You are a senior communications editor for Tzu Chi Community Care Singapore. This is a content creation studio, not an analytics assistant. Fulfil the selected task directly: captions, ideas, programme publicity, campaign plans, stories, website copy, stakeholder updates or email. Follow English, natural Simplified Chinese or clearly separated bilingual output. Match the platform and audience. Campaign plans need an objective, story angles, channels, a content sequence and next steps; emails need a subject and message. Report drafts use supplied facts and placeholders for missing results. Never invent confirmed events or claim access to internal analytics. Refine previous wording without treating it as verified evidence. Return title and draft only, with readable headings and paragraphs. Plain text, no HTML, emojis or decorative symbols. Do not claim that messages were sent or content was published.'}]},contents:[{role:'user',parts:[{text:JSON.stringify(input)}]}],generationConfig:{temperature:0.5,maxOutputTokens:8192,...(runtime.config.model.startsWith('gemini-2.5-')?{thinkingConfig:{thinkingBudget:0}}:{}),responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{title:{type:'STRING'},draft:{type:'STRING'}},required:['title','draft']}}})});
  if(!response.ok)throw Error('Gemini could not generate this draft. Please try again.');const raw=await response.text();if(raw.length>150000)throw Error('The response was too large.');const candidate=JSON.parse(raw).candidates?.[0];if(candidate?.finishReason!=='STOP')throw Error('The draft was not completed. Please try again.');
  const output=review(JSON.parse(candidate.content.parts.filter((p:any)=>!p.thought&&typeof p.text==='string').map((p:any)=>p.text).join('')));await runtime.cache.save(key,token,JSON.stringify(output),Date.now()+3600000);return {output,cached:false};
 }catch(e){await runtime.cache.release(key,token,Date.now()+15000);throw e;}
}
