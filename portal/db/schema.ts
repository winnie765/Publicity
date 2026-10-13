import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {id:text('id').primaryKey(), kind:text('kind').notNull(), payload:text('payload').notNull(), updatedAt:text('updated_at').notNull()});
export const audit = sqliteTable('audit', {id:text('id').primaryKey(), actor:text('actor').notNull(), action:text('action').notNull(), recordId:text('record_id').notNull(), date:text('date').notNull()});
