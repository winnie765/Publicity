import {env} from 'cloudflare:workers';
import type {AICache} from './intelligence/types';
export function getAIRuntime(){const db=env.DB;if(!db)throw Error('The hosted database is unavailable.');
 const cache:AICache={
  async read(id){const row=await db.prepare('SELECT payload,expires_at FROM ai_cache WHERE id=?').bind(id).first<any>();return row?{payload:row.payload,expiresAt:row.expires_at}:null;},
  async reserve(id,now,limit){const token=crypto.randomUUID(),budget='budget:'+new Date(now).toISOString().slice(0,10);const result=await db.batch([
   db.prepare('DELETE FROM ai_cache WHERE id IN (SELECT id FROM ai_cache WHERE expires_at<? AND lease_until<=? LIMIT 100)').bind(now-7*86400000,now),
   db.prepare('INSERT OR IGNORE INTO ai_cache(id,payload,expires_at,lease_until,lease_token,requests) VALUES(?,?,?,?,?,?)').bind(id,'',0,0,'',0),
   db.prepare("UPDATE ai_cache SET lease_until=?,lease_token=? WHERE id=? AND lease_until<=? AND expires_at<=? AND COALESCE((SELECT requests FROM ai_cache WHERE id=?),0)<?").bind(now+90_000,token,id,now,now,budget,limit),
   db.prepare('INSERT INTO ai_cache(id,payload,expires_at,lease_until,lease_token,requests) SELECT ?,?,?,?,?,1 WHERE EXISTS(SELECT 1 FROM ai_cache WHERE id=? AND lease_token=?) ON CONFLICT(id) DO UPDATE SET requests=requests+1').bind(budget,'',now+2*86400000,0,'',id,token),
   db.prepare('SELECT lease_token FROM ai_cache WHERE id=? AND lease_token=?').bind(id,token)
  ]);return (result[4].results as any[])?.length?token:null;},
  async save(id,token,payload,expiry){await db.prepare("UPDATE ai_cache SET payload=?,expires_at=?,lease_until=0,lease_token='' WHERE id=? AND lease_token=?").bind(payload,expiry,id,token).run();},
  async release(id,token,expiry){await db.prepare("UPDATE ai_cache SET lease_until=?,lease_token='' WHERE id=? AND lease_token=?").bind(expiry,id,token).run();}
 };
 return {config:{provider:env.AI_PROVIDER||'gemini',apiKey:env.GEMINI_API_KEY,model:env.GEMINI_MODEL||'gemini-2.5-flash'},dailyLimit:Math.max(0,Math.min(1000,Number(env.AI_DAILY_LIMIT??'40')||0)),cache};
}
