import type {Config} from '../app/model';
import type {PublicHomeSettings} from './public-site-config';
import {withMasterRegistry} from './master-relationships';
import {publicAccountBindings,type LegacySocialLink} from './public-account-links';
export type SocialDisplayLayout='platform'|'brand'|'custom';
export const socialLayoutLabels={platform:'Group by Platform',brand:'Group by Brand',custom:'Custom Arrangement'};
export function validateSocialDisplayLayout(value:unknown):SocialDisplayLayout{if(value===undefined)return 'platform';if(value!=='platform'&&value!=='brand'&&value!=='custom')throw Error('Choose Group by Platform, Group by Brand or Custom Arrangement.');return value;}
export function configuredSocialBrands(config:Config){const c=withMasterRegistry(config);return c.masterRegistry!.brands.filter(b=>c.accounts.some(a=>a.brand===b.name&&['Facebook','Instagram'].includes(a.platform)));}
export function validateSocialBrandOrder(value:unknown,config:Config,retained:string[]=[]):string[]{if(value===undefined)return [];const ids=withMasterRegistry(config).masterRegistry!.brands.map(b=>b.id);if(!Array.isArray(value)||value.length>200||value.some(id=>typeof id!=='string'||!ids.includes(id)&&!retained.includes(id))||new Set(value).size!==value.length)throw Error('Choose a unique order of configured brands.');return [...value];}
export function socialPublicBrandOrder(home:PublicHomeSettings,config:Config){const brands=configuredSocialBrands(config);return [...(home.socialBrandOrder||[]).flatMap(id=>brands.find(b=>b.id===id)?.name||[]),...brands.filter(b=>!home.socialBrandOrder?.includes(b.id)).map(b=>b.name)];}
export function socialDisplayGroups(accounts:LegacySocialLink[],layout:SocialDisplayLayout,brandOrder:string[]=[]){
 if(layout==='custom')return [{key:'custom',title:'',accounts}].filter(g=>g.accounts.length);
 if(layout==='platform')return ['Facebook','Instagram'].map(platform=>({key:platform,title:platform,accounts:accounts.filter(a=>a.platform===platform)})).filter(g=>g.accounts.length);
 const names=[...new Set([...brandOrder,...accounts.flatMap(a=>a.brand?[a.brand]:[])])],groups=names.map(name=>({key:'brand-'+name,title:name,accounts:accounts.filter(a=>a.brand===name)})).filter(g=>g.accounts.length);
 const other=accounts.filter(a=>!a.brand);if(other.length)groups.push({key:'other',title:'Other Accounts',accounts:other});return groups;
}
export function socialArrangement(home:PublicHomeSettings,config:Config,recommendNew=true){const b=publicAccountBindings(home,config),fresh=home.socialAccountRefs===undefined&&!b.refs.length&&!b.pending.length;return {socialLayout:home.socialLayout??(fresh&&recommendNew?'brand':'platform') as SocialDisplayLayout,socialBrandOrder:[...(home.socialBrandOrder||[]),...configuredSocialBrands(config).filter(a=>!home.socialBrandOrder?.includes(a.id)).map(a=>a.id)],socialAccountRefs:[...b.refs,...b.accounts.filter(a=>!b.refs.some(r=>r.accountId===a.id)).map(a=>({accountId:a.id,hidden:true}))]};}
export function moveSocialItem<T>(items:T[],from:number,to:number):T[]{if(from<0||to<0||from>=items.length||to>=items.length||from===to)return items;const result=[...items],item=result.splice(from,1)[0];result.splice(to,0,item);return result;}
