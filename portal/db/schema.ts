import {sql} from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {id:text('id').primaryKey(), kind:text('kind').notNull(), payload:text('payload').notNull(), updatedAt:text('updated_at').notNull(),recordDate:integer('record_date',{mode:'timestamp_ms'})},table=>[index('records_account_dimensions_idx').on(table.kind,sql`json_extract(payload,'$.platform')`,sql`json_extract(payload,'$.account')`,table.recordDate),index('records_record_date_idx').on(table.recordDate),uniqueIndex('records_follower_account_date_unique').on(sql`json_extract(payload,'$.account')`,table.recordDate).where(sql`kind='followers' AND json_extract(payload,'$.origin')='manual'`)]);
export const audit = sqliteTable('audit', {id:text('id').primaryKey(), actor:text('actor').notNull(), action:text('action').notNull(), recordId:text('record_id').notNull(), date:text('date').notNull()});

// Legacy archival table; not an active follower source or write target.
export const facebookFollowers=sqliteTable('facebook_followers',{id:text('id').primaryKey(),snapshotDate:integer('snapshot_date',{mode:'timestamp_ms'}).notNull().unique(),followerCount:integer('follower_count').notNull(),createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull()});

export const aiCache=sqliteTable('ai_cache',{id:text('id').primaryKey(),payload:text('payload').notNull(),expiresAt:integer('expires_at',{mode:'timestamp_ms'}).notNull(),leaseUntil:integer('lease_until',{mode:'timestamp_ms'}).notNull(),leaseToken:text('lease_token').notNull(),requests:integer('requests').notNull()});
