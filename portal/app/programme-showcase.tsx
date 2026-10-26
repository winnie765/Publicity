import type {ReactNode} from 'react';
import {Check} from 'lucide-react';
import type {PublicData} from './public-portal';
import type {PublicStory} from './public-components';
import './programme-showcase.css';
export {defaultBrandCopy as programmeCopy} from '../lib/brand-pages';
import {defaultBrandCopy as programmeCopy} from '../lib/brand-pages';
export default function ProgrammeShowcase({data}:{data:PublicData;renderStories:(stories:PublicStory[])=>ReactNode}){
 const order=['SEEN','GLOW','Longevity Courtyard'],brands=[...data.brands].sort((a,b)=>(order.includes(a)?order.indexOf(a):100)-(order.includes(b)?order.indexOf(b):100));
 return <div className="ps-programme-showcase-grid">{brands.map(brand=>{const copy=programmeCopy[brand],profile=data.programmes.find(p=>p.brand===brand),image=profile?profile.imageUrl:copy?.image||'/images/community-kitchen.jpg';return <article className="ps-programme-showcase" id={'programme-'+encodeURIComponent(brand.toLowerCase())} key={brand}><div className="ps-programme-showcase-image">{image&&<img src={image} alt={profile?.imageUrl?profile.imageAlt||brand+' programme':copy?.alt||brand+' community activity'} loading="lazy"/>}</div><div className="ps-programme-showcase-body"><span className="ps-eyebrow">TZU CHI COMMUNITY CARE</span><h3>{profile?.displayName||brand}</h3>{(profile?.subtitle??copy?.subtitle)&&<p className="ps-programme-subtitle">{profile?.subtitle??copy?.subtitle}</p>}<p className="ps-programme-description">{profile?.overview||copy?.description||'Explore community activities, shared experiences and stories from '+brand+'.'}</p>{(profile?.focusAreas??copy?.focus??[]).length>0&&<div className="ps-programme-focus"><h4>Key Focus Areas</h4><ul>{(profile?.focusAreas??copy?.focus??[]).map(area=><li key={area}><Check size={15} aria-hidden="true"/>{area}</li>)}</ul></div>}</div></article>})}</div>;
}
