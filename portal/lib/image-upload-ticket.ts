import {workspacePassword} from './workspace-env';
export type ImageUploadTicket={key:string;name:string;size:number;mimeType:string;folder:string;expiresAt:number};
const encoder=new TextEncoder(),hex=(buffer:ArrayBuffer)=>Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,'0')).join('');
async function signingKey(){const password=workspacePassword();if(password.length<8)throw Error('Sign in to the workspace before uploading.');return crypto.subtle.importKey('raw',encoder.encode('media-upload-v1:'+password),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function createImageUploadTicket(value:ImageUploadTicket){const payload=Buffer.from(JSON.stringify(value)).toString('base64url');return payload+'.'+hex(await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(payload)));}
export async function readImageUploadTicket(ticket:unknown):Promise<ImageUploadTicket>{
 if(typeof ticket!=='string'||ticket.length>5000)throw Error('The upload confirmation is invalid. Select the image again.');const [payload,signature,...extra]=ticket.split('.');if(extra.length||!payload||!/^[a-f0-9]{64}$/.test(signature||''))throw Error('The upload confirmation is invalid. Select the image again.');
 if(!await crypto.subtle.verify('HMAC',await signingKey(),Uint8Array.from(signature.match(/../g)!,part=>parseInt(part,16)),encoder.encode(payload)))throw Error('The upload confirmation is invalid. Select the image again.');
 let value:ImageUploadTicket;try{value=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));}catch{throw Error('The upload confirmation is invalid. Select the image again.');}if(!Number.isFinite(value.expiresAt)||value.expiresAt<Date.now())throw Error('The upload link has expired. Select the image again.');return value;
}
