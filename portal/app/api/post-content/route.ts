import {getStorage} from '../../../lib/storage';
import {workspaceGuard} from '../../../lib/workspace-security';
import {loadData,applyDataAction} from '../../../lib/data-service';
import {contentFields,validateContent} from '../../../lib/content-media';
export const dynamic='force-dynamic';
export async function POST(request:Request){const denied=await workspaceGuard(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>64000)throw Error('Public content is too large.');const body=JSON.parse(raw),store=getStorage(),data=await loadData(store),post=data.posts.find(p=>p.id===body.id);if(!post)throw Error('Choose an existing post.');const patch=Object.fromEntries(contentFields.filter(k=>body.content?.[k]!==undefined).map(k=>[k,body.content[k]])),updated={...post,...patch};validateContent(updated,updated.platform,updated.status);return Response.json(await applyDataAction(store,{action:'upsert',kind:'posts',items:[updated]}),{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'The public content could not be saved.'},{status:400})}}
