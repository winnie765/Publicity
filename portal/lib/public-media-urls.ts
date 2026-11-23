import type {GalleryImage} from './content-media';
type ImageRecord={imageUrl:string;thumbnailUrl?:string;gallery?:GalleryImage[]};
/** One public-reference policy for media authorisation and dimension projection. */
export function publicMediaUrls(data:{home?:{heroVisible?:boolean;heroImageUrl?:string;heroSlides?:GalleryImage[]};stories:(ImageRecord&{media_url?:string})[];events:ImageRecord[];partners:{imageUrl:string}[];programmes:ImageRecord[]}){
 const home=data.home;return [
  ...(home&&home.heroVisible!==false?[home.heroImageUrl||'',...(home.heroSlides||[]).flatMap(image=>[image.url,image.thumbnail||''])]:[]),
  ...data.stories.flatMap(s=>[s.media_url||'',s.imageUrl,s.thumbnailUrl||'',...(s.gallery||[]).flatMap(g=>[g.url,g.thumbnail||''])]),
  ...data.events.flatMap(e=>[e.imageUrl,e.thumbnailUrl||'',...(e.gallery||[]).flatMap(g=>[g.url,g.thumbnail||''])]),
  ...data.partners.map(p=>p.imageUrl),...data.programmes.flatMap(p=>[p.imageUrl,...(p.gallery||[]).flatMap(g=>[g.url,g.thumbnail||''])]),
 ];
}
