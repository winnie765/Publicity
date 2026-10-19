import {supabaseRPC,type SupabaseEnvironment} from './supabase-client';
import type {AICache} from './intelligence/types';
export function getSupabaseAIRuntime(env:SupabaseEnvironment&Record<string,unknown>,fetcher:typeof fetch=fetch){const rpc=supabaseRPC(env,fetcher),cache:AICache={
 read:cache_id=>rpc('portal_ai_cache_action',{action:'read',cache_id}),
 reserve:(cache_id,now_ms,daily_limit)=>rpc('portal_ai_cache_action',{action:'reserve',cache_id,now_ms,daily_limit,token:crypto.randomUUID()}),
 async save(cache_id,token,content,expiry){await rpc('portal_ai_cache_action',{action:'save',cache_id,token,content,expiry});},
 async release(cache_id,token,expiry){await rpc('portal_ai_cache_action',{action:'release',cache_id,token,expiry});}
 };return {cache,config:{provider:String(env.AI_PROVIDER||'gemini'),apiKey:env.GEMINI_API_KEY?String(env.GEMINI_API_KEY):undefined,model:String(env.GEMINI_MODEL||'gemini-2.5-flash')},dailyLimit:Math.max(0,Math.min(1000,Number(env.AI_DAILY_LIMIT??'40')||0))};}
