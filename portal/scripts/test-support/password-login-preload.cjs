// Isolated production-browser fixture; no real database, email or AI connections.
const original=global.fetch,aiCache=new Map();let records=new Map();
global.fetch=async(input,init)=>{
 const url=String(input instanceof Request?input.url:input);
 if(url.includes('api.resend.com'))throw Error('Email delivery is not part of password login.');
 if(url.startsWith('https://generativelanguage.googleapis.com/')){
  if(process.env.AI_QUALITY_BROWSER!=='1')throw Error('Live AI is disabled in this fixture.');
  process.send?.({type:'test-ai-request'});return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({title:'Community invitation',draft:'Join GLOW for a proposed community activity. [Confirm details]'})}]}}]});
 }
 if(url.startsWith('https://password-test.invalid/')){
  const name=new URL(url).pathname.split('/').at(-1),args=JSON.parse(init.body||'{}');
  if(name==='portal_read_record')return Response.json(records.get(args.record_id)||null);
  if(name==='portal_read_records_by_ids')return Response.json([...records.values()].filter(r=>args.record_ids.includes(r.id)));
  if(name==='portal_read_records'||name==='portal_read_records_scoped')return Response.json([...records.values()].filter(r=>(!args.record_kinds||args.record_kinds.includes(r.kind))&&r.id>(args.after_id||'')).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,args.page_size||500));
  if(name==='portal_read_audit')return Response.json([]);
  if(name==='portal_apply_changes'){const next=new Map(records);for(const c of args.changes){if(c.type==='insert'&&next.has(c.record.id))return new Response('Record ID conflict',{status:409});if(c.type==='insert'||c.type==='upsert')next.set(c.record.id,c.record);else if(['purge','delete'].includes(c.type))next.delete(c.id);}records=next;return Response.json(null);}
  if(name==='portal_ai_cache_action'&&process.env.AI_QUALITY_BROWSER==='1'){
   if(args.action==='read')return Response.json(aiCache.get(args.cache_id)||null);
   if(args.action==='reserve')return Response.json(args.token);
   if(args.action==='save')aiCache.set(args.cache_id,{payload:args.content,expiresAt:args.expiry});return Response.json(null);
  }
  throw Error('Unsupported isolated browser operation.');
 }
 return original(input,init);
};
