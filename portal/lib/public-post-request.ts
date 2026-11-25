import {readApiResponse} from './api-response';
import {publicPostIdentity,type PublicPost} from './public-post-intelligence';
/** One bounded request. A timeout is ambiguous: check saved records before retrying. */
export async function publicPostRequest(body?:unknown,fetcher:typeof fetch=fetch,timeoutMs=30000){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetcher('/api/public-post-intelligence',{...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store' as const}),signal:controller.signal});
  const value=await readApiResponse(response);
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('The server did not confirm this operation. Check saved records before retrying.');
  if(!body&&!Array.isArray(value.posts))throw Error('Saved public posts could not be loaded. Please retry.');
  if(body&&typeof body==='object'&&'action' in body&&body.action==='save'){
   const post=value.post as PublicPost|undefined;
   if(!post||typeof post.url!=='string'||typeof post.id!=='string'||typeof post.organisation!=='string'||!post.verifiedAt||publicPostIdentity(post.url).id!==post.id)throw Error('The server did not confirm the saved public post. Refresh saved records before retrying.');
   const record='record' in body&&body.record&&typeof body.record==='object'?body.record:null;
   if(!record||!('url' in record)||publicPostIdentity(record.url).id!==post.id)throw Error('The saved response did not match this post. Refresh saved records before retrying.');
  }
  return value;
 }catch(error){if(controller.signal.aborted)throw Error('The request timed out. Your form is preserved. Refresh saved records to check whether saving completed before retrying.');if(error instanceof TypeError)throw Error('The connection failed. Your form is preserved. Refresh saved records before retrying.');throw error;}
 finally{clearTimeout(timer);}
}
