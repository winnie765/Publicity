import {getPrismaClient} from './prisma-client';
import {supabaseRPC,useSupabase as usesSupabaseDatabase} from './supabase-client';

export type LoginResult={status:string;expiresAt?:number;resendAt?:number;attemptsLeft?:number};
// Dedicated, non-workspace storage: no authentication state enters exports/public data.
export async function loginOperation(action:string,input:Record<string,unknown>):Promise<LoginResult>{
 if(usesSupabaseDatabase(process.env))return supabaseRPC(process.env)<LoginResult>('portal_login_step',{operation:action,input});
 const rows=await getPrismaClient().$queryRawUnsafe<Array<{result:LoginResult}>>('SELECT public.portal_login_step($1::text,$2::jsonb) AS result',action,JSON.stringify(input));
 return rows[0].result;
}
