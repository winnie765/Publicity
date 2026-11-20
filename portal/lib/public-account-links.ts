import type {Config} from '../app/model';
import type {PublicHomeSettings} from './public-site-config';
import {withMasterRegistry} from './master-relationships';
import {accountIsActive,accountProfileUrl} from './account-profile';
export type PublicAccountRef={accountId:string;hidden:boolean};
export type LegacySocialLink={label:string;url:string;platform:string;hidden:boolean;brand?:string};
export function configuredPublicAccounts(config:Config){const c=withMasterRegistry(config);return c.accounts.filter(a=>['Facebook','Instagram'].includes(a.platform)).map(a=>({...a,id:c.masterRegistry!.accounts.find(e=>e.name===a.name)!.id}));}
export function legacySocialLinks(home:PublicHomeSettings):LegacySocialLink[]{if(home.socialAccounts!==undefined)return home.socialAccounts;const value=home as unknown as Record<string,string>;return ['facebookGlow','facebookSeen','facebookLc','instagramGlow','instagramLc'].flatMap(key=>value[key+'Link']?[{label:value[key+'Label']||'',url:value[key+'Link'],platform:key.startsWith('facebook')?'Facebook':'Instagram',hidden:false}]:[]);}
export function publicAccountBindings(home:PublicHomeSettings,config:Config){
 const accounts=configuredPublicAccounts(config);if(home.socialAccountRefs!==undefined)return {accounts,refs:home.socialAccountRefs,pending:home.socialLegacyPending||[]};
 const refs:PublicAccountRef[]=[],pending:LegacySocialLink[]=[];
 for(const old of legacySocialLinks(home)){const matches=accounts.filter(a=>{try{return a.platform===old.platform&&a.name===old.label&&!!a.profileUrl&&accountProfileUrl(a.profileUrl,a.platform)===accountProfileUrl(old.url,old.platform);}catch{return false;}});if(matches.length!==1){pending.push(old);continue;}if(!refs.some(r=>r.accountId===matches[0].id))refs.push({accountId:matches[0].id,hidden:old.hidden});}
 return {accounts,refs,pending};
}
export function resolvedPublicSocialLinks(home:PublicHomeSettings,config:Config):LegacySocialLink[]{const {accounts,refs,pending}=publicAccountBindings(home,config),links:LegacySocialLink[]=[];
 for(const ref of refs){const a=accounts.find(a=>a.id===ref.accountId);if(!ref.hidden&&a&&accountIsActive(a))links.push({label:a.name,platform:a.platform,brand:a.brand||undefined,url:accountProfileUrl(a.profileUrl,a.platform),hidden:false});}
 // Unmatched saved links stay public until staff hide or link them explicitly.
 for(const old of pending){if(old.hidden||accounts.some(a=>a.name===old.label&&a.platform===old.platform&&!accountIsActive(a)))continue;try{const url=accountProfileUrl(old.url,old.platform);if(url&&old.label.trim())links.push({...old,url});}catch{/* Unsafe legacy URLs are retained privately for review, never rendered. */}}
 const unique=new Map<string,LegacySocialLink>();for(const link of links){const key=link.platform+'|'+link.url;if(!unique.has(key))unique.set(key,link);}return [...unique.values()];
}
export function validatePublicAccountRefs(value:unknown,config:Config,retainedIds:string[]=[]):PublicAccountRef[]|undefined{if(value===undefined)return undefined;if(!Array.isArray(value)||value.length>200)throw Error('Choose up to 200 configured accounts.');const accounts=configuredPublicAccounts(config),seen=new Set<string>();return value.map(ref=>{if(!ref||typeof ref.accountId!=='string'||typeof ref.hidden!=='boolean'||(!accounts.some(a=>a.id===ref.accountId)&&!retainedIds.includes(ref.accountId))||seen.has(ref.accountId))throw Error('Choose unique configured Facebook or Instagram accounts.');seen.add(ref.accountId);return {accountId:ref.accountId,hidden:ref.hidden};});}

export type AccountVisibilityCode='visible'|'hidden'|'not_approved'|'missing_url'|'invalid_url'|'inactive'|'duplicate_url'|'legacy_review';
export function publicAccountDiagnostics(home:PublicHomeSettings,config:Config,draftHome?:PublicHomeSettings){
 const {accounts,refs,pending}=publicAccountBindings(home,config),draft=draftHome?publicAccountBindings(draftHome,config):undefined,seen=new Set<string>();
 const firstIds=new Set<string>();for(const ref of refs){const a=accounts.find(a=>a.id===ref.accountId);if(!ref.hidden&&a&&accountIsActive(a)){const url=accountProfileUrl(a.profileUrl,a.platform);if(!seen.has(url)){seen.add(url);firstIds.add(a.id);}}}
 const statuses=accounts.map(a=>{const ref=refs.find(r=>r.accountId===a.id);let code:AccountVisibilityCode='visible',label='Visible on Public Website',detail='Published approval uses the latest account name and profile URL from Configuration.';
 if(!a.profileUrl?.trim()){code='missing_url';label='Profile URL Missing';detail='Add a verified profile URL in Configuration before publishing this account.';}
 else {try{accountProfileUrl(a.profileUrl,a.platform);}catch{code='invalid_url';label='Invalid Profile URL';detail='Correct the HTTPS profile URL and platform domain in Configuration.';}}
 if(code==='visible'&&a.active===false){code='inactive';label='Inactive Account';detail='The configured account is inactive. Its approval is retained, but it is not displayed publicly.';}
 if(code==='visible'&&!ref){if(pending.some(p=>!p.hidden&&p.label===a.name&&p.platform===a.platform)){code='legacy_review';label='Published Legacy Link Needs Review';detail='An existing public link uses this name but a different URL. Confirm its configured replacement below before publishing this account, so the old link is not duplicated.';}else{code='not_approved';label='Not Approved for Public Display';detail='The account is configured and has a valid URL. Click Publish and confirm to make it public.';}}
 if(code==='visible'&&ref?.hidden){code='hidden';label='Hidden by Staff';detail='Click Publish and confirm to restore this account to the public website.';}
 if(code==='visible'&&!firstIds.has(a.id)){code='duplicate_url';label='Duplicate Profile URL';detail='Another approved account already displays this profile URL. Review the configured account identities.';}
 const next=draft?.refs.find(r=>r.accountId===a.id),pendingPublication=!!draft&&(JSON.stringify(ref||null)!==JSON.stringify(next||null)||refs.findIndex(r=>r.accountId===a.id)!==draft.refs.findIndex(r=>r.accountId===a.id));
 return {accountId:a.id,code,label,detail,visible:code==='visible',pendingPublication};
 });
 return {accounts,refs,pending,statuses,totalConfigured:config.accounts.length,publicPlatformAccounts:accounts.length,publicLinks:resolvedPublicSocialLinks(home,config).length};
}
