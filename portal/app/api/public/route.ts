import {publishedPublicSnapshot,publicResponseRevision} from '../../../lib/public-site-cache';
import {publicPageData} from '../../../lib/public-page-data';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const started=performance.now();
 try{
  const params=new URL(request.url).searchParams,view=params.get('view'),slug=params.get('slug')||'';
  const snapshot=await publishedPublicSnapshot(),etag='"'+publicResponseRevision(snapshot.revision,view,slug)+'"';
  const headers={'Cache-Control':'public, max-age=0, must-revalidate','Access-Control-Allow-Origin':'*','ETag':etag,'X-Public-Generated-At':snapshot.generatedAt,'Server-Timing':`public;dur=${(performance.now()-started).toFixed(1)}, source_read;dur=${snapshot.timings.readMs.toFixed(1)}, projection;dur=${snapshot.timings.transformMs.toFixed(1)}`};
  if(request.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers});
  return Response.json(view&&['home','community','programmes','impact','stories','article','programme','activities','partners','event'].includes(view)?publicPageData(snapshot.data,view,slug):snapshot.data,{headers});
 }catch{return Response.json({stories:[],brands:[],impact:null,unavailable:true},{status:503,headers:{'Cache-Control':'no-store'}});}
}
