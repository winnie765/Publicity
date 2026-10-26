export const datePresets=['This Month','This Year','Custom Range'] as const;
export type DatePreset=typeof datePresets[number];
export function parseFilterDate(input:string):string|null{
 const value=input.trim();if(!value)return '';
 const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value),local=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value),named=/^(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})$/i.exec(value);
 const months:Record<string,number>={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};
 if(!iso&&!local&&!named)return null;
 const [year,month,day]=iso?[Number(iso[1]),Number(iso[2]),Number(iso[3])]:local?[Number(local[3]),Number(local[2]),Number(local[1])]:[Number(named![3]),months[named![2].toLowerCase()]||0,Number(named![1])];
 if(year<1900||year>2100)return null;
 const date=new Date(Date.UTC(year,month-1,day));
 return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day?date.toISOString().slice(0,10):null;
}
export const formatFilterDate=(value:string)=>value?value.slice(8,10)+'/'+value.slice(5,7)+'/'+value.slice(0,4):'';
export function validateFilterDates(start:string,end:string){
 const a=parseFilterDate(start),b=parseFilterDate(end);
 if(a===null)return 'Enter a valid Start Date, such as 01/09/2025, 2025-09-01 or 1 Sep 2025 (1900–2100).';
 if(b===null)return 'Enter a valid End Date, such as 01/09/2025, 2025-09-01 or 1 Sep 2025 (1900–2100).';
 return a&&b&&a>b?'Start Date must be earlier than or the same as End Date.':'';
}
export function presetFilterDates(preset:DatePreset,now=new Date()):[string,string]|null{
 if(preset==='Custom Range')return null;
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=(name:string)=>Number(parts.find(p=>p.type===name)!.value),year=part('year'),month=part('month')-1,day=part('day');
 const end=new Date(Date.UTC(year,month,day)),start=new Date(end);
 if(preset==='This Month')start.setUTCDate(1);
 if(preset==='This Year')start.setUTCMonth(0,1);
 return [start.toISOString().slice(0,10),end.toISOString().slice(0,10)];
}
