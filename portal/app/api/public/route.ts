import {getStorage} from '../../../lib/storage';
import {publicPortalData} from '../../../lib/workspace-service';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await publicPortalData(getStorage()),{headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}})}catch{return Response.json({stories:[],brands:[],impact:null,unavailable:true},{status:503,headers:{'Cache-Control':'no-store'}})}}
