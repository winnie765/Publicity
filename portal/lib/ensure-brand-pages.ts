import type {Storage,Change} from './storage-contract';
import {brandPagesMarker,defaultBrandCopy,defaultBrandPage} from './brand-pages';
/** Register the already-public built-in brands once; never reseed a deleted page. */
export async function ensureBrandPages(store:Storage){
 let rows=await store.readRecords(['config','cms_initialization','programme_profile']);if(rows.some(r=>r.id===brandPagesMarker))return;rows=[...rows,...await store.readRecords(['trash','archive'])];
 const now=new Date().toISOString(),changes:Change[]=[];
 for(const brand of Object.keys(defaultBrandCopy)){
  const removed=rows.some(r=>['trash','archive'].includes(r.kind)&&r.payload.original?.kind==='programme_profile'&&r.payload.original.payload.brand===brand);
  if(!removed&&!rows.some(r=>r.kind==='programme_profile'&&r.payload.brand===brand))changes.push({type:'insert',record:{id:defaultBrandPage(brand).id,kind:'programme_profile',payload:defaultBrandPage(brand),updatedAt:now}});
 }
 changes.push({type:'insert',record:{id:brandPagesMarker,kind:'cms_initialization',payload:{brands:Object.keys(defaultBrandCopy)},updatedAt:now}});
 try{await store.apply(changes);}catch(error){if(!(await store.readRecords()).some(r=>r.id===brandPagesMarker))throw error;}
}
