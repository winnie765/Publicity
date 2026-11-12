import type {Dataset} from '../app/model';
import type {Filters} from './intelligence/types';
import {executiveIntelligence,executiveEvidence,type ExecutiveMode} from './executive-intelligence';
export async function resolveExecutiveFocus(data:Dataset,id:unknown,input:Filters={},rawMode:unknown='custom'){
 if(typeof id!=='string'||id.length>100||!['custom','mom','qoq','yoy'].includes(String(rawMode)))throw Error('Choose a valid Executive finding and comparison.');
 const mode=rawMode as ExecutiveMode,analysis=executiveIntelligence(data,input,mode),finding=analysis.findings.find(f=>f.id===id);if(!finding)return null;
 const bytes=new TextEncoder().encode(JSON.stringify({finding,filters:analysis.filters,mode})),revision=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 return {finding,filters:analysis.filters,mode,revision,evidence:executiveEvidence(finding)};
}
export type ExecutiveFocus=NonNullable<Awaited<ReturnType<typeof resolveExecutiveFocus>>>;
