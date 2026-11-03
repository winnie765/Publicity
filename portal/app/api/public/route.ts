import {databaseImageSource} from '../../../lib/content-media';
import {getStorage} from '../../../lib/storage';
import {publicPortalData} from '../../../lib/workspace-service';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{if(new URL(request.url).searchParams.get('branding')==='1'){const home=(await getStorage().readRecords(['public_home'])).find(row=>row.id==='public-home-settings')?.payload;return Response.json({logoUrl:databaseImageSource(home?.logoUrl||''),logoMarkUrl:databaseImageSource(home?.logoMarkUrl||'')},{headers:{'Cache-Control':'no-store'}})}return Response.json(await publicPortalData(getStorage()),{headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}})}catch{return Response.json({stories:[],brands:[],impact:null,unavailable:true},{status:503,headers:{'Cache-Control':'no-store'}})}}
