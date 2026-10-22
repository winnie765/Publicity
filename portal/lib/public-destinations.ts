import type {PostContent} from './content-media';

export type PublicDestination='private'|'highlights'|'stories'|'programme'|'homepage';
const fields={highlights:'show_in_community_highlights',stories:'show_in_stories',programme:'show_on_programme_page',homepage:'show_on_home_page'} as const;

export function selectedDestinations(post:PostContent):PublicDestination[]{
  if(!post.show_on_public_site)return ['private'];
  return (Object.keys(fields) as (keyof typeof fields)[]).filter(key=>post[fields[key]]||key==='highlights'&&post.show_on_home_page);
}

export function toggleDestination(post:PostContent,destination:PublicDestination):Partial<PostContent>{
  const selected=new Set(selectedDestinations(post).filter(key=>key!=='private'));
  if(destination==='private')selected.clear();
  else if(selected.has(destination)){
    selected.delete(destination);
    if(destination==='highlights')selected.delete('homepage');
  }else{
    selected.add(destination);
    if(destination==='homepage')selected.add('highlights');
  }
  return {show_on_public_site:selected.size>0,show_on_home_page:selected.has('homepage'),show_in_community_highlights:selected.has('highlights'),show_in_stories:selected.has('stories'),show_on_programme_page:selected.has('programme')};
}
