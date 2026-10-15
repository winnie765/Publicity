import type {Dataset} from '../app/model';
import {calculateEvidence} from './intelligence/evidence';
import type {EvidencePack,Filters,Scope} from './intelligence/types';
export function advisorEvidence(data:Dataset,value:unknown,now=new Date()):EvidencePack&{advisoryQuestion:string}{
 if(typeof value!=='string'||!value.trim()||value.length>600||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw Error('Ask a question using between one and six hundred characters.');
 const question=value.trim(),q=question.toLowerCase();
 let scope:Scope='insights';
 if(/\baic\b|\bmsf\b|\bncss\b|stakeholder|partner/.test(q))scope='stakeholders';
 else if(data.config.brands.filter(b=>q.includes(b.toLowerCase())).length>1||/brand|centre|compare/.test(q))scope='brands';
 else if(/follower|audience growth/.test(q))scope='followers';
 else if(/workvivo|internal/.test(q))scope='workvivo';
 else if(/top hit/.test(q))scope='top-hits';
 else if(/perform|format|resonat|content works/.test(q))scope='content';
 const filters:Filters={};
 const facebook=/facebook/.test(q),instagram=/instagram/.test(q);if(facebook!==instagram&&scope!=='workvivo')filters.platform=facebook?'Facebook':'Instagram';
 const mentioned=data.config.brands.filter(b=>{const index=q.indexOf(b.toLowerCase());return index>=0&&!/[a-z0-9]/i.test(q[index-1]||'')&&!/[a-z0-9]/i.test(q[index+b.length]||'');});if(mentioned.length===1)filters.brand=mentioned[0];
 const local=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),part=(key:string)=>Number(local.find(p=>p.type===key)!.value),year=part('year'),month=part('month')-1,iso=(y:number,m:number,d:number)=>new Date(Date.UTC(y,m,d)).toISOString().slice(0,10);
 if(/last quarter|previous quarter/.test(q)){const start=Math.floor(month/3)*3-3;filters.start=iso(year,start,1);filters.end=iso(year,start+3,0);}
 else if(/this quarter|current quarter/.test(q)){filters.start=iso(year,Math.floor(month/3)*3,1);filters.end=iso(year,month,part('day'));}
 else if(/last month|previous month/.test(q)){filters.start=iso(year,month-1,1);filters.end=iso(year,month,0);}
 else if(/this month|current month|month's/.test(q)){filters.start=iso(year,month,1);filters.end=iso(year,month,part('day'));}
 const pack=calculateEvidence(data,scope,filters);
 // Focus existing calculated facts; no new measurements or AI calculations.
 const namedStakeholder=['AIC','MSF','NCSS'].find(name=>new RegExp('\\b'+name+'\\b','i').test(question));
 const facts=namedStakeholder&&scope==='stakeholders'?[...pack.facts.filter(f=>f.label.startsWith('Stakeholder:')&&f.label.toUpperCase().includes(namedStakeholder)),...pack.facts.filter(f=>!f.label.startsWith('Stakeholder:')||!f.label.toUpperCase().includes(namedStakeholder))]:pack.facts;
 return {...pack,facts,advisoryQuestion:question};
}
