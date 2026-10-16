import {workspaceGuard} from '../../../lib/workspace-security';
import {getStorage} from '../../../lib/storage';
import {getMediaStorage} from '../../../lib/media-storage';
import {maxVideoBytes,storeVideo} from '../../../lib/video-media';
export const dynamic='force-dynamic';
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{if(Number(request.headers.get('content-length')||0)>maxVideoBytes+65536)return Response.json({error:'Choose video no larger than 25 MB.'},{status:413});const form=await request.formData(),file=form.get('file');if(!file||typeof file==='string')throw Error('Choose a video.');return Response.json(await storeVideo(getStorage(),getMediaStorage(),file,String(form.get('folder')||'')),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Video upload failed.'},{status:400});}}
