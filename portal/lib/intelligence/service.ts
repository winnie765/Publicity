import type {AICache,AIResponse,EvidencePack,IntelligenceProvider,IntelligenceReport} from './types';
export function calculatedReport(pack:EvidencePack):IntelligenceReport{
 return {summary:{text:'AI interpretation is unavailable. Calculated metrics and recorded evidence remain available.',evidenceIds:[]},insights:[],limitations:pack.limitations};
}
export async function intelligenceResponse(pack:EvidencePack,provider:IntelligenceProvider|null,cache:AICache,limit=40):Promise<AIResponse>{
 const now=Date.now(),fallback=(reason:AIResponse['reason']):AIResponse=>({mode:'calculated',reason,model:null,generatedAt:new Date(now).toISOString(),cached:false,report:calculatedReport(pack),facts:pack.facts});
 if(!provider)return fallback('not_configured');
 if(!pack.plannerContext&&!pack.facts.some(f=>f.label==='Recorded performance'&&!f.text.startsWith('0 published posts'))&&!pack.facts.some(f=>f.label.includes('follower history')&&!f.text.startsWith('No resolved')))return fallback('no_data');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({pack,provider:provider.name,model:provider.model,prompt:'executive-strategy-cards-v8'}))),key='report:'+Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
 let token:string|null=null;
 try{const prior=await cache.read(key);if(prior&&prior.expiresAt>now){const cached=JSON.parse(prior.payload);if(cached?.report)return {...cached,cached:true,facts:pack.facts};return fallback('unavailable');}token=await cache.reserve(key,now,limit);if(!token)return fallback('busy');const report=await provider.interpret(pack);const result:AIResponse={mode:'gemini',model:provider.model,generatedAt:new Date().toISOString(),cached:false,report,facts:pack.facts};await cache.save(key,token,JSON.stringify(result),now+6*60*60*1000);return result;}catch{if(token)try{await cache.release(key,token,now+60_000);}catch{}return fallback('unavailable');}
}
