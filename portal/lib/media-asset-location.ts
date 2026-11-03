import {assetKey,safeContentImage} from './content-media';
/** Uploaded objects are identified by their storage key, never by their original file name. */
export function mediaAssetLocation(payload:{key?:unknown;url?:unknown;file_url?:unknown;thumbnailUrl?:unknown;thumbnail_url?:unknown}){
 const storedUrl=typeof payload.url==='string'?payload.url:typeof payload.file_url==='string'?payload.file_url:'';
 const candidate=typeof payload.key==='string'?payload.key:'';
 const key=assetKey('/api/media?key='+encodeURIComponent(candidate))||assetKey(storedUrl);
 const url=key?'/api/media?key='+encodeURIComponent(key):safeContentImage(storedUrl);
 const thumbnailUrl=typeof payload.thumbnailUrl==='string'?payload.thumbnailUrl:typeof payload.thumbnail_url==='string'?payload.thumbnail_url:'';
 return {key:key||candidate,url,storedUrl,thumbnailUrl:safeContentImage(thumbnailUrl),renderedUrl:url};
}
