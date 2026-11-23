import type {ReactNode} from 'react';
import {publicTitleDensity} from '../lib/public-title-layout';

/** The article is the query container; only its inner composition changes. */
export default function PublicPostCard({title,children,className=''}:{title:string;children:ReactNode;className?:string}){
 return <article className={'ps-content-card '+className}><div className="ps-post-composition" data-title-density={publicTitleDensity(title)}>{children}</div></article>;
}
