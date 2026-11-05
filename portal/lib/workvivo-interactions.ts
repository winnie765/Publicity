import {hasWorkvivo,workvivoInteractionTypes,type WorkvivoInteraction} from './workvivo-interaction-types';
import {workvivoInteractionRows} from './workvivo-interaction-analytics';
import type {Config,Dataset,Post} from '../app/model';
import type {Storage,StoredRecord} from './storage-contract';
import {masterPayload,masterRows,withMasterRegistry} from './master-relationships';
import {defaultConfig} from '../app/model';

async function context(store:Storage,postId:string){
 if(typeof postId!=='string'||!postId||postId.length>100)throw Error('Choose an existing Workvivo post.');
 const [rows,postRows]=await Promise.all([store.readRecords(['config','workvivo_interaction','interactions']),store.readRecord?store.readRecord(postId).then(row=>row?[row]:[]):store.readRecords(['posts']).then(rows=>rows.filter(row=>row.id===postId))]);
 const all=masterRows([...rows,...postRows]),post=all.find(row=>row.kind==='posts'&&row.id===postId)?.payload as Post|undefined;
 if(!post||!hasWorkvivo(post))throw Error('Interactions can only be added to Workvivo posts or Workvivo-associated content.');
 const config=withMasterRegistry(structuredClone(all.find(row=>row.kind==='config')?.payload||defaultConfig)) as Config;
 return {rows:all,post,config};
}
export async function getWorkvivoInteractions(store:Storage,postId:string){
 const {rows,post,config}=await context(store,postId);
 const data:Dataset={posts:[post],followers:[],interactions:rows.filter(row=>row.kind==='interactions').map(row=>row.payload),workvivoInteractions:rows.filter(row=>row.kind==='workvivo_interaction').map(row=>row.payload),config};
 const options=config.stakeholders.filter(row=>row.active!==false).map(row=>({name:row.name,id:config.masterRegistry!.stakeholders.find(entry=>entry.name===row.name)!.id}));
 return {interactions:workvivoInteractionRows(data).filter(row=>row.postId===postId).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id)),stakeholders:options};
}
export async function saveWorkvivoInteraction(store:Storage,input:any){
 const {config,rows,post}=await context(store,input?.postId);
 if(typeof input.id!=='string'||!input.id||input.id.length>100)throw Error('Choose a valid interaction ID.');
 const existing=rows.find(row=>row.id===input.id);if(existing){if(existing.kind==='workvivo_interaction'&&existing.payload.postId===post.id)return getWorkvivoInteractions(store,post.id);throw Error('This record ID is already in use.');}
 const entry=config.masterRegistry!.stakeholders.find(entry=>entry.id===input.stakeholder_id);
 if(input.stakeholder_id&&!entry)throw Error('Choose a configured stakeholder.');
 const configured=config.stakeholders.find(row=>row.name===entry?.name);
 if(!configured||configured.active===false)throw Error('Choose an active stakeholder from Configuration.');
 if(!(workvivoInteractionTypes as readonly string[]).includes(input.interactionType))throw Error('Choose a supported interaction type.');
 if(typeof input.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!Number.isFinite(Date.parse(input.date))||new Date(input.date).toISOString().slice(0,10)!==input.date)throw Error('Choose a valid interaction date.');
 if(input.notes!==undefined&&(typeof input.notes!=='string'||input.notes.length>5000))throw Error('Interaction notes must be text up to 5,000 characters.');
 const registry=withMasterRegistry(config),now=new Date().toISOString(),record:WorkvivoInteraction={id:input.id,postId:post.id,stakeholder:configured.name,stakeholder_id:entry!.id,interactionType:input.interactionType,date:input.date,notes:input.notes||'',count:1};
 const payload=masterPayload(record,registry.masterRegistry!,true);delete payload.stakeholder;
 const saved:StoredRecord={id:record.id,kind:'workvivo_interaction',payload,updatedAt:now};
 await store.apply([{type:'insert',record:saved},{type:'audit',entry:{id:crypto.randomUUID(),actor:'Workspace staff',action:'Record Workvivo post interaction',record_id:record.id,date:now}}]);
 return getWorkvivoInteractions(store,post.id);
}
