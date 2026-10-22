/** Runtime connections only. Prisma migrations keep using DIRECT_URL unchanged. */
export function runtimeDatabaseUrl(value:string){
 const url=new URL(value);
 if(!['postgres:','postgresql:'].includes(url.protocol))return value;
 const sharedSupabase=/\.pooler\.supabase\.com$/i.test(url.hostname);
 if(sharedSupabase&&['','5432','6543'].includes(url.port)){
  url.port='6543';
  url.searchParams.set('pgbouncer','true');
  url.searchParams.set('connection_limit','1');
  if(!url.searchParams.has('sslmode'))url.searchParams.set('sslmode','require');
 }else if(!url.searchParams.has('connection_limit'))url.searchParams.set('connection_limit','1');
 if(!url.searchParams.has('pool_timeout'))url.searchParams.set('pool_timeout','30');
 return url.toString();
}
