import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Article engagement tables
export const articleLikes = pgTable('article_likes', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	articleId: text('article_id').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const articleBookmarks = pgTable('article_bookmarks', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	articleId: text('article_id').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const articleComments = pgTable('article_comments', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	articleId: text('article_id').notNull(),
	text: text('text').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Reading history table
export const readingHistory = pgTable('reading_history', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	articleId: text('article_id').notNull(),
	readAt: timestamp('read_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	readDuration: integer('read_duration'), // in seconds
	readPercentage: integer('read_percentage') // 0-100
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
		.unique(),
	emailNotifications: text('email_notifications').default('weekly'), // 'none', 'daily', 'weekly'
	pushNotifications: text('push_notifications').default('important'), // 'none', 'all', 'important'
	preferredLanguage: text('preferred_language').default('en'), // 'en', 'sw'
	preferredCategories: text('preferred_categories'), // JSON array of categories
	theme: text('theme').default('system'), // 'light', 'dark', 'system'
	timezone: text('timezone').default('Africa/Nairobi'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type ArticleLike = typeof articleLikes.$inferSelect;
export type ArticleBookmark = typeof articleBookmarks.$inferSelect;
export type ArticleComment = typeof articleComments.$inferSelect;
export type ReadingHistory = typeof readingHistory.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
