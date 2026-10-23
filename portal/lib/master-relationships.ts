import type {Config} from '../app/model';
import type {Storage,StoredRecord,Change} from './storage-contract';
import {masterKey,cleanMasterName} from './master-data';

export const masterModules=['brands','locations','types','topics','accounts','stakeholders'] as const;
export type MasterModule=typeof masterModules[number];
export type MasterEntry={id:string;name:string;aliases:string[]};
export type MasterRegistry=Record<MasterModule,MasterEntry[]>;
export type MasterRename={module:MasterModule;from:string;to:string};
export type MasterReferences={brand_id?:string;account_brand_id?:string;location_id?:string;content_type_id?:string;content_category_id?:string;account_id?:string;stakeholder_id?:string};
const fields={brand:['brands','brand_id'],accountBrand:['brands','account_brand_id'],location:['locations','location_id'],type:['types','content_type_id'],content_type:['types','content_type_id'],format:['types','content_type_id'],topic:['topics','content_category_id'],account:['accounts','account_id'],stakeholder:['stakeholders','stakeholder_id']} as const;
const identity=(module:string,name:string)=>'master-'+module+'-'+encodeURIComponent(masterKey(name));
export function masterRegistry(config:Config):MasterRegistry{
  const prior=config.masterRegistry;
  return Object.fromEntries(masterModules.map(module=>{
    const entries=[...((config as any)[module]||[]),...(module==='accounts'?config.followerAccounts||[]:[])];
    const result:MasterEntry[]=[];
    for(const value of entries){const name=typeof value==='string'?value:value.name;if(typeof name!=='string'||!name.trim())continue;
      const existing=prior?.[module]?.find(entry=>masterKey(entry.name)===masterKey(name)||entry.aliases.some(alias=>masterKey(alias)===masterKey(name)));
      const entry=existing?{...existing,aliases:[...existing.aliases]}:{id:identity(module,name),name:cleanMasterName(name),aliases:[]};
      if(!result.some(value=>value.id===entry.id))result.push(entry);
    }
    return [module,result];
  })) as MasterRegistry;
}
export function withMasterRegistry(config:Config):Config{return {...config,masterRegistry:masterRegistry(config)};}
export function renameMasterEntry(config:Config,rename:MasterRename){
  if(!masterModules.includes(rename.module)||typeof rename.from!=='string'||typeof rename.to!=='string')throw Error('Choose a valid configuration entry.');
  const entries=config.masterRegistry?.[rename.module];
  const entry=entries?.find(value=>value.name===rename.from);
  if(!entry)throw Error('Configuration changed. Reload before renaming this entry.');
  if(entries!.some(value=>value.id!==entry.id&&[value.name,...value.aliases].some(name=>masterKey(name)===masterKey(rename.to))))throw Error('This name belongs to another configuration entry.');
  if(entry.name!==rename.to&&!entry.aliases.includes(entry.name))entry.aliases.push(entry.name);
  entry.name=rename.to;
}

/** IDs are authoritative on reads; a deliberately changed form selection wins on writes. */
export function masterPayload(value:any,registry:MasterRegistry,writing=false,report=false):any{
  if(Array.isArray(value))return value.map(item=>masterPayload(item,registry,writing,report));
  if(!value||typeof value!=='object')return value;
  const result:any=Object.fromEntries(Object.entries(value).map(([key,item])=>[key,masterPayload(item,registry,writing,report)]));
  for(const [field,[module,idField]] of Object.entries(fields)){
    if(!Object.hasOwn(value,field))continue;
    if(field==='type'&&!value.content_type_id&&!registry.types.some(entry=>[entry.name,...entry.aliases].some(name=>typeof value.type==='string'&&masterKey(name)===masterKey(value.type))))continue;
    const text=typeof value[field]==='string'?value[field]:undefined;
    const byId=registry[module].find(entry=>entry.id===value[idField]);
    const byName=text?registry[module].find(entry=>[entry.name,...entry.aliases].some(name=>masterKey(name)===masterKey(text))):undefined;
    const selected=writing&&text!==undefined?(byName||undefined):(byId||byName);
    if(selected){result[idField]=selected.id;if(text!==undefined)result[field]=selected.name;}
    else if(writing&&text!==undefined)delete result[idField];
  }
  if(!writing)for(const field of ['brand','location','type','account','stakeholder'] as const){
    const [module,idField]=fields[field];
    if(Object.hasOwn(value,field)||!value[idField])continue;
    const entry=registry[module].find(entry=>entry.id===value[idField]);
    if(entry)result[field]=entry.name;
  }
  // Brand card display names are master labels; editorial subtitles remain unchanged.
  if(result.brand_id&&typeof result.displayName==='string'){
    const entry=registry.brands.find(entry=>entry.id===result.brand_id);
    if(entry&&entry.aliases.includes(result.displayName))result.displayName=entry.name;
  }
  if(report)for(const [key,item] of Object.entries(result))if(typeof item==='string'&&!/(?:id|url|link|image|html)$/i.test(key)){
    let text=item;
    for(const entries of Object.values(registry))for(const entry of entries)for(const alias of entry.aliases){if(alias===entry.name)continue;const escaped=alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');text=text.replace(new RegExp('(?<![\\p{L}\\p{N}])'+escaped+'(?![\\p{L}\\p{N}])','gu'),()=>entry.name);}
    result[key]=text;
  }
  return result;
}
export function masterRows(rows:StoredRecord[]){
  const stored=rows.find(row=>row.kind==='config'&&row.id==='configuration');if(!stored)return rows;
  const config=withMasterRegistry(stored.payload);
  return rows.map(row=>row===stored?{...row,payload:config}:{...row,payload:masterPayload(row.payload,config.masterRegistry!,false,row.kind==='generated_report')});
}

/** All readers (CMS, reports, analytics, recovery) resolve through the same registry. */
export function masterStorage(base:Storage):Storage{return {...base,
  readRecords:async()=>masterRows(await base.readRecords()),
  async apply(changes){
    if(!changes.some(change=>change.type==='upsert'||change.type==='insert'))return base.apply(changes);
    const rows=await base.readRecords(),saved=rows.find(row=>row.id==='configuration'&&row.kind==='config');
    const update=changes.find(change=>change.type==='upsert'&&change.record.id==='configuration');
    const config=update?.type==='upsert'?withMasterRegistry(update.record.payload):saved?withMasterRegistry(saved.payload):undefined;
    if(!config)return base.apply(changes);
    const mapped:Change[]=changes.map(change=>change.type==='upsert'||change.type==='insert'?{...change,record:{...change.record,payload:change.record.kind==='config'?config:masterPayload(change.record.payload,config.masterRegistry!,true)}}:change);
    if(!update&&JSON.stringify(saved?.payload.masterRegistry)!==JSON.stringify(config.masterRegistry))mapped.unshift({type:'upsert',record:{id:'configuration',kind:'config',payload:config,updatedAt:new Date().toISOString()}});
    return base.apply(mapped);
  }
};}
