import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const conversations = pgTable('orpheus_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('orpheus_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  role: text('role').notNull(), // 'user' | 'ai'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
