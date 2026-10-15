'use client';
import type {GalleryImage} from '../lib/content-media';
export default function PublicGallery({images}:{images?:GalleryImage[]}){return images?.length?<section className="ps-story-gallery"><h2>Shared moments</h2><div className="ps-story-gallery-grid">{images.map((image,i)=><figure key={image.url+'-'+i}><a href={image.url} target="_blank" rel="noopener noreferrer"><img src={image.thumbnail||image.url} alt={image.alt||'Community activity photo '+(i+1)} loading="lazy"/></a>{image.alt&&<figcaption>{image.alt}</figcaption>}</figure>)}</div></section>:null}
