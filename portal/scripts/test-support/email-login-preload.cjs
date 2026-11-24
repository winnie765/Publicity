// Isolated browser fixture. No production endpoints, real emails or persisted codes.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node --require needs a CommonJS bootstrap before Next starts.
const fs=require('node:fs'),path=require('node:path'),original=global.fetch;
const ready=import('../../.sites-runtime/otp-sql-tools/package/dist/index.js').then(async({PGlite})=>{const db=new PGlite();await db.exec(fs.readFileSync(path.resolve('supabase/migrations/20261124000000_email_login.sql'),'utf8'));return db;});
global.fetch=async(input,init)=>{
 const url=String(input instanceof Request?input.url:input);
 if(url==='https://api.resend.com/emails'){
  const mail=JSON.parse(init.body),code=mail.text.match(/\n(\d{6})\n/)[1];
  process.send?.({type:'test-otp',code});return Response.json({id:'test-mail'});
 }
 if(url.startsWith('https://otp-test.invalid/')){
  const name=new URL(url).pathname.split('/').at(-1),args=JSON.parse(init.body||'{}');
  if(name==='portal_login_step'){const db=await ready;return Response.json((await db.query('SELECT public.portal_login_step($1,$2::jsonb) AS result',[args.operation,JSON.stringify(args.input)])).rows[0].result);}
  if(name==='portal_read_record')return Response.json(null);
  if(['portal_read_records','portal_read_records_scoped','portal_read_records_by_ids','portal_read_audit'].includes(name))return Response.json([]);
  throw Error('Unsupported isolated browser RPC');
 }
 return original(input,init);
};
