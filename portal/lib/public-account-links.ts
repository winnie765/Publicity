import type {Config} from '../app/model';
import type {PublicHomeSettings} from './public-site-config';
import {withMasterRegistry} from './master-relationships';
import {accountIsActive,accountProfileUrl} from './account-profile';
export type PublicAccountRef={accountId:string;hidden:boolean};
export type LegacySocialLink={label:string;url:string;platform:string;hidden:boolean};
export function configuredPublicAccounts(config:Config){const c=withMasterRegistry(config);return c.accounts.filter(a=>['Facebook','Instagram'].includes(a.platform)).map(a=>({...a,id:c.masterRegistry!.accounts.find(e=>e.name===a.name)!.id}));}
export function legacySocialLinks(home:PublicHomeSettings):LegacySocialLink[]{if(home.socialAccounts!==undefined)return home.socialAccounts;const value=home as unknown as Record<string,string>;return ['facebookGlow','facebookSeen','facebookLc','instagramGlow','instagramLc'].flatMap(key=>value[key+'Link']?[{label:value[key+'Label']||'',url:value[key+'Link'],platform:key.startsWith('facebook')?'Facebook':'Instagram',hidden:false}]:[]);}
export function publicAccountBindings(home:PublicHomeSettings,config:Config){
 const accounts=configuredPublicAccounts(config);if(home.socialAccountRefs!==undefined)return {accounts,refs:home.socialAccountRefs,pending:home.socialLegacyPending||[]};
 const refs:PublicAccountRef[]=[],pending:LegacySocialLink[]=[];
 for(const old of legacySocialLinks(home)){const matches=accounts.filter(a=>{try{return a.platform===old.platform&&a.name===old.label&&!!a.profileUrl&&accountProfileUrl(a.profileUrl,a.platform)===accountProfileUrl(old.url,old.platform);}catch{return false;}});if(matches.length!==1){pending.push(old);continue;}if(!refs.some(r=>r.accountId===matches[0].id))refs.push({accountId:matches[0].id,hidden:old.hidden});}
 return {accounts,refs,pending};
}
export function resolvedPublicSocialLinks(home:PublicHomeSettings,config:Config):LegacySocialLink[]{const {accounts,refs,pending}=publicAccountBindings(home,config),links:LegacySocialLink[]=[];
 for(const ref of refs){const a=accounts.find(a=>a.id===ref.accountId);if(!ref.hidden&&a&&accountIsActive(a))links.push({label:a.name,platform:a.platform,url:accountProfileUrl(a.profileUrl,a.platform),hidden:false});}
 // Unmatched saved links stay public until staff hide or link them explicitly.
 for(const old of pending){if(old.hidden||accounts.some(a=>a.name===old.label&&a.platform===old.platform&&!accountIsActive(a)))continue;try{const url=accountProfileUrl(old.url,old.platform);if(url&&old.label.trim())links.push({...old,url});}catch{/* Unsafe legacy URLs are retained privately for review, never rendered. */}}
 const unique=new Map<string,LegacySocialLink>();for(const link of links){const key=link.platform+'|'+link.url;if(!unique.has(key))unique.set(key,link);}return [...unique.values()];
}
export function validatePublicAccountRefs(value:unknown,config:Config,retainedIds:string[]=[]):PublicAccountRef[]|undefined{if(value===undefined)return undefined;if(!Array.isArray(value)||value.length>200)throw Error('Choose up to 200 configured accounts.');const accounts=configuredPublicAccounts(config),seen=new Set<string>();return value.map(ref=>{if(!ref||typeof ref.accountId!=='string'||typeof ref.hidden!=='boolean'||(!accounts.some(a=>a.id===ref.accountId)&&!retainedIds.includes(ref.accountId))||seen.has(ref.accountId))throw Error('Choose unique configured Facebook or Instagram accounts.');seen.add(ref.accountId);return {accountId:ref.accountId,hidden:ref.hidden};});}
