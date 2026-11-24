/** Source fields are anchors, never a licence to infer missing operational details. */
export const studioFactsPolicy='studio-facts-v1';
const fold=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[\s，。,.！!：:]+/g,' ').trim();
export function programmeFacts(brief:string){
 const fields:Record<string,string>={};
 for(const line of brief.split(/\r?\n/)){
  const match=line.match(/^\s*([^:：]{1,50})[:：]\s*(.+)$/);
  if(match&&!/^(?:not provided|unknown|unconfirmed|待确认|未提供|不详)\.?$/i.test(match[2].trim()))fields[fold(match[1])]=match[2].trim();
 }
 return fields;
}
/** Conservative bilingual claim screening. This does not certify unrestricted prose. */
export function assertProgrammeClaims(output:{title:string;draft:string},brief:string){
 const fields=programmeFacts(brief),text=output.title+'\n'+output.draft;
 const known=Object.values(fields).join('\n');
 const source=fold(brief.replace(/^.*[:：]\s*(?:not provided|unknown|unconfirmed|未提供|待确认|不详).*$/gim,''));
 const groups=[
  /\b(?:free (?:entry|admission|of charge)|admission is free|no (?:entry|admission) fee|complimentary admission)\b|免费(?:入场|参加|参与)?|免(?:费|收)入场费/gi,
  /\b(?:(?:no|without) (?:prior )?registration(?: (?:is )?(?:required|needed))?|registration (?:is )?(?:not required|optional)|walk[ -]?ins? (?:are )?(?:welcome|accepted|allowed))\b|无[需须](?:提前)?(?:报名|注册)|不(?:必|用|需)(?:报名|注册)|欢迎(?:现场|直接)(?:参加|报名)|随到随参加/gi,
 ];
 for(const pattern of groups)for(const claim of text.matchAll(pattern)){
  if(!source.includes(fold(claim[0])))throw Error('AI introduced an unconfirmed admission or registration condition. Supply approved wording in the brief.');
 }
 for(const sentence of text.split(/\n|(?<=[.!?。！？])\s*/)){
  if(/\b(?:cures?|prevents?|treats?)\s+(?:dementia|diabetes|depression|disease)|\b(?:improved|reduced|increased)\s+(?:participants?'?\s+)?(?:memory|blood pressure|mobility|attendance)|(?:治疗|治愈|预防)(?:失智|痴呆|疾病|糖尿病)|(?:改善|提升)(?:记忆力|认知能力)|(?:participant|senior|attendee)\s+(?:said|reported|shared)|(?:参与者|参加者|长者)(?:表示|说|分享)/i.test(sentence)&&!source.includes(fold(sentence)))throw Error('AI introduced an unsupported outcome, medical benefit or testimonial.');
 }
 // Compare complete operational statements, not just the presence of a topic word.
 const operational=/(?:\b(?:admission|entry fee|registration|register by|walk[ -]?ins?|deadline|tickets? cost)\b|(?:费用|收费|报名|注册|截止|入场费))/i;
 for(const sentence of text.split(/\n|(?<=[.!?。！？])\s*/)){
  if(!operational.test(sentence)||/\[[^\]]+\]/.test(sentence)||/not (?:provided|confirmed)|未提供|待确认/.test(sentence))continue;
  const value=sentence.trim().replace(/^(?:Admission fee|Registration requirements|费用|报名要求)\s*[:：]\s*/i,'');
  if(!source.includes(fold(value))&&!fold(known).includes(fold(value)))throw Error('AI introduced an unsupported fee, registration rule or deadline. Use confirmed source wording.');
 }
 const venues=Object.entries(fields).filter(([key])=>/^(venue|location|地点|地點|场地|場地)$/.test(key)).map(([,v])=>v);
 // Never infer a translated proper name. Check labelled and narrative venue mentions.
 for(const match of text.matchAll(/(?:地点|地點|场地|場地|举办地点|舉辦地點)\s*[:：]\s*([^\n。！!]+)|(?:在|于|於)([^\n，。]{1,35}?(?:礼堂|禮堂|大厅|大廳|会堂|會堂|中心|活动室|活動室|公园|公園))(?:举行|舉行|举办|舉辦|参加|參加)?/g)){
  const name=(match[1]||match[2]).trim();
  if(!/^\[.*\]$/.test(name)&&!venues.some(v=>fold(v)===fold(name))&&!source.includes(fold(name)))throw Error('AI introduced an unverified Chinese venue. Keep the supplied venue name unchanged.');
 }
}
