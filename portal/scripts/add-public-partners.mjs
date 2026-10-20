import fs from 'node:fs';
import {PrismaClient} from '@prisma/client';
import {createHash} from 'node:crypto';
if(fs.existsSync('.env.local'))process.loadEnvFile('.env.local');
const partners=JSON.parse(fs.readFileSync(new URL('./data/additional-public-partners.json',import.meta.url),'utf8'));
const normalize=value=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
const db=new PrismaClient();
try{
 const before=await db.record.findMany({where:{kind:'public_partner'}}),existingNames=new Set(before.map(r=>normalize(r.payload.title||''))),pending=partners.filter(p=>![p.title,...p.aliases].some(n=>existingNames.has(normalize(n))));
 console.log(JSON.stringify({existing:before.length,toAdd:pending.map(p=>p.title),apply:process.argv.includes('--apply')}));
 if(process.argv.includes('--apply')){
  for(const p of pending){if(!p.imageUrl)continue;try{const r=await fetch(p.imageUrl,{signal:AbortSignal.timeout(15000)});if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))p.imageUrl='';await r.body?.cancel();}catch{p.imageUrl='';}}
  const hash=r=>createHash('sha256').update(JSON.stringify(r.payload)).digest('hex'),prior=new Map(before.map(r=>[r.id,hash(r)]));
  await db.$transaction(async tx=>{const current=await tx.record.findMany({where:{kind:'public_partner'}}),names=new Set(current.map(r=>normalize(r.payload.title||''))),additions=[];let order=Math.max(-1,...current.map(r=>r.payload.sortOrder||0))+1;for(const p of pending){if([p.title,...p.aliases].some(n=>names.has(normalize(n))))continue;const {aliases,...payload}=p;additions.push({id:p.id,kind:'public_partner',payload:{...payload,published:true,sortOrder:order++}});names.add(normalize(p.title));}if(additions.length){await tx.record.createMany({data:additions});await tx.audit.createMany({data:additions.map(r=>({id:crypto.randomUUID(),actor:'Workspace staff',action:'Add requested public partner',recordId:r.id}))});}},{maxWait:10000,timeout:60000});
  const after=await db.record.findMany({where:{kind:'public_partner'}});if(before.some(r=>!after.some(v=>v.id===r.id&&hash(v)===prior.get(r.id))))throw Error('Existing partner verification failed.');
  console.log(JSON.stringify({total:after.length,added:after.length-before.length,existingPartnersUnchanged:true,newPartners:after.filter(r=>!prior.has(r.id)).map(r=>({title:r.payload.title,logoAvailable:!!r.payload.imageUrl}))}));
 }
}catch(e){console.error('Partner update failed: '+(e.code||e.message));process.exitCode=1;}finally{await db.$disconnect();}
