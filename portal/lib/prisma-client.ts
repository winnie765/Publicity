import {PrismaClient} from '@prisma/client';
import {runtimeDatabaseUrl} from './database-url';
const shared=globalThis as unknown as {portalPrisma?:PrismaClient};
export function getPrismaClient(){
 if(!process.env.DATABASE_URL)throw Error('The database connection is not configured. Add DATABASE_URL and DIRECT_URL in the hosting settings.');
 return shared.portalPrisma??(shared.portalPrisma=new PrismaClient({datasources:{db:{url:runtimeDatabaseUrl(process.env.DATABASE_URL)}}}));
}
