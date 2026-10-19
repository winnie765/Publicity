export type PostSourceLink={original_post_url?:string;url?:string};
export function postUrlValue(post:PostSourceLink):string{return typeof post.original_post_url==='string'?post.original_post_url:typeof post.url==='string'?post.url:'';}
export function safeOriginalPostUrl(value:unknown):string{
 if(typeof value!=='string'||value.length>2000)return '';
 const text=value.trim();if(!/^https?:\/\//i.test(text))return '';
 try{const url=new URL(text);return ['http:','https:'].includes(url.protocol)&&!!url.hostname&&!url.username&&!url.password?url.href:'';}catch{return '';}
}
export function originalPostUrl(post:PostSourceLink):string{return safeOriginalPostUrl(postUrlValue(post));}
export function validateOriginalPostUrl(value:unknown){if(value===undefined||value==='')return;if(typeof value!=='string'||!safeOriginalPostUrl(value))throw Error('Original Post URL must be a valid HTTP or HTTPS link, up to 2000 characters, without embedded credentials.');}
