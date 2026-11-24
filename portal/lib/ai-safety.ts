/** Shared deterministic screening. Passing these checks is not semantic verification. */
export const aiQualityPolicy='community-care-ai-v2';
export const aiPrivacyNotice='AI sends the supplied brief or minimised evidence to Gemini. Remove participant identifiers, private contacts, health/care notes and credentials. Review every draft before use; nothing is published automatically.';
export function privacyIssue(value:unknown):string|null{
 const text=typeof value==='string'?value:JSON.stringify(value);
 if(/\b[STFGM]\d{7}[A-Z]\b/i.test(text))return 'Remove identity numbers before using external AI.';
 if(/(?:api[_ -]?key|password|access[_ -]?token|secret|密码|密钥)\s*[=:：]\s*["']?[^\s,"'}]{6,}|\bAIza[\w-]{25,}|\bre_[\w-]{20,}|\bsk-[\w-]{20,}|\bBearer\s+[\w.-]{16,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(text))return 'Remove credentials before using external AI.';
 if(/(?:participant|beneficiary|patient|resident|senior|client|参与者|受益人|病人|长者).{0,60}(?:\b(?:phone|mobile|email|address|NRIC)\b|诊断|病历|住址|电话)|(?:diagnosis|medical record|care assessment|病历|诊断)\s*[:：]/i.test(text))return 'Remove identifiable participant details and confidential care information before using external AI.';
 if(/\b(?:Mdm|Madam|Mrs|Mr|Ms)\.?\s+[\p{L} ]{2,45}.{0,50}(?:[689]\d{7}|[\w.+-]+@[\w.-]+\.[a-z]{2,})|(?:姓名|患者|长者).{0,60}(?:[689]\d{7}|[\w.+-]+@[\w.-]+\.[a-z]{2,})/iu.test(text))return 'Remove personal names with private contact details before using external AI.';
 return null;
}
export function assertAIPrivacy(value:unknown){const issue=privacyIssue(value);if(issue)throw Error(issue);}
const normal=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const strings=(value:unknown):string=>typeof value==='string'?value:Array.isArray(value)?value.map(strings).join('\n'):value&&typeof value==='object'?Object.values(value).map(strings).join('\n'):'';
export function assertDistinctInsights(items:{finding:string;recommendation:string}[]){
 const findings=new Set<string>(),actions=new Set<string>();
 for(const item of items){const finding=normal(item.finding).replace(/[^\p{L}\p{N}]/gu,''),action=normal(item.recommendation).replace(/[^\p{L}\p{N}]/gu,'');if(findings.has(finding)||actions.has(action))throw Error('Repeated AI findings or actions were withheld.');findings.add(finding);actions.add(action);}
}
export function unsupportedQuantity(text:string){return /\b(?:twice|doubled?|tripled?|half|times (?:higher|lower))\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twenty|hundred|thousand)\s+(?:posts?|accounts?|interactions?|followers?|participants?|percent)\b|[零〇一二两三四五六七八九十百千万]+(?:人|名|位|次|场|倍|百分)/i.test(text);}
export function assertEvidenceAlignment(text:string,source:string){
 for(const platform of ['Facebook','Instagram','Workvivo'])if(new RegExp('\\b'+platform+'\\b.{0,55}\\b(?:recorded|interactions?|engagement|views?|reach|followers?|increased|declined|outperformed|stronger|weaker)\\b','i').test(text)&&!new RegExp('\\b'+platform+'\\b','i').test(source))throw Error('AI platform claim does not match its cited evidence.');
 if(/(?:views?|观看量).{0,25}(?:same as|equivalent to|equals?|等于).{0,25}(?:reach|触及)|(?:reach|触及).{0,25}(?:same as|equivalent to|equals?|等于).{0,25}(?:views?|观看量)/i.test(text))throw Error('AI conflated incompatible measurements.');
 if(/"classification"\s*:\s*"Insufficient Evidence"/.test(source)&&/\b(?:underperform|outperform|below average|high performing|stronger|weaker)\b/i.test(text))throw Error('Insufficient comparable evidence cannot establish a performance classification.');
}
const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
function chineseNumber(text:string){if(/^\d+$/.test(text))return Number(text);const digits:Record<string,number>={零:0,〇:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};if(!/[十百千万]/.test(text))return Number([...text].map(c=>digits[c]).join(''));let value=0,last=0;for(const c of text){if(c in digits)last=digits[c];else{const unit=({十:10,百:100,千:1000,万:10000} as Record<string,number>)[c];value+=(last||1)*unit;last=0;}}return value+last;}
function dates(text:string){
 const result=new Set<string>(),add=(y:string|undefined,m:number,d:number)=>{result.add((y||'--')+'-'+m+'-'+d);if(y)result.add('--'+'-'+m+'-'+d);};
 for(const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g))add(m[1],+m[2],+m[3]);
 for(const m of text.matchAll(/(?:(\d{4})年)?(\d{1,2})月(\d{1,2})[日号]/g))add(m[1],+m[2],+m[3]);
 for(const m of text.matchAll(/([零〇一二三四五六七八九]{4})年([一二两三四五六七八九十]{1,3})月([一二两三四五六七八九十]{1,3})[日号]/g))add(String(chineseNumber(m[1])),chineseNumber(m[2]),chineseNumber(m[3]));
 for(const m of text.matchAll(/\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:,?\s+(\d{4}))?\b/gi))add(m[3],months.findIndex(month=>month.startsWith(m[2].toLowerCase().slice(0,3)))+1,+m[1]);
 for(const m of text.matchAll(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,?\s+(\d{4}))?\b/gi))add(m[3],months.findIndex(month=>month.startsWith(m[1].toLowerCase().slice(0,3)))+1,+m[2]);
 return result;
}
function times(text:string){const result=new Set<string>();for(const m of text.matchAll(/\b(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b/gi)){const h=m[1]?+m[1]%12+(/pm/i.test(m[3])?12:0):+m[4],minute=+(m[2]||m[5]||0);result.add(h+':'+minute);}for(const m of text.matchAll(/(上午|下午|晚上|中午)(\d{1,2})[点时](?:(\d{1,2})分?)?/g))result.add((+m[2]%12+(/下午|晚上|中午/.test(m[1])?12:0))+':'+(+(m[3]||0)));return result;}
/** Conservative source-anchor checks for drafts, not a claim that every sentence is verified. */
export function assertWritingGrounded(output:unknown,input:unknown){
 const source=strings(input),text=strings(output),plain=normal(text),provided=normal(source);
 if(/<\/?[a-z][^>]*>/i.test(text))throw Error('AI returned unsupported markup. The original text is unchanged.');
 const sourceDates=dates(source),sourceTimes=times(source);
 if([...dates(text)].some(d=>!sourceDates.has(d)))throw Error('AI introduced an unsupported date. Review the source details and try again.');
 if([...times(text)].some(t=>!sourceTimes.has(t)))throw Error('AI introduced an unsupported time. Review the source details and try again.');
 const numeric=(s:string)=>(s.replace(/(?:^|\n)\s*\d{1,2}[.)]\s+/g,'').match(/\d+(?:[.,:/-]\d+)*/g)||[]).map(n=>n.replace(/,/g,'')),allowed=new Set(numeric(source));
 for(const date of sourceDates)for(const part of date.split('-').filter(Boolean))allowed.add(String(Number(part)));
 // Canonically equivalent date/time renderings are checked above, not rejected just for reformatting.
 const withoutDates=text.replace(/\b\d{4}-\d{2}-\d{2}\b|\d{1,2}:\d{2}/g,'');
 if(numeric(withoutDates).some(n=>!allowed.has(n)))throw Error('AI introduced an unsupported number. The generated draft was withheld; your source is unchanged.');
 const words:Record<string,number>={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twenty:20,hundred:100,thousand:1000};
 for(const claim of text.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|hundred|thousand)\s+(participants?|attendees?|seniors?|percent)\b/gi))if(!allowed.has(String(words[claim[1].toLowerCase()]))&&!provided.includes(normal(claim[0])))throw Error('AI introduced an unsupported written quantity.');
 const counts=(s:string)=>[...s.matchAll(/\b(\d+)\s+(?:confirmed\s+)?(?:participants?|attendees?|registrations?|seniors?|people)\b|(?:参与人数|出席人数|人数|attendance|registrations|participants)\s*[:：]\s*(\d+)|([零〇一二两三四五六七八九十百千万\d]+)\s*(?:位|名|个)?(?:参与者|出席者|长者|人)/gi)].map(m=>m[1]||m[2]||String(chineseNumber(m[3])));
 const sourceCounts=new Set(counts(source));if(counts(text).some(count=>!sourceCounts.has(count)))throw Error('AI introduced an unsupported participant count.');
 for(const quote of text.matchAll(/[“「‘"]([^”」’"\n]{8,})[”」’"]/g))if(!provided.includes(normal(quote[1])))throw Error('AI introduced an unsupported quotation. Supply approved wording before trying again.');
 const urls=text.match(/https?:\/\/[^\s"<>\\]+/g)||[];if(urls.some(url=>!source.includes(url.replace(/[.,)]$/,''))))throw Error('AI introduced an unsupported link.');
 for(const claim of text.matchAll(/\b(record[- ]breaking|clinically proven|cures? dementia|prevents? dementia|guaranteed (?:success|improvement)|highest ever attendance)\b|治愈痴呆|预防痴呆|保证效果|百分之百成功/gi))if(!provided.includes(normal(claim[0])))throw Error('AI introduced an unsupported achievement or medical claim.');
 for(const place of text.matchAll(/\b[A-Z][\p{L}'-]+(?:\s+[A-Z][\p{L}'-]+){0,5}\s+(?:Hall|Centre|Center|Hospital|Foundation|Society)\b/gu)){const name=place[0].replace(/^(?:(?:Join|Us|At|The|Welcome|To|Visit)\s+)+/,'');if(!provided.includes(normal(name))&&!/Tzu Chi|Community Care/.test(name))throw Error('AI introduced an unsupported organisation or venue.');}
 for(const label of text.matchAll(/(?:^|\n)(?:Organisation|Organization|Programme|Program|Venue|Location|主办单位|项目|地点)\s*[:：]\s*([^\n]+)/gi)){const name=label[1].trim().replace(/[.!。]$/,'');if(!/^\[.*\]$/.test(name)&&!provided.includes(normal(name)))throw Error('AI changed an unsupported organisation, programme or location detail.');}
 if(plain.includes('100% verified')||plain.includes('百分之百准确'))throw Error('AI drafts cannot certify their own accuracy.');
}
