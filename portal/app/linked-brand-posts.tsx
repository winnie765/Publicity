import Link from 'next/link';
import type {Dataset} from './model';
import {linkedBrandNames,linkedBrandScope,publishingBrand} from '../lib/internal-brand-links';
import type {Filters} from '../lib/intelligence/types';
export default function LinkedBrandPosts({data,filters}:{data:Dataset;filters:Filters}){
 if(!filters.brand)return null;
 const posts=linkedBrandScope(data,filters);
 if(!posts.length)return null;
 return <details className="dashboard-metric-notes"><summary>Linked collaboration posts ({posts.length})</summary><p>Published by another account and linked to {filters.brand}. These are excluded from this brand’s directly published post and engagement totals. Organisation totals count each source once.</p><ul>{posts.slice(0,12).map(p=><li key={p.id}><Link href={'/workspace/posts?view='+encodeURIComponent(p.id)}>{p.title}</Link> — Original brand: {publishingBrand(p,data.config)}; linked: {linkedBrandNames(p,data.config).join(', ')}; {p.platform}; {p.date}</li>)}</ul><Link href={'/workspace/posts?brand='+encodeURIComponent(filters.brand)+'&attribution=linked'}>View all linked records and their measurements</Link></details>;
}
