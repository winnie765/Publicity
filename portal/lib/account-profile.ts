export type AccountProfile={name:string;platform:string;brand?:string;profileUrl?:string;active?:boolean};
/** Public profile links only; never platform post IDs or account identifiers. */
export function accountProfileUrl(value:unknown,platform:string):string{
 if(value===undefined||value==='')return '';
 if(typeof value!=='string'||value.length>2000)throw Error('Enter a Social Media Profile URL up to 2000 characters.');
 const text=value.trim();if(!text)return '';
 let url:URL;try{url=new URL(text);}catch{throw Error('Enter a complete HTTPS Social Media Profile URL.');}
 const host=url.hostname.toLowerCase();
 const allowed=platform==='Facebook'?(host==='facebook.com'||['www.facebook.com','m.facebook.com','mbasic.facebook.com'].includes(host)):platform==='Instagram'?(host==='instagram.com'||host==='www.instagram.com'):platform==='Workvivo'?/^[a-z0-9-]+\.workvivo\.com$/.test(host):false;
 if(url.protocol!=='https:'||url.username||url.password||url.port||!allowed)throw Error('Use an HTTPS '+platform+' profile URL on its official domain'+(platform==='Workvivo'?' (your organisation.workvivo.com address)':'')+'.');
 if(/(?:^|\/)(?:l\.php|login|login\.php|dialog|oauth|accounts|redirect|sharer(?:\.php)?)(?:\/|$)/i.test(url.pathname)||[...url.searchParams.keys()].some(k=>/^(?:url|u|redirect.*|next|access_token|token|password|code|session.*)$/i.test(k)))throw Error('Use a direct public profile link, without redirects, sign-in links or credentials.');
 return url.href;
}
export function accountIsActive(account:AccountProfile){try{return account.active!==false&&!!accountProfileUrl(account.profileUrl,account.platform);}catch{return false;}}
export function selectableAccounts<T extends AccountProfile>(accounts:T[],platform:string,current=''){return accounts.filter(a=>a.platform===platform&&(accountIsActive(a)||a.name===current));}
