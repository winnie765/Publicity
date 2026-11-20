import {connection} from 'next/server';
import PublicPortal,{type PublicPortalProps} from './public-portal';
import {publishedPublicSnapshot,publicResponseRevision} from '../lib/public-site-cache';
import {publicPageData} from '../lib/public-page-data';

/** Request rendering avoids database access during build; the public projection is shared. */
export default async function PublicPage(props:Omit<PublicPortalProps,'initialData'|'preview'>){
 await connection();
 try{
  const snapshot=await publishedPublicSnapshot();
  return <PublicPortal {...props} initialData={publicPageData(snapshot.data,props.page,props.slug)} initialRevision={publicResponseRevision(snapshot.revision,props.page||'home',props.slug)} generatedAt={snapshot.generatedAt}/>;
 }catch{
  return <PublicPortal {...props} initialUnavailable/>;
 }
}
