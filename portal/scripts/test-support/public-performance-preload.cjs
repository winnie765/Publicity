// Test process only: a fake Supabase RPC service with no production connection.
const fs=require('node:fs');const original=global.fetch;
global.fetch=async(input,init)=>{
 const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 if(!url.startsWith('https://public-performance.invalid/'))return original(input,init);
 const start=Date.now(),name=new URL(url).pathname.split('/').at(-1),args=JSON.parse(init?.body||'{}');
 await new Promise(r=>setTimeout(r,100));
 let rows=JSON.parse(fs.readFileSync(process.env.PUBLIC_FIXTURE_FILE,'utf8')),result;
 if(name==='portal_read_records'||name==='portal_read_records_scoped')result=rows.filter(r=>(!args.record_kinds||args.record_kinds.includes(r.kind))&&r.id>(args.after_id||'')).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,args.page_size||500);
 else if(name==='portal_read_audit')result=[];
 else if(name==='portal_read_record')result=rows.find(r=>r.id===args.record_id)||null;
 else if(name==='portal_read_records_by_ids')result=rows.filter(r=>args.record_ids.includes(r.id));
 else if(name==='portal_apply_changes'){for(const c of args.changes){if(c.type==='upsert'||c.type==='insert'){rows=rows.filter(r=>r.id!==c.record.id);rows.push(c.record);}else if(c.type==='delete')rows=rows.filter(r=>r.id!==c.id);}fs.writeFileSync(process.env.PUBLIC_FIXTURE_FILE,JSON.stringify(rows));result=null;}
 else throw Error('Unexpected test RPC '+name);
 fs.appendFileSync(process.env.PUBLIC_FIXTURE_LOG,JSON.stringify({name,ms:Date.now()-start})+'\n');
 return Response.json(result);
};
