export type PeriodMode='custom'|'mom'|'qoq'|'yoy';
const iso=(d:Date)=>d.toISOString().slice(0,10),day=86400000;
const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&iso(new Date(s))===s;
const last=(s:string)=>iso(new Date(Date.UTC(Number(s.slice(0,4)),Number(s.slice(5,7)),0)));
function shift(s:string,months:number){const d=new Date(s+'T00:00:00Z'),n=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-months);d.setUTCDate(Math.min(n,new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()));return iso(d);}
export function benchmarkPeriod(start:string,end:string,mode:PeriodMode='custom'){
 if(!['custom','mom','qoq','yoy'].includes(mode))throw Error('Choose a supported comparison mode.');
 if(!valid(start)||!valid(end)||start>end)throw Error('Choose a valid reporting date range.');
 const duration=(Date.parse(end)-Date.parse(start))/day+1,fullMonth=start.endsWith('-01')&&start.slice(0,7)===end.slice(0,7)&&end===last(end),fullQuarter=start.endsWith('-01')&&[1,4,7,10].includes(Number(start.slice(5,7)))&&end===last(shift(start,-2));
 let previousStart:string,previousEnd:string,label:string;
 if(mode==='custom'&&!start.endsWith('-01')){previousStart=iso(new Date(Date.parse(start)-duration*day));previousEnd=iso(new Date(Date.parse(start)-day));label='Previous equal-length period';}
 else if(mode==='custom'&&start.slice(0,7)!==end.slice(0,7)){previousStart=iso(new Date(Date.parse(start)-duration*day));previousEnd=iso(new Date(Date.parse(start)-day));label='Previous equal-length period';}
 else {const months=mode==='qoq'?3:mode==='yoy'?12:1;previousStart=shift(start,months);previousEnd=shift(end,months);if(fullMonth||fullQuarter&&mode==='qoq')previousEnd=last(previousEnd);label=mode==='yoy'?'Year-on-Year':mode==='qoq'?'Quarter-on-Quarter':'Month-on-Month';}
 const previousDuration=(Date.parse(previousEnd)-Date.parse(previousStart))/day+1,calendar=fullMonth||fullQuarter&&mode==='qoq',eligible=previousEnd<start&&(calendar||duration===previousDuration);
 return {start,end,previousStart,previousEnd,label,duration,previousDuration,eligible,calendar,note:calendar?'Full calendar periods; calendar day counts can differ.':duration!==previousDuration?'Comparison withheld: corresponding partial dates produce unequal observation windows, including shorter-month clipping.':'Matching observation windows; accumulated measurement ages can still differ.'};
}
