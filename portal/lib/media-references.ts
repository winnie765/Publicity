import type {StoredRecord} from './storage-contract';
import {assetKey} from './content-media';
export const mediaReferenceKinds=['posts','public_home','public_content','programme_profile','public_partner','public_event','content_plan','generated_report','public_social_account'] as const;
export type MediaReference={contentType:string;recordId:string;title:string;fields:string[]};
export type MediaTarget={key:string;id?:string;url?:string;name?:string};
const keyFromUrl=(value:string)=>{const direct=assetKey(value);if(direct)return direct;try{const url=new URL(value,'https://workspace.invalid');if(url.pathname==='/api/media')return assetKey('/api/media?key='+encodeURIComponent(url.searchParams.get('key')||''));const match=/\/storage\/v1\/object\/(?:public|authenticated|sign)\/[^/]+\/(.+)$/.exec(url.pathname);return match?assetKey('/api/media?key='+encodeURIComponent(decodeURIComponent(match[1]))):''}catch{return ''}};
/** Only actual media fields in active content are dependencies. Recovery copies, drafts,
 * audit entries, caches, metadata and old source snapshots are deliberately excluded. */
export function mediaReferences(rows:StoredRecord[],target:MediaTarget):MediaReference[]{
 const ids=new Set([target.id,target.id?.replace(/^media-/,''),target.key.split('/').at(-1)?.split('.')[0]].filter(Boolean));
 const matches=(value:unknown)=>typeof value==='string'&&(value===target.url||keyFromUrl(value)===target.key);
 const found:MediaReference[]=[];
 for(const row of rows){if(!(mediaReferenceKinds as readonly string[]).includes(row.kind)||row.payload?.deletedAt||row.payload?.deleted_at||row.payload?.is_deleted===true)continue;const p=row.payload,fields=new Set<string>();
  function url(value:unknown,path:string){if(matches(value))fields.add(path)}
  function identifier(value:unknown,path:string){if(typeof value==='string'&&ids.has(value))fields.add(path)}
  function image(value:any,path:string){if(!value||typeof value!=='object')return;for(const field of ['url','imageUrl','file_url','image_url'])url(value[field],path+'.'+field);for(const field of ['id','image_id','imageId','file_id','media_id'])identifier(value[field],path+'.'+field);if(value.url||value.file_url||value.imageUrl||value.image_url||value.image_id)for(const field of ['thumbnail','thumbnailUrl','thumbnail_url'])url(value[field],path+'.'+field);}
  function content(value:any,path=''){if(!value||typeof value!=='object')return;const hasImage=!!(value.imageUrl||value.image_url||value.featured_image_url||value.file_url||value.media_url||value.image_id||value.imageId||value.featured_image_id);for(const field of ['imageUrl','image_url','featured_image_url','file_url','media_url','logoUrl','logo_url','coverImageUrl','cover_image_url'])url(value[field],path+field);for(const field of ['image_id','imageId','featured_image_id','media_id','logo_id'])identifier(value[field],path+field);if(hasImage){for(const field of ['thumbnailUrl','thumbnail_url'])url(value[field],path+field);identifier(value.thumbnail_id,path+'thumbnail_id');}for(const field of ['gallery','gallery_images','images'])if(Array.isArray(value[field]))value[field].forEach((item:any,index:number)=>typeof item==='string'?url(item,path+field+'.'+index):image(item,path+field+'.'+index));}
  if(row.kind==='public_home'){url(p.logoUrl,'logoUrl');url(p.logoMarkUrl,'logoMarkUrl');if(Array.isArray(p.heroSlides)&&p.heroSlides.length)p.heroSlides.forEach((slide:any,index:number)=>image(slide,'heroSlides.'+index));else url(p.heroImageUrl,'heroImageUrl');identifier(p.hero_image_id,'hero_image_id');if(Array.isArray(p.socialAccounts))p.socialAccounts.forEach((account:any,index:number)=>content(account,'socialAccounts.'+index+'.'));}
  else if(row.kind==='generated_report'){// Reports render explicit cover/attachment images, not copied analytics/source data.
   for(const field of ['coverImageUrl','cover_image_url'])url(p[field],field);if(Array.isArray(p.images))p.images.forEach((item:any,index:number)=>image(item,'images.'+index));
  }else{content(p);for(const field of ['body','public_article'])if(typeof p[field]==='string'){for(const match of p[field].matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi))url(match[1],field+'.image');for(const match of p[field].matchAll(/!\[[^\]]*\]\(\s*([^\s)]+)(?:\s+[^)]*)?\)/g))url(match[1],field+'.image');}}
  if(!fields.size)continue;const contentType=row.kind==='public_home'?'Hero Banner':row.kind==='programme_profile'?'Brand Page':row.kind==='public_partner'?'Partner':row.kind==='public_event'?'Event':row.kind==='generated_report'?'Report':row.kind==='content_plan'?'Planned Content':row.kind==='posts'?'Post':row.kind==='public_social_account'?'Social Account':p.featured?'Community Highlight':'Story';
  found.push({contentType,recordId:row.id,title:String(p.displayName||p.title||p.brand||p.heroTitle||p.period?.label||p.name||row.id),fields:[...fields]});
 }
 return found;
}
export function referenceError(references:MediaReference[]){return 'Cannot delete image.\nCurrently used by:\n'+references.map(ref=>'- '+ref.contentType+': '+ref.title).join('\n');}
export function logBlockedMedia(target:MediaTarget,references:MediaReference[]){console.info('media_delete_blocked',{imageId:target.id||target.key,fileName:target.name||target.key.split('/').at(-1),references:references.map(ref=>({contentType:ref.contentType,recordId:ref.recordId,fields:ref.fields}))});}
