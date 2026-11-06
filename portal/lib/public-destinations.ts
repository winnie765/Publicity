import type {PostContent} from './content-media';

export type PublicDestination='automatic'|'private'|'stories'|'programme'|'homepage';
const fields={stories:'show_in_stories',programme:'show_on_programme_page',homepage:'show_on_home_page'} as const;

export function selectedDestinations(post:PostContent):PublicDestination[]{
  if(post.show_on_public_site===false)return ['private'];
  const selected=(Object.keys(fields) as (keyof typeof fields)[]).filter(key=>post[fields[key]]);
  return selected.length?selected:['automatic'];
}

export function toggleDestination(post:PostContent,destination:PublicDestination):Partial<PostContent>{
  const selected=new Set(selectedDestinations(post).filter(key=>key!=='private'&&key!=='automatic'));
  if(destination==='private'||destination==='automatic')selected.clear();
  else if(selected.has(destination)){
    selected.delete(destination);
  }else{
    selected.add(destination);
  }
  return {show_on_public_site:destination!=='private',show_on_home_page:selected.has('homepage'),show_in_community_highlights:false,show_in_stories:selected.has('stories'),show_on_programme_page:selected.has('programme')};
}
