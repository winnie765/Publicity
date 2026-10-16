import {assetKey,mediaFolders} from './content-media';
import type {Storage} from './storage-contract';
export const maxVideoBytes=25*1024*1024;
export function videoFormat(bytes:Uint8Array,name:string){
 const ext=name.toLowerCase().split('.').at(-1),ascii=(a:number,b:number)=>String.fromCharCode(...bytes.slice(a,b));
 if(bytes.length<16)throw Error('Choose a valid MP4, MOV or WEBM video.');
 if(ext==='webm'&&bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163&&ascii(4,Math.min(bytes.length,4096)).includes('webm'))return {extension:'webm',type:'video/webm'};
 if((ext==='mp4'||ext==='mov')&&ascii(4,8)==='ftyp'){
  const brands=ascii(8,Math.min(bytes.length,64));if(/avif|avis|heic|heix|hevc|hevx|mif1|msf1/.test(brands))throw Error('This file is an image container, not a supported video.');
  if(ext==='mov'&&brands.includes('qt  '))return {extension:'mov',type:'video/quicktime'};
  if(ext==='mp4'&&/isom|iso[2-9]|mp4[12]|avc1|M4V |dash/.test(brands))return {extension:'mp4',type:'video/mp4'};
 }
 throw Error('The file contents do not match a supported MP4, MOV or WEBM container.');
}
export async function storeVideo(store:Storage,bucket:{put:(key:string,bytes:Uint8Array,type:string)=>Promise<void>;delete:(key:string)=>Promise<void>},file:File,folder:string){
 if(!mediaFolders.includes(folder as any)||!['facebook','instagram','workvivo','stories','community-highlights'].includes(folder))throw Error('Choose a supported post or story video folder.');
 if(!/\.(mp4|mov|webm)$/i.test(file.name)||file.size<=0||file.size>maxVideoBytes)throw Error('Choose MP4, MOV or WEBM video no larger than 25 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),format=videoFormat(bytes,file.name);if(file.type&&file.type!==format.type&&file.type!=='application/octet-stream')throw Error('The video contents do not match its file type.');
 const id=crypto.randomUUID(),key=folder+'/'+id+'.'+format.extension,url='/api/media?key='+encodeURIComponent(key),now=new Date().toISOString();await bucket.put(key,bytes,format.type);try{await store.apply([{type:'upsert',record:{id:'media-'+id,kind:'media_asset',payload:{id:'media-'+id,key,url,mimeType:format.type,size:file.size,createdAt:now,name:file.name.slice(0,200),folder},updatedAt:now}}]);}catch(e){await bucket.delete(key);throw e;}return {url,key,size:file.size};
}
export function videoUrl(value:unknown){return typeof value==='string'&&/\.(mp4|mov|webm)$/.test(assetKey(value))?value:'';}
export function byteRange(header:string,size:number){const match=/^bytes=(\d*)-(\d*)$/.exec(header);if(!match||(!match[1]&&!match[2]))return null;const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2])),end=match[1]?(match[2]?Math.min(size-1,Number(match[2])):size-1):size-1;if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return null;return {offset:start,length:end-start+1,end};}
