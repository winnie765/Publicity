'use client';
import './public-masonry.css';
import AdaptivePublicImage from './adaptive-public-image';
import type {GalleryImage} from '../lib/content-media';
export default function PublicGallery({images}:{images?:GalleryImage[]}){return images?.length?<section className="ps-story-gallery"><h2>Shared moments</h2><div className="ps-story-gallery-grid ps-masonry">{images.map((image,i)=><figure key={image.url+'-'+i}><div className="ps-gallery-image"><AdaptivePublicImage src={image.thumbnail||image.url} originalSrc={image.url} variant="gallery" alt={image.alt||'Community activity photo '+(i+1)}/></div>{image.alt&&<figcaption>{image.alt}</figcaption>}</figure>)}</div></section>:null}
