import type {PublicData} from '../app/public-portal';

/** Transfer only stories rendered by this route; the complete published projection stays cached. */
export function publicPageData(data:PublicData,page='home',slug=''):PublicData{
 if(page==='programme'||page==='event')return data;
 const ids=new Set<string>();
 if(page==='article'){
  ids.add(slug);
  for(const story of data.stories.filter(story=>story.showInStories!==false&&story.id!==slug).slice(0,3))ids.add(story.id);
 }else{
  const collect=(value:unknown)=>{if(Array.isArray(value)){for(const id of value)if(typeof id==='string')ids.add(id);}else if(value&&typeof value==='object')for(const item of Object.values(value))collect(item);};
  collect(data.showcases);
 }
 return {...data,stories:data.stories.filter(story=>ids.has(story.id))};
}
