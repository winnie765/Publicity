import type {Config,Post} from '../app/model';
import {withMasterRegistry} from './master-relationships';
import type {Dataset} from '../app/model';
import type {Filters} from './intelligence/types';
import {publicationAnalyticsPosts} from './post-identity';
import {locationMatches} from './post-locations';
export function publishingBrand(post:Post,config:Config):string{
 const account=config.accounts.find(a=>a.platform===post.platform&&(post.account_id?config.masterRegistry?.accounts.find(e=>e.id===post.account_id)?.name===a.name:a.name===post.account));
 return account?.brand||post.brand;
}
export function internalBrandOptions(post:Post,config:Config){
 const registry=withMasterRegistry(config).masterRegistry!,owner=publishingBrand(post,config);
 return registry.brands.filter(b=>config.brands.includes(b.name)&&b.name!==owner&&b.name!=='Unclassified').sort((a,b)=>a.name.localeCompare(b.name,'en-SG'));
}
export function linkedBrandNames(post:Post,config:Config):string[]{
 const registry=withMasterRegistry(config).masterRegistry!;
 return (Array.isArray(post.linked_brand_ids)?post.linked_brand_ids:[]).map(id=>registry.brands.find(b=>b.id===id)?.name||'Unavailable brand ('+id+')');
}
export function postBrandAttribution(post:Post,brand:string,config:Config):'direct'|'linked'|null{
 if(publishingBrand(post,config)===brand)return 'direct';
 return post.is_collaboration_post&&linkedBrandNames(post,config).includes(brand)?'linked':null;
}
export function linkedBrandScope(data:Dataset,filters:Filters):Post[]{
 return filters.brand?publicationAnalyticsPosts(data.posts).filter(p=>postBrandAttribution(p,filters.brand!,data.config)==='linked'&&locationMatches(p.location,filters.location)&&(!filters.platform||p.platform===filters.platform)&&(!filters.account||p.account===filters.account)&&(!filters.start||p.date>=filters.start)&&(!filters.end||p.date<=filters.end)):[];
}
export function validateInternalBrandLinks(post:Post,config:Config,previous?:Post){
 if(post.linked_brand_ids===undefined)return;
 if(!Array.isArray(post.linked_brand_ids)||post.linked_brand_ids.length>100||new Set(post.linked_brand_ids).size!==post.linked_brand_ids.length||post.linked_brand_ids.some(id=>typeof id!=='string'||id.length>500))throw Error('Choose valid, distinct configured internal brands.');
 const allowed=new Set(internalBrandOptions(post,config).map(b=>b.id));
 for(const id of post.linked_brand_ids)if(!previous?.linked_brand_ids?.includes(id)&&(!post.is_collaboration_post||!allowed.has(id)))throw Error('Enable Collaboration Post and select another brand from Configuration.');
}
