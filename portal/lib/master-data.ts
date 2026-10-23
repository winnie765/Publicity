import type {Config} from '../app/model';
import {normalizeLocation} from './post-locations';

export const cleanMasterName=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ');
export function masterKey(value:string){return cleanMasterName(value).toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[\u2010-\u2015_\u00b7-]/g,' ').replace(/\s*([+&])\s*/g,' $1 ').replace(/\s+/g,' ').trim();}
export function matchMasterName(names:string[],value:string){const key=masterKey(value);return names.find(name=>masterKey(name)===key);}

/** First configured spelling and metadata win. Applies to future named lists too. */
export function normalizeMasterConfig(config:Config):Config{
  const result=structuredClone(config) as Config&Record<string,any>;
  for(const [module,entries] of Object.entries(result)){
    if(!Array.isArray(entries))continue;
    const seen=new Set<string>();
    result[module]=entries.flatMap((entry:any)=>{
      const raw=typeof entry==='string'?entry:entry?.name;
      if(typeof raw!=='string')return [entry];
      const name=module==='locations'?normalizeLocation(raw):cleanMasterName(raw),key=masterKey(name);
      if(!name||seen.has(key))return [];seen.add(key);
      return [typeof entry==='string'?name:{...entry,name}];
    });
  }
  for(const account of [...result.accounts,...(result.followerAccounts||[])]){
    if(account.brand)account.brand=matchMasterName(result.brands,account.brand)||cleanMasterName(account.brand);
    account.platform=matchMasterName(['Facebook','Instagram','Workvivo'],account.platform)||account.platform;
  }
  return result;
}

/** Resolve references, without adding master entries or changing performance values. */
export function resolveMasterReferences(record:Record<string,any>,kind:string,config:Config){
  for(const [field,module] of [['brand','brands'],['accountBrand','brands'],['location','locations'],['topic','topics']] as const){
    if(typeof record[field]!=='string')continue;
    const value=field==='location'?normalizeLocation(record[field]):cleanMasterName(record[field]);
    record[field]=matchMasterName(config[module],value)||value;
  }
  if(typeof record.platform==='string')record.platform=matchMasterName(['Facebook','Instagram','Workvivo'],record.platform)||cleanMasterName(record.platform);
  if(typeof record.account==='string'){
    const accounts=kind==='followers'?[...(config.followerAccounts||[]),...config.accounts]:config.accounts;
    record.account=matchMasterName(accounts.map(a=>a.name),record.account)||cleanMasterName(record.account);
  }
  if(kind==='posts'&&typeof record.type==='string'){
    record.type=matchMasterName(config.types,record.type)||cleanMasterName(record.type);
    if(record.content_type)record.content_type=record.type;
  }
  if(kind==='interactions'&&typeof record.stakeholder==='string'){
    const name=matchMasterName(config.stakeholders.map(s=>s.name),record.stakeholder);
    record.stakeholder=name||cleanMasterName(record.stakeholder);
    if(name)record.sector=config.stakeholders.find(s=>s.name===name)!.sector;
  }
  return record;
}
