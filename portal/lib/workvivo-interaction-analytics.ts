import type {Dataset} from '../app/model';
import {workvivoPosts} from './workvivo-posts';
import type {WorkvivoInteraction} from './workvivo-interaction-types';
export function workvivoInteractionRows(data:Dataset):WorkvivoInteraction[]{
 const native=new Set(data.posts.filter(post=>post.platform==='Workvivo').map(post=>post.id));
 return [...(data.workvivoInteractions||[]),...data.interactions.filter(row=>native.has(row.postId)).map(row=>({id:row.id,postId:row.postId,stakeholder_id:row.stakeholder_id,stakeholder:row.stakeholder,interactionType:row.type,date:row.date,notes:'',count:row.count,legacy:true}))];
}
export function workvivoInteractionSummary(data:Dataset,start?:string,end?:string){
 const posts=workvivoPosts(data.posts.filter(post=>post.status!=='draft')),byId=new Map(posts.map(post=>[post.id,post]));
 const rows=workvivoInteractionRows(data).filter(row=>byId.has(row.postId)&&(!start||row.date>=start)&&(!end||row.date<=end));
 const rank=(key:(row:WorkvivoInteraction)=>string)=>{const groups=new Map<string,{name:string;interactions:number;posts:Set<string>}>();for(const row of rows){const value=key(row),name=!value||value==='Unclassified'?'Not specified':value,group=groups.get(name)||{name,interactions:0,posts:new Set<string>()};group.interactions+=row.count;group.posts.add(row.postId);groups.set(name,group);}return [...groups.values()].map(group=>({name:group.name,interactions:group.interactions,posts:group.posts.size})).sort((a,b)=>b.interactions-a.interactions||a.name.localeCompare(b.name));};
 const stakeholders=rank(row=>row.stakeholder),themes=rank(row=>byId.get(row.postId)!.topic),types=rank(row=>row.interactionType),months=rank(row=>row.date.slice(0,7)).sort((a,b)=>a.name.localeCompare(b.name)).map(row=>({month:row.name,interactions:row.interactions}));
 const partnerIds=new Set(data.config.stakeholders.filter(row=>['Partners','Social Sector'].includes(row.sector)).map(row=>row.name));
 return {interactions:rows.reduce((sum,row)=>sum+row.count,0),posts:new Set(rows.map(row=>row.postId)).size,stakeholders,themes,types,partners:stakeholders.filter(row=>partnerIds.has(row.name)),months,scope:'Verified Workvivo interaction logs, selected by interaction date. Counts represent logged actions, not unique people or audience engagement. Missing logs do not prove absence of stakeholder interest.'};
}
export type WorkvivoInteractionSummary=ReturnType<typeof workvivoInteractionSummary>;

