import fs from 'node:fs';import {spawnSync} from 'node:child_process';
if(fs.existsSync('.env.local'))process.loadEnvFile('.env.local');
const url=process.env.DIRECT_URL||process.env.DATABASE_URL;
if(!url){console.error('Configure DIRECT_URL for the intended Supabase database.');process.exit(1);}
let target;try{target=new URL(url);}catch{console.error('The database URL is invalid.');process.exit(1);}
if(!['postgres:','postgresql:'].includes(target.protocol)){console.error('Use a PostgreSQL database URL.');process.exit(1);}
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','db','execute','--file','supabase/migrations/20261019000000_primary_database.sql','--schema','prisma/schema.prisma'],{env:{...process.env,DATABASE_URL:url,DIRECT_URL:url},encoding:'utf8'});
if(result.status!==0){console.error('Supabase schema was not applied. Check database connectivity and credentials. Existing data was not removed.');process.exit(1);}
console.log('Supabase schema applied: all twelve domain tables, private RPCs, audit and AI cache.');
