import {assetKey,databaseImageSource} from './content-media';
function publicCandidate(value:string){
 const url=databaseImageSource(value);if(!url)return '';
 let local=url;try{const parsed=new URL(url);if(parsed.pathname==='/api/media')local=parsed.pathname+parsed.search;}catch{/* Relative managed media URL. */}
 return assetKey(local).startsWith('workvivo/')?'':url;
}
/** Only declared sources. Never guess an original URL or strip resizing parameters. */
export function publicImageSources(src:string,originalSrc=''){
 const original=publicCandidate(originalSrc),saved=publicCandidate(src);
 return {primary:original||saved,fallback:original&&saved!==original?saved:'',original,kind:original?'original':'saved'};
}
