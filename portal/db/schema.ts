import {sql} from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {id:text('id').primaryKey(), kind:text('kind').notNull(), payload:text('payload').notNull(), updatedAt:text('updated_at').notNull(),recordDate:integer('record_date',{mode:'timestamp_ms'})},table=>[index('records_record_date_idx').on(table.recordDate),uniqueIndex('records_facebook_manual_date_unique').on(table.recordDate).where(sql`kind='followers' AND json_extract(payload,'$.origin')='manual' AND json_extract(payload,'$.platform')='Facebook'`)]);
export const audit = sqliteTable('audit', {id:text('id').primaryKey(), actor:text('actor').notNull(), action:text('action').notNull(), recordId:text('record_id').notNull(), date:text('date').notNull()});

export const facebookFollowers=sqliteTable('facebook_followers',{id:text('id').primaryKey(),snapshotDate:integer('snapshot_date',{mode:'timestamp_ms'}).notNull().unique(),followerCount:integer('follower_count').notNull(),createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull()});
