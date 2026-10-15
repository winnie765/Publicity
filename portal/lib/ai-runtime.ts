import {PrismaClient} from '@prisma/client';
import type {AICache} from './intelligence/types';
const globalDB=globalThis as unknown as {portalPrisma?:PrismaClient};
export function getAIRuntime(){const db=globalDB.portalPrisma??(globalDB.portalPrisma=new PrismaClient()),epoch=new Date(0);
 const cache:AICache={
  async read(id){const row=await db.aICache.findUnique({where:{id}});return row?{payload:row.payload,expiresAt:row.expiresAt.getTime()}:null;},
  async reserve(id,now,limit){const token=crypto.randomUUID(),budget='budget:'+new Date(now).toISOString().slice(0,10);try{return await db.$transaction(async tx=>{await tx.aICache.upsert({where:{id:budget},create:{id:budget,payload:'',expiresAt:new Date(now+2*86400000),leaseUntil:epoch,leaseToken:'',requests:0},update:{}});const quota=await tx.aICache.updateMany({where:{id:budget,requests:{lt:limit}},data:{requests:{increment:1}}});if(!quota.count)throw Error('AI quota reached.');await tx.aICache.deleteMany({where:{expiresAt:{lt:new Date(now-7*86400000)},leaseUntil:{lte:new Date(now)}}});await tx.aICache.upsert({where:{id},create:{id,payload:'',expiresAt:epoch,leaseUntil:epoch,leaseToken:'',requests:0},update:{}});const lease=await tx.aICache.updateMany({where:{id,leaseUntil:{lte:new Date(now)},expiresAt:{lte:new Date(now)}},data:{leaseUntil:new Date(now+90_000),leaseToken:token}});if(!lease.count)throw Error('AI generation is in progress.');return token;});}catch{return null;}},
  async save(id,token,payload,expiry){await db.aICache.updateMany({where:{id,leaseToken:token},data:{payload,expiresAt:new Date(expiry),leaseUntil:epoch,leaseToken:''}});},
  async release(id,token,expiry){await db.aICache.updateMany({where:{id,leaseToken:token},data:{leaseUntil:new Date(expiry),leaseToken:''}});}
 };
 return {config:{provider:process.env.AI_PROVIDER||'gemini',apiKey:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL||'gemini-2.5-flash'},dailyLimit:Math.max(0,Math.min(1000,Number(process.env.AI_DAILY_LIMIT??'40')||0)),cache};
}
