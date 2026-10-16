export type GalleryImage={url:string;alt:string;thumbnail?:string};
export type PostContent={featured_image_url?:string;featured_image_alt_text?:string;thumbnail_url?:string;gallery_images?:GalleryImage[];show_on_public_site?:boolean;show_on_home_page?:boolean;show_in_community_highlights?:boolean;show_in_stories?:boolean;show_on_programme_page?:boolean;public_summary?:string;public_article?:string;public_category?:string};
export const mediaFolders=['facebook','instagram','workvivo','stories','events','community-highlights','homepage','programmes','partners','general'] as const;
export const contentFields=['featured_image_url','featured_image_alt_text','thumbnail_url','gallery_images','show_on_public_site','show_on_home_page','show_in_community_highlights','show_in_stories','show_on_programme_page','public_summary','public_article','public_category'] as const;
export const visibilityFields=['show_on_public_site','show_on_home_page','show_in_community_highlights','show_in_stories','show_on_programme_page'] as const;
export const maxImageBytes=10*1024*1024;
export const maxGalleryImages=20;
export function assetKey(value:string){const match=/^\/api\/media\?key=([^&]+)$/.exec(value);if(!match)return '';try{const key=decodeURIComponent(match[1]);return /^(facebook|instagram|workvivo|stories|events|community-highlights|homepage|programmes|partners|general)\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key)?key:''}catch{return ''}}
export function safeContentImage(value:string){if(!value)return '';if(assetKey(value))return value;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
export function validateGallery(value:unknown):GalleryImage[]{if(value===undefined)return [];if(!Array.isArray(value)||value.length>maxGalleryImages)throw Error('Choose up to twenty gallery images.');return value.map(v=>{if(!v||typeof v.url!=='string'||v.url.length>2000||!safeContentImage(v.url)||typeof v.alt!=='string'||v.alt.length>500||v.thumbnail!==undefined&&(typeof v.thumbnail!=='string'||!safeContentImage(v.thumbnail)))throw Error('Check gallery image paths and descriptions.');return {url:v.url,alt:v.alt.trim(),...(v.thumbnail?{thumbnail:v.thumbnail}:{})}})}
export function validateContent(value:PostContent,platform?:string,status?:string){
 for(const key of ['featured_image_url','thumbnail_url'] as const)if(value[key]!==undefined&&(typeof value[key]!=='string'||value[key]!.length>2000||value[key]&&!safeContentImage(value[key]!)))throw Error('Choose an uploaded image or a public HTTPS image URL.');
 for(const key of visibilityFields)if(value[key]!==undefined&&typeof value[key]!=='boolean')throw Error('Choose a valid public visibility setting.');
 for(const [key,max] of [['featured_image_alt_text',500],['public_summary',1800],['public_article',20000],['public_category',100]] as const)if(value[key]!==undefined&&(typeof value[key]!=='string'||value[key]!.length>max))throw Error('Check the length of the public text fields.');
 const gallery=validateGallery(value.gallery_images);
 if(platform==='Workvivo'&&visibilityFields.some(k=>value[k]))throw Error('Workvivo posts and images remain private.');
 if(platform!=='Workvivo'&&[value.featured_image_url,value.thumbnail_url,...gallery.map(g=>g.url)].some(v=>v&&assetKey(v).startsWith('workvivo/')))throw Error('Workvivo images cannot be published as external content.');
 if(value.show_on_public_site&&status!=='draft'){if(!value.public_summary?.trim())throw Error('Add an approved public summary before publishing.');if(value.featured_image_url&&!value.featured_image_alt_text?.trim())throw Error('Add a description for the featured image.');}
}
export function validatePublicImages(urls:string[]){if(urls.some(v=>assetKey(v).startsWith('workvivo/')))throw Error('Workvivo images remain private.');}
